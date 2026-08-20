import type { ReactNode } from "react";
import { cx, fmtTime } from "../lib/utils";
import type { LogEntry, LogKind, StepIndex } from "../lib/types";
import {
  IcAlert,
  IcCheck,
  IcChevronR,
  IcCopy,
  IcDoc,
  IcDownload,
  IcFingerprint,
  IcHistory,
  IcInfo,
  IcLock,
  IcMic,
  IcShield,
  IcUsers,
  IcWave,
  IcX,
} from "./icons";
import { Chip } from "./ui";

export interface StepMeta {
  idx: StepIndex;
  title: string;
  desc: string;
  state: "done" | "current" | "open" | "locked";
  lockReason?: string;
}

export const STEP_ICONS: [ReactNode, ReactNode, ReactNode, ReactNode, ReactNode] = [
  <IcDoc size={17} key="0" />,
  <IcMic size={17} key="1" />,
  <IcUsers size={17} key="2" />,
  <IcWave size={17} key="3" />,
  <IcShield size={17} key="4" />,
];

const KIND_STYLE: Record<LogKind, { color: string; label: string }> = {
  import: { color: "text-info-400", label: "Importação" },
  hash: { color: "text-brand-400", label: "Integridade" },
  sample: { color: "text-info-400", label: "Amostra" },
  verify: { color: "text-ok-400", label: "Verificação" },
  process: { color: "text-brand-400", label: "Processamento" },
  export: { color: "text-ok-400", label: "Exportação" },
  edit: { color: "text-info-300", label: "Revisão" },
  system: { color: "text-mist-400", label: "Sistema" },
  alert: { color: "text-warn-300", label: "Alerta" },
};

