import { generateGUID, generateTransactionID, generateContextMessageID } from '../utils/guid';

describe('GUID utilities', () => {
  describe('generateGUID()', () => {
    it('should generate a valid UUID v4 format', () => {
      const guid = generateGUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(guid).toMatch(uuidRegex);
    });

    it('should generate unique GUIDs', () => {
      const guids = new Set<string>();
      const count = 1000;
      
      for (let i = 0; i < count; i++) {
        guids.add(generateGUID());
      }
      
      expect(guids.size).toBe(count);
    });

    it('should use crypto.randomUUID when available', () => {
      const mockRandomUUID = jest.fn().mockReturnValue('12345678-1234-4234-8234-123456789012');
      const originalCrypto = global.crypto;
      
      global.crypto = { randomUUID: mockRandomUUID } as any;
      
      const guid = generateGUID();
      
      expect(mockRandomUUID).toHaveBeenCalled();
      expect(guid).toBe('12345678-1234-4234-8234-123456789012');
      
      global.crypto = originalCrypto;
    });

    it('should fall back to Math.random when crypto.randomUUID is not available', () => {
      const originalCrypto = global.crypto;
      global.crypto = {} as any;
      
      const guid = generateGUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(guid).toMatch(uuidRegex);
      
      global.crypto = originalCrypto;
    });
  });

  describe('generateTransactionID()', () => {
    it('should generate transaction ID with T prefix', () => {
      const txId = generateTransactionID();
      
      expect(txId).toMatch(/^T[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(txId.startsWith('T')).toBe(true);
    });

    it('should generate unique transaction IDs', () => {
      const ids = new Set<string>();
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        ids.add(generateTransactionID());
      }
      
      expect(ids.size).toBe(count);
    });
  });

  describe('generateContextMessageID()', () => {
    it('should generate context message ID with C prefix', () => {
      const contextId = generateContextMessageID();
      
      expect(contextId).toMatch(/^C[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(contextId.startsWith('C')).toBe(true);
    });

    it('should generate unique context message IDs', () => {
      const ids = new Set<string>();
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        ids.add(generateContextMessageID());
      }
      
      expect(ids.size).toBe(count);
    });
  });

  describe('ID format consistency', () => {
    it('should have consistent length for all ID types', () => {
      const guid = generateGUID();
      const txId = generateTransactionID();
      const contextId = generateContextMessageID();
      
      expect(guid.length).toBe(36); // UUID v4 length
      expect(txId.length).toBe(37); // UUID + 'T' prefix
      expect(contextId.length).toBe(37); // UUID + 'C' prefix
    });
  });
});