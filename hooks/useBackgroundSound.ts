import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getSoundById, Sound, SoundSettings } from "@/components/soundConfig";

interface UseBackgroundSoundOptions {
  settings: SoundSettings;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function useBackgroundSound({ settings }: UseBackgroundSoundOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const lastVolumeRef = useRef(settings.volume);

  const [currentSound, setCurrentSound] = useState<Sound | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(settings.volume);
  const [isMuted, setIsMuted] = useState(false);

  const effectiveVolume = useMemo(
    () => (isMuted ? 0 : clamp(volume, 0, 1)),
    [isMuted, volume]
  );

  const clearFade = useCallback(() => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) {
      return audioRef.current;
    }

    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("playing", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("emptied", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));

    audioRef.current = audio;
    return audio;
  }, []);

  const syncVolume = useCallback(
    (nextVolume: number) => {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = clamp(nextVolume, 0, 1);
      }
    },
    []
  );

  useEffect(() => {
    syncVolume(effectiveVolume);
  }, [effectiveVolume, syncVolume]);

  useEffect(() => {
    setVolumeState(settings.volume);
    lastVolumeRef.current = settings.volume;
  }, [settings.volume]);

  useEffect(() => {
    if (!settings.enabled) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [settings.enabled]);

  useEffect(
    () => () => {
      clearFade();
      const audio = audioRef.current;
      audio?.pause();
      audioRef.current = null;
    },
    [clearFade]
  );

  const play = useCallback(
    async (soundId: string) => {
      if (!settings.enabled) {
        return;
      }

      const sound = getSoundById(soundId);
      if (!sound) {
        return;
      }

      clearFade();
      setCurrentSound(sound);

      const audio = ensureAudio();
      const needsSourceUpdate = audio.src !== sound.audioUrl;
      if (needsSourceUpdate) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = sound.audioUrl;
        audio.load();
      }

      const nextVolume = isMuted ? 0 : clamp(volume || sound.defaultVolume, 0, 1);
      audio.volume = nextVolume;

      try {
        await audio.play();
      } catch (error) {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
      }
    },
    [clearFade, ensureAudio, isMuted, settings.enabled, volume]
  );

  const stop = useCallback(() => {
    clearFade();
    const audio = audioRef.current;
    if (!audio) {
      setCurrentSound(undefined);
      setIsPlaying(false);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setCurrentSound(undefined);
    setIsPlaying(false);
  }, [clearFade]);

  const pause = useCallback(() => {
    clearFade();
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [clearFade]);

  const resume = useCallback(async () => {
    if (!audioRef.current || !currentSound || !settings.enabled) {
      return;
    }

    try {
      audioRef.current.volume = isMuted ? 0 : clamp(volume || currentSound.defaultVolume, 0, 1);
      await audioRef.current.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  }, [currentSound, isMuted, settings.enabled, volume]);

  const setVolume = useCallback(
    (nextVolume: number) => {
      const normalized = clamp(nextVolume, 0, 1);
      setVolumeState(normalized);
      lastVolumeRef.current = normalized;
      if (!isMuted) {
        syncVolume(normalized);
      }
    },
    [isMuted, syncVolume]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      syncVolume(nextMuted ? 0 : lastVolumeRef.current);
      return nextMuted;
    });
  }, [syncVolume]);

  const animateVolume = useCallback(
    (targetVolume: number) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      clearFade();

      const startVolume = audio.volume;
      const endVolume = clamp(targetVolume, 0, 1);
      const duration = Math.max(settings.fadeDuration, 150);
      const stepMs = 50;
      const totalSteps = Math.max(Math.round(duration / stepMs), 1);
      let currentStep = 0;

      fadeRef.current = window.setInterval(() => {
        currentStep += 1;
        const progress = currentStep / totalSteps;
        const nextVolume = startVolume + (endVolume - startVolume) * progress;
        audio.volume = clamp(nextVolume, 0, 1);

        if (currentStep >= totalSteps) {
          clearFade();
          audio.volume = endVolume;
        }
      }, stepMs);
    },
    [clearFade, settings.fadeDuration]
  );

  const fadeOut = useCallback(() => {
    animateVolume(0.08);
  }, [animateVolume]);

  const fadeIn = useCallback(() => {
    animateVolume(isMuted ? 0 : lastVolumeRef.current);
  }, [animateVolume, isMuted]);

  return {
    currentSound,
    isPlaying,
    volume,
    isMuted,
    play,
    stop,
    pause,
    resume,
    setVolume,
    toggleMute,
    fadeOut,
    fadeIn,
  };
}