export function Sidebar({
  steps,
  onNavigate,
  logEntries,
  hashCount,
  onOpenLog,
}: {
  steps: StepMeta[];
  onNavigate: (idx: StepIndex) => void;
  logEntries: LogEntry[];
  hashCount: number;
  onOpenLog: () => void;
}) {
  return (
    <aside className="flex w-[288px] shrink-0 flex-col gap-5 border-r border-ink-700/70 bg-ink-900/40 px-5 py-6 max-lg:hidden">
      <nav className="flex flex-col gap-1.5">
        {steps.map((s, i) => {
          const locked = s.state === "locked";
          const current = s.state === "current";
          const done = s.state === "done";
          return (
            <button
              key={s.idx}
              onClick={() => !locked && onNavigate(s.idx)}
              disabled={locked}
              className={cx(
                "group flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 cursor-pointer",
                current
                  ? "border-brand-400/50 bg-brand-400/8 shadow-[inset_0_0_0_1px_rgba(245,184,75,0.15)]"
                  : locked
                    ? "border-transparent opacity-45 cursor-not-allowed"
                    : "border-transparent hover:border-ink-600 hover:bg-ink-800/70"
              )}
            >
              <span
                className={cx(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[12px] font-semibold transition-colors",
                  done && "border-ok-400/50 bg-ok-400/12 text-ok-300",
                  current && "border-brand-400/60 bg-brand-400/15 text-brand-300",
                  !done && !current && "border-ink-600 bg-ink-800 text-mist-400"
                )}
              >
                {done ? <IcCheck size={15} /> : locked ? <IcLock size={14} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cx(
                    "flex items-center gap-1.5 font-display text-[14px] font-semibold leading-tight",
                    current ? "text-brand-300" : "text-mist-100"
                  )}
                >
                  {s.title}
                  {current && <IcChevronR size={13} className="text-brand-400" />}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-mist-400">
                  {locked && s.lockReason ? s.lockReason : s.desc}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-ink-700 bg-ink-850/80 p-4">
          <div className="flex items-center gap-2 text-mist-100">
            <IcFingerprint size={16} className="text-brand-400" />
            <p className="font-display text-[13px] font-semibold">Integridade registrada</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md bg-ink-800 px-2 py-2.5">
              <p className="font-mono text-xl font-semibold text-brand-300">{hashCount}</p>
              <p className="text-[11px] text-mist-400">impressões digitais</p>
            </div>
            <div className="rounded-md bg-ink-800 px-2 py-2.5">
              <p className="font-mono text-xl font-semibold text-ok-300">{logEntries.length}</p>
              <p className="text-[11px] text-mist-400">eventos no diário</p>
            </div>
          </div>
          <button
            onClick={onOpenLog}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-[13px] font-medium text-mist-200 transition-all hover:border-brand-400/50 hover:text-brand-300 active:scale-[0.98] cursor-pointer"
          >
            <IcHistory size={15} />
            Abrir diário de integridade
          </button>
        </div>
        <p className="px-1 text-[11px] leading-relaxed text-mist-500">
          Nada sai do seu computador. Cada ação fica anotada no diário para reforçar a{" "}
          <span className="text-mist-400">cadeia de custódia</span>.
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------ LogDrawer ------------------------------ */

export function LogDrawer({
  open,
  entries,
  onClose,
  onExport,
}: {
  open: boolean;
  entries: LogEntry[];
  onClose: () => void;
  onExport: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-ink-950/60 anim-fade" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[min(460px,100vw)] border-l border-ink-600 bg-ink-900 shadow-[-24px_0_60px_rgba(0,0,0,0.5)] anim-slide-right flex flex-col">
        <div className="flex items-center gap-3 border-b border-ink-700 px-5 py-4">
          <IcHistory size={20} className="text-brand-400" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold">Diário de integridade</h2>
            <p className="text-[12px] text-mist-400">
              A trilha de auditoria da cadeia de custódia — cada ação, com data e hora.
            </p>
          </div>
          <button onClick={onClose} aria-label="Fechar diário" className="text-mist-400 hover:text-mist-100 transition-colors cursor-pointer">
            <IcX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {entries.length === 0 ? (
            <div className="mt-16 text-center text-mist-400">
              <IcInfo size={28} className="mx-auto mb-3 opacity-60" />
              <p className="text-sm">Nenhum evento ainda.</p>
              <p className="mt-1 text-[13px] text-mist-500">
                Importe um áudio para começar — tudo ficará registrado aqui.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-1 border-l border-ink-700 pl-4">
              {[...entries].reverse().map((e) => {
                const st = KIND_STYLE[e.kind];
                return (
                  <li key={e.id} className="relative rounded-md px-2 py-2 transition-colors hover:bg-ink-800/70">
                    <span className={cx("absolute -left-[21.5px] top-3.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900", kindDot(e.kind))} />
                    <div className="flex items-center gap-2">
                      <span className={cx("font-mono text-[11px] font-medium", st.color)}>{fmtTime(e.at)}</span>
                      <Chip tone={e.kind === "alert" ? "warn" : e.kind === "verify" || e.kind === "export" ? "ok" : "neutral"} className="px-1.5! text-[10px]!">
                        {st.label}
                      </Chip>
                    </div>
                    <p className="mt-1 text-[13px] font-medium leading-snug text-mist-100">{e.title}</p>
                    {e.detail && (
                      <p className="mt-0.5 break-all font-mono text-[11px] leading-relaxed text-mist-400">{e.detail}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="border-t border-ink-700 px-5 py-4">
          <button
            onClick={onExport}
            disabled={entries.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-all hover:bg-brand-300 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <IcDownload size={16} />
            Baixar diário completo (.txt)
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-mist-500">
            <IcCopy size={12} />
            O arquivo original nunca é modificado — apenas lido.
          </p>
        </div>
      </div>
    </div>
  );
}

function kindDot(kind: LogKind): string {
  switch (kind) {
    case "verify":
    case "export":
      return "bg-ok-400";
    case "alert":
      return "bg-warn-400";
    case "hash":
    case "process":
      return "bg-brand-400";
    case "import":
    case "sample":
    case "edit":
      return "bg-info-400";
    default:
      return "bg-mist-500";
  }
}

export function LogAlertBadge({ kind }: { kind: LogKind }) {
  return kind === "alert" ? <IcAlert size={13} /> : null;
}
