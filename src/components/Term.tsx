import { useState, type ReactNode } from "react";
import { Modal } from "./ui";
import { IcBook } from "./icons";

/**
 * Glossário embutido: todo termo técnico exposto na interface traz uma
 * explicação curta em linguagem simples, sem exigir consulta externa.
 */
export const GLOSSARY: Record<string, { term: string; body: string }> = {
  transcrição: {
    term: "Transcrição",
    body: "É o texto escrito de tudo o que foi dito no áudio, com o horário (hh:mm:ss) em que cada fala começa e termina.",
  },
  diarização: {
    term: "Diarização (separação de vozes)",
    body: "É a parte do sistema que percebe quando uma pessoa para de falar e outra começa, separando o áudio por quem falou — mesmo sem saber os nomes ainda.",
  },
  amostra: {
    term: "Amostra de voz",
    body: "Uma gravação curta (10 a 30 segundos) da voz de uma pessoa. O sistema usa essa amostra para reconhecer a mesma pessoa no áudio completo.",
  },
  confiança: {
    term: "Nível de confiança",
    body: "Uma nota de 0 a 100% que mostra o quanto o sistema tem certeza de uma identificação. Alta (80% ou mais): pode confiar. Média: confira com atenção. Baixa: melhore a amostra de voz.",
  },
  hash: {
    term: "Impressão digital (hash SHA-256)",
    body: "Um código único calculado a partir do arquivo de áudio, como um RG do arquivo. Se um único segundo do áudio for alterado, o código muda completamente — é assim que se prova que a gravação não foi modificada.",
  },
  custodia: {
    term: "Cadeia de custódia",
    body: "O registro passo a passo de tudo o que aconteceu com a evidência: quem importou, quando, quais análises foram feitas. Quanto mais completa essa trilha, mais confiável é o material.",
  },
  cpu: {
    term: "Processamento em CPU",
    body: "O trabalho é feito pelo processador comum do computador, sem precisar de placa de vídeo. Por isso pode demorar mais — mas funciona em qualquer notebook comum.",
  },
  reprodutível: {
    term: "Resultado reproduzível",
    body: "O mesmo áudio, com as mesmas amostras de voz, gera sempre o mesmo relatório. Isso permite que outra pessoa refaça o processo e chegue ao mesmo resultado — um sinal de seriedade da evidência.",
  },
};

export function Term({ k, children }: { k: keyof typeof GLOSSARY & string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[k];
  if (!entry) return <>{children ?? k}</>;
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="cursor-help underline decoration-dotted decoration-mist-500 decoration-2 underline-offset-4 hover:decoration-brand-400 transition-colors"
      >
        {children ?? entry.term}
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-40 mb-2 block w-72 -translate-x-1/2 rounded-lg border border-ink-600 bg-ink-800 p-3 text-left shadow-[0_16px_44px_rgba(0,0,0,0.5)] anim-pop">
          <span className="mb-1 block font-display text-[13px] font-semibold text-brand-300">
            {entry.term}
          </span>
          <span className="block text-[13px] leading-relaxed text-mist-200">{entry.body}</span>
        </span>
      )}
    </span>
  );
}

export function GlossaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pequeno dicionário do AtaVoz"
      icon={<IcBook size={20} className="text-brand-400" />}
      width="max-w-xl"
    >
      <p className="mb-4 text-sm text-mist-300">
        Nenhuma palavra técnica deve ficar sem explicação. Aqui estão todas, em linguagem do dia a dia:
      </p>
      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {Object.values(GLOSSARY).map((g) => (
          <div key={g.term} className="rounded-lg border border-ink-700 bg-ink-800/60 px-4 py-3">
            <p className="font-display text-sm font-semibold text-brand-300">{g.term}</p>
            <p className="mt-1 text-sm leading-relaxed text-mist-200">{g.body}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
