import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseSpeechOptions {
  character?: string;
  enabled?: boolean;
  speedMultiplier?: number;
}

interface SpeakOptions {
  immediate?: boolean;
}

const characterVoiceHints: Record<string, string[]> = {
  Cobie: ["en-GB", "en-US"],
  Tree: ["en-GB", "en-US"],
  Tilda: ["en-GB", "en-US"],
  Livleen: ["en-GB", "en-US"],
  Harper: ["en-GB", "en-US"],
  Dulcy: ["en-GB", "en-US"],
};

export function useSpeech({
  character,
  enabled = true,
  speedMultiplier = 1,
}: UseSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) {
      return;
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [supported]);

  const selectedVoice = useMemo(() => {
    if (!voices.length) {
      return undefined;
    }

    const hints = character ? characterVoiceHints[character] ?? [] : [];
    for (const hint of hints) {
      const match = voices.find((voice) => voice.lang.startsWith(hint));
      if (match) {
        return match;
      }
    }

    return (
      voices.find((voice) => voice.lang.startsWith("en-GB")) ??
      voices.find((voice) => voice.lang.startsWith("en-US")) ??
      voices[0]
    );
  }, [character, voices]);

  const stop = useCallback(() => {
    if (!supported) {
      return;
    }

    window.speechSynthesis.cancel();
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!supported || !enabled || !text.trim()) {
        return;
      }

      if (options?.immediate !== false) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.min(Math.max(speedMultiplier, 0.6), 1.4);
      utterance.pitch = 1;
      utterance.volume = 1;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }

      utterance.onstart = () => {
        activeUtteranceRef.current = utterance;
        setIsSpeaking(true);
      };

      const handleDone = () => {
        if (activeUtteranceRef.current === utterance) {
          activeUtteranceRef.current = null;
        }
        setIsSpeaking(false);
      };

      utterance.onend = handleDone;
      utterance.onerror = handleDone;

      window.speechSynthesis.speak(utterance);
    },
    [enabled, selectedVoice, speedMultiplier, supported]
  );

  useEffect(() => stop, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: supported,
  };
}
