import { useRef, useState } from "react";
import type { AudioFileRec } from "../../lib/types";
import { copyText, cx, fmtBytes, fmtFriendly, fmtMS, shortHash } from "../../lib/utils";
import { Btn, Callout, Chip, SectionHead } from "../ui";
import { Term } from "../Term";
import { PlayButton, usePlayback, Waveform } from "../Waveform";
import {
  IcAlert,
  IcCheck,
  IcCopy,
  IcFileAudio,
  IcFingerprint,
  IcInfo,
  IcLock,
  IcSpinner,
  IcTrash,
  IcUpload,
} from "../icons";

export interface RejectedFile {
  name: string;
  reason: string;
}

export function StepImport({
  files,
  onPickFiles,
  onRemove,
  onNext,
  canNext,
}: {
  files: AudioFileRec[];
  onPickFiles: (files: FileList | File[]) => RejectedFile[];
  onRemove: (id: string) => void;
  onNext: () => void;
  canNext: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (list: FileList | File[]) => {
    const rej = onPickFiles(list);
    setRejected(rej);
  };

  return (
    <div>
      <SectionHead
        step="Passo 1 de 5"
        title="Entregue o áudio ao sistema"
        desc="Arraste a gravação que você quer transcrever. O sistema confere o formato, mede a duração e tira a impressão digital do arquivo — sem alterar nada nele."
        aside={
          <Btn variant="primary" onClick={onNext} disabled={!canNext} className="px-5 py-2.5">
            Continuar
            <IcCheck size={16} />
          </Btn>
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        className={cx(
          "group relative rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200",
          dragging
            ? "border-brand-400 bg-brand-400/8 scale-[1.005]"
            : "border-ink-600 bg-ink-850/50 hover:border-mist-500 hover:bg-ink-850"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a,audio/mp3"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handle(e.target.files);
            e.target.value = "";
          }}
        />
        <div
          className={cx(
            "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border transition-all",
            dragging ? "border-brand-400 text-brand-300 scale-110" : "border-ink-600 text-mist-400 group-hover:text-brand-300 group-hover:border-brand-400/50"
          )}
        >
          <IcUpload size={24} />
        </div>
        <p className="font-display text-lg font-semibold">
          {dragging ? "Pode soltar o arquivo aqui" : "Arraste até 2 áudios para cá"}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-mist-400">
          Formatos aceitos: <strong className="text-mist-200">MP3</strong> e{" "}
          <strong className="text-mist-200">M4A</strong>, com até 30 minutos cada.
        </p>
        <Btn variant="outline" className="mt-5" onClick={() => inputRef.current?.click()}>
          <IcUpload size={15} />
          Ou escolha os arquivos manualmente
        </Btn>

        <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-ink-700 pt-5 text-[12px] text-mist-400">
          <span className="inline-flex items-center gap-1.5">
            <IcFileAudio size={14} className="text-brand-400" /> Máximo de 2 áudios por lote
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IcFingerprint size={14} className="text-brand-400" /> Impressão digital{" "}
            <Term k="hash">SHA-256</Term> automática
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IcLock size={14} className="text-brand-400" /> O arquivo original nunca é alterado
          </span>
        </div>
      </div>

      {rejected.length > 0 && (
        <div className="mt-4 space-y-2 anim-rise">
          {rejected.map((r, i) => (
            <Callout key={`${r.name}-${i}`} tone="warn" title={`“${r.name}” não foi aceito`}>
              {r.reason}
            </Callout>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="stagger mt-6 space-y-4">
          {files.map((f) => (
            <FileCard key={f.id} rec={f} onRemove={() => onRemove(f.id)} />
          ))}
        </div>
      )}

      {files.length === 0 && rejected.length === 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850/50 px-4 py-3.5 text-sm text-mist-400">
          <IcInfo size={17} className="shrink-0 text-info-400" />
          Nenhum áudio na mesa ainda. Depois de importar, você verá aqui a duração, a forma de
          onda e a impressão digital de cada arquivo.
        </div>
      )}
    </div>
  );
}

/* ------------------------------- FileCard ------------------------------ */

function FileCard({ rec, onRemove }: { rec: AudioFileRec; onRemove: () => void }) {
  const pb = usePlayback(rec.blobUrl);
  const [copied, setCopied] = useState(false);
  const erro = rec.analyzeError || (rec.tooLong ? "too-long" : null);

  const doCopy = async () => {
    if (!rec.sha256) return;
    const ok = await copyText(rec.sha256);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const progress = pb.duration > 0 ? pb.time / pb.duration : 0;

  return (
    <div
      className={cx(
        "rounded-xl border bg-ink-850/80 p-5 transition-colors",
        erro ? "border-warn-400/40" : "border-ink-700 hover:border-ink-600"
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cx(
            "flex h-11 w-11 items-center justify-center rounded-lg border",
            erro ? "border-warn-400/40 text-warn-300" : "border-ink-600 bg-ink-800 text-brand-300"
          )}
        >
          <IcFileAudio size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold">{rec.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-mist-400">
            <span>{fmtBytes(rec.sizeBytes)}</span>
            {rec.durationSec != null ? (
              <span className="font-mono text-mist-300">{fmtMS(rec.durationSec)} min</span>
            ) : !rec.analyzeError ? (
              <span className="inline-flex items-center gap-1.5">
                <IcSpinner size={12} /> medindo a duração…
              </span>
            ) : null}
          </p>
        </div>
        {erro ? (
          <Chip tone="warn">
            <IcAlert size={12} /> Problema no arquivo
          </Chip>
        ) : rec.durationSec != null && rec.sha256 ? (
          <Chip tone="ok">
            <IcCheck size={12} /> Pronto
          </Chip>
        ) : (
          <Chip tone="brand">
            <IcSpinner size={12} /> Conferindo
          </Chip>
        )}
        <button
          onClick={onRemove}
          aria-label={`Remover ${rec.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 text-mist-400 transition-all hover:border-warn-400/50 hover:text-warn-300 active:scale-90 cursor-pointer"
        >
          <IcTrash size={16} />
        </button>
      </div>

      {erro && (
        <div className="mt-4">
          <Callout tone="warn" title={rec.tooLong ? "Este áudio passa do limite de 30 minutos" : "Não conseguimos ler este áudio"}>
            {rec.tooLong
              ? `Ele tem ${rec.durationSec != null ? fmtFriendly(rec.durationSec) : "mais de 30 minutos"}. Divida a gravação em partes menores e importe de novo — nada foi processado.`
              : "O arquivo pode estar danificado ou incompleto. Confira se ele toca normalmente em outro aplicativo e tente importar novamente."}
          </Callout>
        </div>
      )}

      {/* hash */}
      <div className="mt-4 rounded-lg border border-ink-700 bg-ink-900/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-mist-400">
            <IcFingerprint size={14} className="text-brand-400" />
            Impressão digital do arquivo <Term k="hash">(SHA-256)</Term>
          </p>
          {rec.sha256 && (
            <button
              onClick={doCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink-600 px-2 py-1 text-[11px] font-medium text-mist-300 transition-all hover:border-brand-400/50 hover:text-brand-300 active:scale-95 cursor-pointer"
            >
              {copied ? <IcCheck size={12} className="text-ok-400" /> : <IcCopy size={12} />}
              {copied ? "Copiado" : "Copiar código"}
            </button>
          )}
        </div>
        {rec.hashing ? (
          <div className="skeleton-shimmer mt-2 h-5 rounded" />
        ) : rec.sha256 ? (
          <p className="mt-1.5 break-all font-mono text-[12px] leading-relaxed text-mist-300">
            {shortHash(rec.sha256, 22, 18)}
          </p>
        ) : (
          <p className="mt-1.5 font-mono text-[12px] text-mist-500">calculando…</p>
        )}
      </div>

      {/* waveform */}
      {rec.peaks && (
        <div className="mt-4 flex items-center gap-3">
          <PlayButton playback={pb} />
          <div className="group min-w-0 flex-1">
            <Waveform peaks={rec.peaks} progress={progress} onSeek={pb.seekTo} height={48} />
          </div>
          <span className="w-[86px] shrink-0 text-right font-mono text-[12px] text-mist-400">
            {fmtMS(pb.time)} / {fmtMS(pb.duration || rec.durationSec || 0)}
          </span>
        </div>
      )}
    </div>
  );
}
