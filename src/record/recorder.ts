// Microphone recording with a live input-level meter.
export interface Take {
  blob: Blob;
  url: string;
  seconds: number;
}

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

export class Recorder {
  private stream: MediaStream | null = null;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;
  private analyser: AnalyserNode | null = null;
  private actx: AudioContext | null = null;
  private meterTimer = 0;

  constructor(private onLevel: (level: number) => void) {}

  get recording(): boolean {
    return this.rec?.state === 'recording';
  }

  // Ask for the microphone once; keep the stream so later takes start instantly.
  async prepare(): Promise<void> {
    if (this.stream) return;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.actx = new AudioContext();
    const src = this.actx.createMediaStreamSource(this.stream);
    this.analyser = this.actx.createAnalyser();
    this.analyser.fftSize = 1024;
    src.connect(this.analyser);
    const buf = new Uint8Array(this.analyser.fftSize);
    const tick = (): void => {
      this.analyser!.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
      this.onLevel(this.recording ? peak : peak * 0.35); // quiet preview while idle
      this.meterTimer = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.meterTimer);
    tick();
  }

  async start(): Promise<void> {
    await this.prepare();
    if (this.recording) return;
    const mimeType = MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
    this.rec = new MediaRecorder(this.stream!, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64_000 });
    this.chunks = [];
    this.rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.rec.start();
    this.startedAt = performance.now();
  }

  stop(): Promise<Take> {
    return new Promise((resolve, reject) => {
      const rec = this.rec;
      if (!rec || rec.state !== 'recording') return reject(new Error('not recording'));
      rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: rec.mimeType || 'audio/webm' });
        resolve({ blob, url: URL.createObjectURL(blob), seconds: (performance.now() - this.startedAt) / 1000 });
      };
      rec.onerror = () => reject(new Error('recording failed'));
      rec.stop();
    });
  }
}
