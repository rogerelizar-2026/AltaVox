import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "../lib/utils";
import { IcPause, IcPlay } from "./icons";

/** Player de áudio leve com estado de reprodução e busca por posição. */
export function usePlayback(src: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDuration(0);
    const a = src ? new Audio(src) : null;
    audioRef.current = a;
    if (!a) return;
    const onMeta = () => setDuration(isFinite(a.duration) ? a.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setTime(0);
    };
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.pause();
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.src = "";
    };
  }, [src]);

  useEffect(() => {
    if (!playing) return;
    const loop = () => {
      const a = audioRef.current;
      if (a) setTime(a.currentTime);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }, [playing]);

  const seekTo = useCallback(
    (frac: number) => {
      const a = audioRef.current;
      if (!a) return;
      const d = isFinite(a.duration) && a.duration > 0 ? a.duration : duration;
      if (!d) return;
      a.currentTime = Math.max(0, Math.min(1, frac)) * d;
      setTime(a.currentTime);
    },
    [duration]
  );

  return { playing, time, duration, toggle, seekTo };
}

export function PlayButton({
  playback,
  disabled,
  size = "md",
}: {
  playback: ReturnType<typeof usePlayback>;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={playback.toggle}
      disabled={disabled}
      aria-label={playback.playing ? "Pausar" : "Ouvir"}
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full border border-ink-600 bg-ink-750 text-brand-300 transition-all hover:border-brand-400/60 hover:bg-ink-700 active:scale-90 disabled:opacity-35 disabled:pointer-events-none cursor-pointer",
        size === "md" ? "h-10 w-10" : "h-8 w-8"
      )}
    >
      {playback.playing ? <IcPause size={size === "md" ? 17 : 14} /> : <IcPlay size={size === "md" ? 17 : 14} />}
    </button>
  );
}

export function Waveform({
  peaks,
  progress,
  onSeek,
  height = 52,
  className,
}: {
  peaks: number[];
  progress: number;
  onSeek?: (frac: number) => void;
  height?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!onSeek || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onSeek((e.clientX - rect.left) / rect.width);
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cx(
        "flex w-full items-center gap-[2px]",
        onSeek && "cursor-pointer",
        className
      )}
      style={{ height }}
      aria-hidden="true"
    >
      {peaks.map((p, i) => {
        const played = i / peaks.length <= progress;
        return (
          <div
            key={i}
            className={cx(
              "flex-1 min-w-[1.5px] rounded-full transition-colors duration-150",
              played ? "bg-brand-400" : "bg-ink-600 group-hover:bg-mist-500/60"
            )}
            style={{ height: `${Math.max(9, p * 100)}%` }}
          />
        );
      })}
    </div>
  );
}
