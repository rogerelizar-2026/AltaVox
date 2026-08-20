import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sha256Hex } from "../lib/audio";

describe("audio.ts", () => {
  describe("sha256Hex", () => {
    it("deve gerar hash consistente para mesma string", async () => {
      const hash1 = await sha256Hex("teste");
      const hash2 = await sha256Hex("teste");
      expect(hash1).toBe(hash2);
    });

    it("deve gerar hashes diferentes para strings diferentes", async () => {
      const hash1 = await sha256Hex("texto1");
      const hash2 = await sha256Hex("texto2");
      expect(hash1).not.toBe(hash2);
    });

    it("deve gerar hash de 64 caracteres (hex SHA-256)", async () => {
      const hash = await sha256Hex("qualquer texto");
      expect(hash.length).toBe(64);
    });

    it("deve lidar com ArrayBuffer", async () => {
      const encoder = new TextEncoder();
      const buffer = encoder.encode("dados binários").buffer as ArrayBuffer;
      const hash = await sha256Hex(buffer);
      expect(hash.length).toBe(64);
    });
  });
});
