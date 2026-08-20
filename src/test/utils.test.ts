import { describe, it, expect } from "vitest";
import { clamp, fmtHMS, fmtMS, fmtFriendly, fmtBytes, seedFrom, mulberry32, shortHash } from "../lib/utils";

describe("utils.ts", () => {
  describe("clamp", () => {
    it("deve limitar valor dentro do intervalo", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("fmtHMS", () => {
    it("deve formatar segundos como HH:MM:SS", () => {
      expect(fmtHMS(0)).toBe("00:00:00");
      expect(fmtHMS(65)).toBe("00:01:05");
      expect(fmtHMS(3661)).toBe("01:01:01");
    });
  });

  describe("fmtMS", () => {
    it("deve formatar segundos como MM:SS", () => {
      expect(fmtMS(0)).toBe("00:00");
      expect(fmtMS(65)).toBe("01:05");
      expect(fmtMS(3661)).toBe("61:01");
    });
  });

  describe("fmtFriendly", () => {
    it("deve formatar duração de forma amigável", () => {
      expect(fmtFriendly(30)).toBe("30 s");
      expect(fmtFriendly(90)).toBe("1 min 30 s");
      expect(fmtFriendly(120)).toBe("2 min");
      expect(fmtFriendly(3660)).toBe("1 h 1 min");
    });
  });

  describe("fmtBytes", () => {
    it("deve formatar tamanho de arquivo", () => {
      expect(fmtBytes(512)).toBe("512 B");
      expect(fmtBytes(1024)).toBe("1 KB");
      expect(fmtBytes(1536)).toBe("2 KB");
      expect(fmtBytes(1048576)).toBe("1.0 MB");
    });
  });

  describe("seedFrom", () => {
    it("deve gerar semente consistente para mesma entrada", () => {
      const seed1 = seedFrom("teste");
      const seed2 = seedFrom("teste");
      expect(seed1).toBe(seed2);
      expect(seedFrom("diferente")).not.toBe(seed1);
    });
  });

  describe("mulberry32", () => {
    it("deve gerar sequência determinística", () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(12345);
      const seq1 = [rng1(), rng1(), rng1()];
      const seq2 = [rng2(), rng2(), rng2()];
      expect(seq1).toEqual(seq2);
    });
  });

  describe("shortHash", () => {
    it("deve abreviar hash longo", () => {
      const hash = "abcdef1234567890abcdef1234567890";
      expect(shortHash(hash)).toContain("…");
      expect(shortHash(hash).length).toBeLessThan(hash.length);
    });
    it("deve retornar hash curto inalterado", () => {
      expect(shortHash("abc")).toBe("abc");
    });
  });
});
