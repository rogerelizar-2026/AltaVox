import { describe, it, expect } from "vitest";
import { buildVerification, generateTranscript, STAGES, totalMsFor } from "../lib/engine";
import type { AudioFileRec, SpeakerRec, VerificationRec } from "../lib/types";

// Mock de dados para testes
const createMockFile = (id: string, durationSec: number = 60): AudioFileRec => ({
  id,
  name: `teste-${id}.mp3`,
  sizeBytes: 1024 * 1024,
  sha256: `hash-${id}-abc123def456789012345678901234567890`,
  hashing: false,
  durationSec,
  analyzeError: null,
  peaks: new Array(120).fill(0.5),
  rms: 0.3,
  blobUrl: "blob:test",
  addedAt: Date.now(),
  tooLong: false,
});

const createMockSpeaker = (id: string, name: string): SpeakerRec => ({
  id,
  name,
  source: "gravada" as const,
  durationSec: 10,
  rms: 0.3,
  peaks: new Array(120).fill(0.5),
  blobUrl: "blob:test",
  quality: "boa" as const,
  createdAt: Date.now(),
});

describe("engine.ts", () => {
  describe("STAGES", () => {
    it("deve ter 4 estágios definidos", () => {
      expect(STAGES.length).toBe(4);
    });

    it("deve ter IDs válidos para cada estágio", () => {
      const ids = STAGES.map((s) => s.id);
      expect(ids).toEqual(["decode", "transcribe", "diarize", "align"]);
    });

    it("cada estágio deve ter peso positivo", () => {
      STAGES.forEach((stage) => {
        expect(stage.weight).toBeGreaterThan(0);
      });
    });

    it("a soma dos pesos deve ser aproximadamente 1", () => {
      const total = STAGES.reduce((sum, s) => sum + s.weight, 0);
      expect(total).toBeCloseTo(1, 2);
    });
  });

  describe("totalMsFor", () => {
    it("deve retornar tempo proporcional à duração do áudio", () => {
      const ms30 = totalMsFor(30);
      const ms60 = totalMsFor(60);
      expect(ms60).toBeGreaterThan(ms30);
    });

    it("deve retornar valor positivo", () => {
      expect(totalMsFor(60)).toBeGreaterThan(0);
    });
  });

  describe("buildVerification", () => {
    it("deve criar verificação com status pendente", () => {
      const file = createMockFile("test1");
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);

      expect(verification.fileId).toBe(file.id);
      expect(verification.status).toBe("pendente");
      expect(verification.decidedAt).toBeNull();
    });

    it("deve gerar turns de verificação", () => {
      const file = createMockFile("test1", 30);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);

      expect(verification.turns.length).toBeGreaterThan(0);
      expect(verification.turns.length).toBeLessThanOrEqual(3);
    });

    it("deve ter confidence entre 0.55 e 0.96 para cada turno", () => {
      const file = createMockFile("test1", 30);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);

      verification.turns.forEach((turn) => {
        expect(turn.confidence).toBeGreaterThanOrEqual(0.55);
        expect(turn.confidence).toBeLessThanOrEqual(0.96);
      });
    });

    it("deve ter speakerConf para cada falante", () => {
      const file = createMockFile("test1");
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);

      speakers.forEach((sp) => {
        expect(verification.speakerConf[sp.id]).toBeDefined();
        expect(verification.speakerConf[sp.id]).toBeGreaterThanOrEqual(0.6);
        expect(verification.speakerConf[sp.id]).toBeLessThanOrEqual(0.95);
      });
    });
  });

  describe("generateTranscript", () => {
    it("deve gerar transcrição com segmentos", () => {
      const file = createMockFile("test1", 60);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);
      const result = generateTranscript(file, speakers, verification);

      expect(result.fileId).toBe(file.id);
      expect(result.segments.length).toBeGreaterThan(0);
    });

    it("deve ter metadados do engine preenchidos", () => {
      const file = createMockFile("test1", 60);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);
      const result = generateTranscript(file, speakers, verification);

      expect(result.engine.transcriber).toBeDefined();
      expect(result.engine.diarizer).toBeDefined();
      expect(result.engine.language).toBe("Português (pt)");
      expect(result.engine.compute).toBeDefined();
    });

    it("deve gerar estatísticas por falante", () => {
      const file = createMockFile("test1", 60);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);
      const result = generateTranscript(file, speakers, verification);

      expect(result.speakerStats.length).toBe(speakers.length);
      result.speakerStats.forEach((stat) => {
        expect(stat.avgConf).toBeGreaterThanOrEqual(0);
        expect(stat.avgConf).toBeLessThanOrEqual(1);
        expect(stat.sharePct).toBeGreaterThanOrEqual(0);
        expect(stat.sharePct).toBeLessThanOrEqual(100);
      });
    });

    it("segmentos devem ter estrutura correta", () => {
      const file = createMockFile("test1", 60);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);
      const result = generateTranscript(file, speakers, verification);

      result.segments.forEach((seg) => {
        expect(seg.id).toBeDefined();
        expect(seg.start).toBeGreaterThanOrEqual(0);
        expect(seg.end).toBeGreaterThan(seg.start);
        expect(seg.speakerId).toBeDefined();
        expect(seg.speakerName).toBeDefined();
        expect(seg.text).toBeDefined();
        expect(seg.confidence).toBeGreaterThanOrEqual(0.55);
        expect(seg.confidence).toBeLessThanOrEqual(0.97);
        expect(seg.edited).toBe(false);
      });
    });

    it("deve ser determinístico (mesmo input = mesmo output)", () => {
      const file = createMockFile("test1", 60);
      const speakers = [createMockSpeaker("sp1", "João"), createMockSpeaker("sp2", "Maria")];
      const verification = buildVerification(file, speakers);

      const result1 = generateTranscript(file, speakers, verification);
      const result2 = generateTranscript(file, speakers, verification);

      expect(result1.segments.length).toBe(result2.segments.length);
      result1.segments.forEach((seg, idx) => {
        expect(seg.text).toBe(result2.segments[idx].text);
        expect(seg.start).toBe(result2.segments[idx].start);
        expect(seg.end).toBe(result2.segments[idx].end);
      });
    });
  });
});
