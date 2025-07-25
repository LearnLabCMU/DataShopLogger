import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { DataShopLoggerProvider, useDataShopLogger } from '../DataShopLoggerContext';

describe('DataShopLoggerContext', () => {
  it('should provide logger context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataShopLoggerProvider configuration={{ dataset_name: 'test' }}>
        {children}
      </DataShopLoggerProvider>
    );

    const { result } = renderHook(() => useDataShopLogger(), { wrapper });

    expect(result.current.logger).toBeDefined();
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.sessionId).toBeNull();
  });

  it('should start session', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DataShopLoggerProvider configuration={{ dataset_name: 'test' }}>
        {children}
      </DataShopLoggerProvider>
    );

    const { result } = renderHook(() => useDataShopLogger(), { wrapper });

    act(() => {
      const sessionId = result.current.startSession();
      expect(sessionId).toMatch(/^ctat_session_/);
    });

    expect(result.current.sessionId).toMatch(/^ctat_session_/);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useDataShopLogger());
    }).toThrow('useDataShopLogger must be used within a DataShopLoggerProvider');

    console.error = originalError;
  });
});