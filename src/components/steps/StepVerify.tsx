import { useState } from "react";
import type { AudioFileRec, SpeakerRec, VerificationRec } from "../../lib/types";
import { confidenceLabel, cx, fmtDateTime, fmtHMS } from "../../lib/utils";
import { Btn, Callout, Chip, Modal, SectionHead } from "../ui";
import { Term } from "../Term";
import { PlayButton, usePlayback, Waveform } from "../Waveform";
import {
  IcAlert,
  IcArrowR,
  IcCheck,
  IcCheckCircle,
  IcInfo,
  IcPlay,
  IcShield,
  IcSpinner,
  IcUsers,
  IcX,
} from "../icons";

export function StepVerify({
  files,
  speakers,
  verifications,
  onConfirm,
  onReopen,
  onRejectGoSamples,
  onNext,
  allConfirmed,
}: {
  files: AudioFileRec[];
  speakers: SpeakerRec[];
  verifications: Record<string, VerificationRec>;
  onConfirm: (fileId: string) => void;
  onReopen: (fileId: string) => void;
  onRejectGoSamples: (fileId: string) => void;
  onNext: () => void;
  allConfirmed: boolean;
}) {
  const [rejectFor, setRejectFor] = useState<AudioFileRec | null>(null);

  const nameOf = (id: string) => speakers.find((s) => s.id === id)?.name ?? "Pessoa desconhecida";

  return (
    <div>
      <SectionHead
        step="Passo 3 de 5"
        title="Confira se o sistema reconheceu as vozes"
        desc="Antes de processar tudo, o sistema ouviu os primeiros segundos de cada áudio e comparou com as amostras cadastradas. Veja os nomes sugeridos e confirme com um clique — só então o processamento completo é liberado."
      />

      <div className="mb-5">
        <Callout tone="info" title="Por que esta etapa existe?">
          Se o sistema se enganar sobre quem falou, o relatório inteiro fica comprometido. Este
          teste rápido com um trecho curto evita isso. O <Term k="confiança">nível de confiança</Term>{" "}
          mostra o quanto o sistema tem certeza de cada palpite.
        </Callout>
      </div>

      <div className="stagger space-y-5">
        {files.map((f) => {
          const v = verifications[f.id];
          return (
            <FileVerifyCard
              key={f.id}
              file={f}
              v={v}
              nameOf={nameOf}
              onConfirm={() => onConfirm(f.id)}
              onReopen={() => onReopen(f.id)}
              onReject={() => setRejectFor(f)}
            />
          );
        })}
      </div>

      {allConfirmed && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ok-400/40 bg-ok-400/8 px-5 py-4 anim-pop">
          <div className="flex items-center gap-3">
            <IcShield size={26} className="text-ok-400" />
            <div>
              <p className="font-display text-[15px] font-semibold text-ok-300">
                Identificação confirmada — processamento liberado
              </p>
              <p className="text-[13px] text-mist-300">
                Sua confirmação ficou registrada no diário de integridade com data e hora.
              </p>
            </div>
          </div>
          <Btn variant="success" onClick={onNext} className="px-5 py-2.5">
            Iniciar processamento
            <IcArrowR size={16} />
          </Btn>
        </div>
      )}

      {/* orientação ao rejeitar */}
      <Modal
        open={rejectFor != null}
        onClose={() => setRejectFor(null)}
        title="Vamos melhorar o reconhecimento"
        icon={<IcAlert size={20} className="text-warn-300" />}
      >
        <p className="text-sm leading-relaxed text-mist-200">
          Sem problema — é para isso que este teste existe. O sistema errou (ou não teve certeza)
          porque a amostra de voz não está parecida o bastante com a voz no áudio. Siga estas dicas
          e grave de novo:
        </p>
        <ul className="mt-4 space-y-2.5 text-sm text-mist-200">
          {[
            "Vá para um lugar silencioso — ventilador, TV e rua barulhenta confundem o sistema.",
            "Fale na mesma velocidade e tom de voz que a pessoa usa na gravação original.",
            "Fique a um palmo do microfone, sem cobrir a boca.",
            "Grave de 10 a 30 segundos de fala contínua — pausas longas não ajudam.",
            "Se a gravação original foi feita pelo telefone, grave a amostra também pelo telefone.",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 font-mono text-[11px] font-semibold text-brand-300">
                {i + 1}
              </span>
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Btn variant="ghost" onClick={() => setRejectFor(null)}>
            Voltar
          </Btn>
          <Btn
            variant="primary"
            onClick={() => {
              if (rejectFor) onRejectGoSamples(rejectFor.id);
              setRejectFor(null);
            }}
          >
            <IcUsers size={16} />
            Ir regravar as amostras
          </Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ----------------------------- FileVerifyCard -------------------------- */

function FileVerifyCard({
  file,
  v,
  nameOf,
  onConfirm,
  onReopen,
  onReject,
}: {
  file: AudioFileRec;
  v: VerificationRec | undefined;
  nameOf: (id: string) => string;
  onConfirm: () => void;
  onReopen: () => void;
  onReject: () => void;
}) {
  const pb = usePlayback(file.blobUrl);

  const hearTurn = (startSec: number) => {
    const d = file.durationSec ?? pb.duration;
    if (d > 0) pb.seekTo(startSec / d);
    if (!pb.playing) pb.toggle();
  };

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850/80 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold">{file.name}</p>
          <p className="mt-0.5 text-[12.5px] text-mist-400">
            Teste feito com o trecho inicial (até ~20 segundos) da gravação.
          </p>
        </div>
        {v?.status === "confirmado" && (
          <Chip tone="ok">
            <IcCheck size={12} /> Confirmado
          </Chip>
        )}
      </div>

      {!v ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-4 text-sm text-mist-300">
          <IcSpinner size={17} className="text-brand-400" />
          Preparando o teste de reconhecimento para este áudio…
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-2.5">
            {v.turns.map((t, i) => {
              const lbl = confidenceLabel(t.confidence);
              return (
                <div
                  key={i}
                  className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3 transition-colors hover:border-ink-600"
                >
                  <button
                    onClick={() => hearTurn(t.startSec)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-600 bg-ink-800 px-2 py-1 font-mono text-[12px] text-brand-300 transition-all hover:border-brand-400/50 active:scale-95 cursor-pointer"
                    title="Ouvir a partir deste momento"
                  >
                    <IcPlay size={11} />
                    {fmtHMS(t.startSec)}
                  </button>
                  <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                    <span className="text-mist-400">O sistema acha que é</span>
                    <span className="truncate font-display font-semibold text-mist-100">
                      {nameOf(t.suggestedSpeakerId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-700">
                      <div
                        className={cx(
                          "h-full rounded-full transition-[width] duration-500",
                          lbl.tone === "ok" && "bg-ok-400",
                          lbl.tone === "info" && "bg-info-400",
                          lbl.tone === "warn" && "bg-warn-400"
                        )}
                        style={{ width: `${Math.round(t.confidence * 100)}%` }}
                      />
                    </div>
                    <Chip tone={lbl.tone}>
                      {Math.round(t.confidence * 100)}% · {lbl.label}
                    </Chip>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-mist-500">
            <IcInfo size={13} className="mt-0.5 shrink-0" />
            Clique no horário para ouvir o trecho. <Term k="confiança">Confiança</Term> baixa? Uma
            amostra de voz melhor resolve na maioria dos casos.
          </p>

          {v.status === "confirmado" ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ok-400/30 bg-ok-400/6 px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-ok-300">
                <IcCheckCircle size={16} />
                Você confirmou esta identificação
                {v.decidedAt && (
                  <span className="font-mono text-[11.5px] text-mist-400">
                    em {fmtDateTime(v.decidedAt)}
                  </span>
                )}
              </p>
              <button
                onClick={onReopen}
                className="text-[12.5px] text-mist-400 underline decoration-dotted underline-offset-4 hover:text-mist-100 cursor-pointer"
              >
                Mudar minha resposta
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Btn variant="success" onClick={onConfirm} className="px-5">
                <IcCheck size={16} />
                Confirmar — os nomes estão certos
              </Btn>
              <Btn variant="danger" onClick={onReject}>
                <IcX size={15} />
                Não está certo
              </Btn>
              <span className="basis-full text-[12px] text-mist-500 sm:basis-auto">
                Ao confirmar, você autoriza o processamento completo deste áudio.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
