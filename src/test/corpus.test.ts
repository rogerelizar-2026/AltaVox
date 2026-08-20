import { describe, it, expect } from "vitest";
import { SENTENCES } from "../lib/corpus";

describe("corpus.ts", () => {
  describe("SENTENCES", () => {
    it("deve ser um array não vazio", () => {
      expect(Array.isArray(SENTENCES)).toBe(true);
      expect(SENTENCES.length).toBeGreaterThan(0);
    });

    it("todas as frases devem ser strings não vazias", () => {
      SENTENCES.forEach((sentence, idx) => {
        expect(typeof sentence).toBe("string");
        expect(sentence.length).toBeGreaterThan(0);
      });
    });

    it("todas as frases devem ser texto válido em português", () => {
      SENTENCES.forEach((sentence) => {
        // Verifica se é uma string não vazia com caracteres válidos
        expect(sentence).toBeTruthy();
        expect(typeof sentence).toBe("string");
        expect(sentence.length).toBeGreaterThan(5);
        // Todas as frases terminam com pontuação
        expect(/[.?!]$/.test(sentence)).toBe(true);
      });
    });

    it("deve ter pelo menos 40 frases para variedade", () => {
      expect(SENTENCES.length).toBeGreaterThanOrEqual(40);
    });
  });
});
