import { describe, it, expect } from "vitest";
import { buildMarkdown, buildHtml } from "../lib/report";
import type { TranscriptResult, LogEntry } from "../lib/types";

const createMockResult = (): TranscriptResult => ({
  fileId: "test1",
  fileName: "reuniao.mp3",
  durationSec: 120,
  sha256: "abc123def456789012345678901234567890abcdef1234567890abcdef123456",
  seedHex: "seed1234567890",
  processedAt: Date.now(),
  elapsedMs: 5000,
  segments: [
    {
      id: "seg1",
      start: 0.5,
      end: 5.2,
      speakerId: "sp1",
      speakerName: "João",
      text: "Bom dia, obrigado por atender.",
      confidence: 0.85,
      edited: false,
    },
    {
      id: "seg2",
      start: 5.5,
      end: 10.3,
      speakerId: "sp2",
      speakerName: "Maria",
      text: "Bom dia! Em que posso ajudar?",
      confidence: 0.92,
      edited: false,
    },
  ],
  speakerStats: [
    { speakerId: "sp1", name: "João", avgConf: 0.85, sharePct: 45 },
    { speakerId: "sp2", name: "Maria", avgConf: 0.92, sharePct: 55 },
  ],
  engine: {
    transcriber: "faster-whisper 1.2",
    diarizer: "pyannote-audio 3.3",
    language: "Português (pt)",
    compute: "CPU · 4 threads",
  },
});

const createMockLog = (): LogEntry[] => [
  { id: "log1", at: Date.now() - 10000, kind: "import", title: "Áudio recebido" },
  { id: "log2", at: Date.now() - 5000, kind: "hash", title: "SHA-256 calculado" },
];

describe("report.ts", () => {
  describe("buildMarkdown", () => {
    it("deve gerar markdown com cabeçalho principal", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain("# Relatório de transcrição e identificação de falantes");
    });

    it("deve incluir nome do arquivo no relatório", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain(result.fileName);
    });

    it("deve incluir hash SHA-256", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain("SHA-256");
      expect(md).toContain(result.sha256);
    });

    it("deve incluir tabela de transcrição com segmentos", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain("| Início | Fim | Falante | Confiança | Texto |");
      expect(md).toContain("João");
      expect(md).toContain("Maria");
    });

    it("deve incluir metadados técnicos", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain(result.engine.transcriber);
      expect(md).toContain(result.engine.diarizer);
      expect(md).toContain(result.engine.language);
    });

    it("deve incluir trilha de auditoria quando houver logs", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain("Trilha de auditoria");
      expect(md).toContain("Áudio recebido");
    });

    it("deve incluir disclaimer no final", () => {
      const result = createMockResult();
      const log = createMockLog();
      const md = buildMarkdown(result, log);

      expect(md).toContain("aceitação jurídica");
    });
  });

  describe("buildHtml", () => {
    it("deve gerar HTML válido com DOCTYPE", () => {
      const result = createMockResult();
      const log = createMockLog();
      const html = buildHtml(result, log);

      expect(html).toContain("<!doctype html>");
      expect(html).toContain("<html");
      expect(html).toContain("</html>");
    });

    it("deve incluir título da página", () => {
      const result = createMockResult();
      const log = createMockLog();
      const html = buildHtml(result, log);

      expect(html).toContain("<title>Relatório");
      expect(html).toContain(result.fileName);
    });

    it("deve incluir estilos CSS", () => {
      const result = createMockResult();
      const log = createMockLog();
      const html = buildHtml(result, log);

      expect(html).toContain("<style>");
      expect(html).toContain(":root");
    });

    it("deve incluir tabela de transcrição", () => {
      const result = createMockResult();
      const log = createMockLog();
      const html = buildHtml(result, log);

      expect(html).toContain("<table>");
      expect(html).toContain("<thead>");
      expect(html).toContain("<tbody>");
      expect(html).toContain("João");
    });

    it("deve marcar segmentos editados", () => {
      const result = createMockResult();
      result.segments[0].edited = true;
      const log = createMockLog();
      const html = buildHtml(result, log);

      expect(html).toContain("(revisado manualmente)");
    });

    it("deve incluir metadados técnicos em lista", () => {
      const result = createMockResult();
      const log = createMockLog();
      const html = buildHtml(result, log);

      expect(html).toContain("Metadados técnicos");
      expect(html).toContain(result.engine.transcriber);
    });
  });
});
