// Mock browser APIs for testing
global.navigator = {
  ...global.navigator,
  sendBeacon: jest.fn().mockReturnValue(true),
} as any;

// Ensure fetch is available (jsdom should provide it, but let's make sure)
if (!global.fetch) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue('status=success'),
  } as any);
}

// Store original crypto for tests to restore
(global as any).originalCrypto = global.crypto;