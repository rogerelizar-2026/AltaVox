import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx, uid } from "../lib/utils";
import { IcAlert, IcCheckCircle, IcInfo, IcX } from "./icons";

interface ToastItem {
  id: string;
  tone: "ok" | "warn" | "info" | "brand";
  title: string;
  desc?: string;
}

interface ToastCtx {
  push: (tone: ToastItem["tone"], title: string, desc?: string) => void;
}

const Ctx = createContext<ToastCtx>({ push: () => undefined });

export function useToast(): ToastCtx {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (tone: ToastItem["tone"], title: string, desc?: string) => {
      const id = uid();
      setItems((prev) => [...prev.slice(-3), { id, tone, title, desc }]);
      timers.current.set(
        id,
        window.setTimeout(() => remove(id), 5200)
      );
    },
    [remove]
  );

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5">
        {items.map((t) => {
          const icon =
            t.tone === "ok" ? (
              <IcCheckCircle size={19} className="text-ok-400 shrink-0" />
            ) : t.tone === "warn" ? (
              <IcAlert size={19} className="text-warn-300 shrink-0" />
            ) : (
              <IcInfo size={19} className={cx("shrink-0", t.tone === "brand" ? "text-brand-400" : "text-info-400")} />
            );
          return (
            <div
              key={t.id}
              className={cx(
                "pointer-events-auto anim-slide-right rounded-lg border bg-ink-800/95 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur",
                t.tone === "ok" && "border-ok-400/40",
                t.tone === "warn" && "border-warn-400/40",
                t.tone === "info" && "border-info-400/40",
                t.tone === "brand" && "border-brand-400/40"
              )}
              role="status"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-mist-100">{t.title}</p>
                  {t.desc && <p className="mt-0.5 text-[13px] leading-snug text-mist-300">{t.desc}</p>}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-mist-500 hover:text-mist-100 transition-colors cursor-pointer mt-0.5"
                  aria-label="Fechar aviso"
                >
                  <IcX size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
