import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play, Square, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ArabicTTSProps {
  text: string;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showVoiceSelector?: boolean;
  autoSpeak?: boolean;
}

interface VoiceInfo {
  voice: SpeechSynthesisVoice;
  label: string;
}

export default function ArabicTTS({
  text,
  label = "استمع",
  size = "sm",
  variant = "outline",
  className = "",
  showVoiceSelector = false,
  autoSpeak = false,
}: ArabicTTSProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [arabicVoices, setArabicVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
  const [showVoices, setShowVoices] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const voicesDropdownRef = useRef<HTMLDivElement>(null);

  // Check TTS support and load voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const arabic = voices
        .filter((v) => v.lang.startsWith("ar"))
        .map((v) => ({
          voice: v,
          label: `${v.name} (${v.lang})${v.localService ? " - محلي" : " - شبكة"}`,
        }));

      if (arabic.length > 0) {
        setArabicVoices(arabic);
      } else {
        // Fallback: try to find any voice that might work
        const fallback = voices.filter(
          (v) =>
            v.lang.includes("ar") ||
            v.name.toLowerCase().includes("arab") ||
            v.name.toLowerCase().includes("majed")
        );
        if (fallback.length > 0) {
          setArabicVoices(
            fallback.map((v) => ({
              voice: v,
              label: `${v.name} (${v.lang})`,
            }))
          );
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stopSpeaking();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (voicesDropdownRef.current && !voicesDropdownRef.current.contains(e.target as Node)) {
        setShowVoices(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-speak
  useEffect(() => {
    if (autoSpeak && text && isSupported) {
      speak();
    }
  }, [autoSpeak]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const speak = useCallback(() => {
    if (!isSupported) {
      toast.error("متصفحك لا يدعم تحويل النص إلى صوت");
      return;
    }

    if (!text || text.trim().length === 0) {
      toast.error("لا يوجد نص للقراءة");
      return;
    }

    // Stop any current speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set Arabic voice if available
    if (arabicVoices.length > 0 && arabicVoices[selectedVoiceIdx]) {
      utterance.voice = arabicVoices[selectedVoiceIdx].voice;
      utterance.lang = arabicVoices[selectedVoiceIdx].voice.lang;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();

      // Estimate duration: ~150 words/min for Arabic, avg 5 chars/word
      const estimatedDuration = (text.length / 5 / 150) * 60 * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / estimatedDuration) * 100, 95);
        setProgress(pct);
      }, 200);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(100);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeout(() => setProgress(0), 500);
    };

    utterance.onerror = (event) => {
      if (event.error !== "canceled") {
        console.error("TTS Error:", event.error);
        toast.error("حدث خطأ أثناء القراءة الصوتية");
      }
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    utteranceRef.current = utterance;

    // Chrome has a bug where long text stops after ~15 seconds
    // Workaround: split into chunks for long texts
    if (text.length > 300) {
      speakInChunks(text, utterance);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, [text, isSupported, arabicVoices, selectedVoiceIdx, stopSpeaking]);

  const speakInChunks = (fullText: string, baseUtterance: SpeechSynthesisUtterance) => {
    // Split by sentences (Arabic period, question mark, exclamation, or newline)
    const sentences = fullText.split(/(?<=[.!?،؟\n])\s*/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + " " + sentence).length > 250) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += " " + sentence;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    let chunkIdx = 0;
    const speakNextChunk = () => {
      if (chunkIdx >= chunks.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        setProgress(100);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(() => setProgress(0), 500);
        return;
      }

      const chunkUtterance = new SpeechSynthesisUtterance(chunks[chunkIdx]);
      chunkUtterance.lang = baseUtterance.lang;
      chunkUtterance.rate = baseUtterance.rate;
      chunkUtterance.pitch = baseUtterance.pitch;
      chunkUtterance.volume = baseUtterance.volume;
      if (baseUtterance.voice) chunkUtterance.voice = baseUtterance.voice;

      chunkUtterance.onend = () => {
        chunkIdx++;
        speakNextChunk();
      };

      chunkUtterance.onerror = (event) => {
        if (event.error !== "canceled") {
          console.error("TTS Chunk Error:", event.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
        setProgress(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      utteranceRef.current = chunkUtterance;
      window.speechSynthesis.speak(chunkUtterance);
    };

    speakNextChunk();
  };

  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  if (!isSupported) {
    return (
      <Button size={size} variant={variant} disabled className={`text-xs opacity-50 ${className}`}>
        <VolumeX className="w-3 h-3 ms-1" />
        غير مدعوم
      </Button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 relative" dir="rtl">
      {/* Main TTS Button */}
      {!isSpeaking ? (
        <Button
          size={size}
          variant={variant}
          onClick={speak}
          className={`text-xs gap-1.5 ${className}`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {label}
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            size={size}
            variant={variant}
            onClick={togglePause}
            className="text-xs gap-1 min-w-0"
          >
            {isPaused ? (
              <Play className="w-3 h-3" />
            ) : (
              <Pause className="w-3 h-3" />
            )}
          </Button>
          <Button
            size={size}
            variant="ghost"
            onClick={stopSpeaking}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 min-w-0 px-2"
          >
            <Square className="w-3 h-3" />
          </Button>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Voice Selector */}
      {showVoiceSelector && arabicVoices.length > 1 && (
        <div className="relative" ref={voicesDropdownRef}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowVoices(!showVoices)}
            className="text-[10px] px-1.5 h-6"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
          {showVoices && (
            <div className="absolute top-full start-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px] py-1">
              <p className="px-3 py-1 text-[10px] text-gray-500 font-bold border-b">اختر الصوت العربي</p>
              {arabicVoices.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedVoiceIdx(idx);
                    setShowVoices(false);
                    if (isSpeaking) {
                      stopSpeaking();
                      setTimeout(speak, 100);
                    }
                  }}
                  className={`w-full text-end px-3 py-1.5 text-[10px] hover:bg-blue-50 transition-colors ${
                    selectedVoiceIdx === idx ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
