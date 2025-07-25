import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock DataShopLogger for tests
jest.mock('@learnlab/datashop-logger', () => {
  return {
    DataShopLogger: jest.fn().mockImplementation(() => ({
      start: jest.fn().mockReturnValue('ctat_session_test-123'),
      resume: jest.fn(),
      logInterfaceAttempt: jest.fn().mockReturnValue('T123'),
      logInterfaceAttemptSAI: jest.fn().mockReturnValue('T124'),
      logResponse: jest.fn(),
    })),
  };
});