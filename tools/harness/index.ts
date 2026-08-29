// Shared headless test harness: DOM stubs + the "bot child" driver.
export { makeStubCtx } from './makeStubCtx';
export { setupDom } from './setupDom';
export { makeBot, type Bot } from './makeBot';
export type { Listener, SetupOptions, StubDom } from './types';
