export function generateGUID(): string {
  // Check for crypto.randomUUID in both global and globalThis contexts
  const cryptoObj = (typeof globalThis !== 'undefined' && globalThis.crypto) || 
                    (typeof global !== 'undefined' && global.crypto) ||
                    (typeof window !== 'undefined' && window.crypto);
  
  if (cryptoObj && cryptoObj.randomUUID) {
    return cryptoObj.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateTransactionID(): string {
  return `T${generateGUID()}`;
}

export function generateContextMessageID(): string {
  return `C${generateGUID()}`;
}