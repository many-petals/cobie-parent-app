import { useCallback, useRef, useState } from "react";

export type SoundEffect =
  | "click"
  | "reward"
  | "seedPop"
  | "allFound"
  | "found"
  | "hint"
  | "binFull"
  | "seedBounce"
  | "cardFlip"
  | "cardMatch"
  | "cardMismatch"
  | "bugRandomize"
  | "bugSave"
  | "bugPart"
  | "launch"
  | "levelComplete"
  | "bounce"
  | "starCollect";

const soundProfiles: Record<SoundEffect, { duration: number; frequency: number; type: OscillatorType }> = {
  click: { duration: 0.05, frequency: 520, type: "sine" },
  reward: { duration: 0.22, frequency: 720, type: "triangle" },
  seedPop: { duration: 0.06, frequency: 460, type: "sine" },
  allFound: { duration: 0.26, frequency: 840, type: "triangle" },
  found: { duration: 0.08, frequency: 680, type: "sine" },
  hint: { duration: 0.1, frequency: 610, type: "triangle" },
  binFull: { duration: 0.12, frequency: 280, type: "square" },
  seedBounce: { duration: 0.07, frequency: 390, type: "sine" },
  cardFlip: { duration: 0.08, frequency: 500, type: "triangle" },
  cardMatch: { duration: 0.16, frequency: 760, type: "triangle" },
  cardMismatch: { duration: 0.16, frequency: 260, type: "sawtooth" },
  bugRandomize: { duration: 0.1, frequency: 440, type: "square" },
  bugSave: { duration: 0.18, frequency: 700, type: "triangle" },
  bugPart: { duration: 0.08, frequency: 580, type: "sine" },
  launch: { duration: 0.16, frequency: 350, type: "sawtooth" },
  levelComplete: { duration: 0.3, frequency: 880, type: "triangle" },
  bounce: { duration: 0.06, frequency: 300, type: "sine" },
  starCollect: { duration: 0.12, frequency: 920, type: "triangle" },
};

export function useFunZoneSounds() {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
      return null;
    }

    if (!audioContextRef.current) {
      const AudioContextCtor =
        window.AudioContext ||
        // @ts-expect-error webkit fallback for Safari.
        window.webkitAudioContext;
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => undefined);
    }

    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    (effect: SoundEffect) => {
      if (isMuted) {
        return;
      }

      const context = initAudioContext();
      if (!context) {
        return;
      }

      const profile = soundProfiles[effect];
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = profile.type;
      oscillator.frequency.value = profile.frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + profile.duration);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + profile.duration + 0.02);
    },
    [initAudioContext, isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
    initAudioContext,
  };
}
