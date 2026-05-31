/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, AlertCircle, Headphones, Sparkles } from "lucide-react";

interface AudioPlayerProps {
  voiceText: string;
  audioVoiceBase64?: string;
  audioMimeType?: string;
}

export default function AudioPlayer({ voiceText, audioVoiceBase64, audioMimeType = "audio/wav" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useBrowserTTS, setUseBrowserTTS] = useState(!audioVoiceBase64);
  const [isBrowserSpeaking, setIsBrowserSpeaking] = useState(false);
  const [processedAudioSrc, setProcessedAudioSrc] = useState<string | undefined>(undefined);

  // Sync state when new recommendations arrive from the backend
  useEffect(() => {
    setUseBrowserTTS(!audioVoiceBase64);
    setIsPlaying(false);
    setIsBrowserSpeaking(false);
    
    // Stop any ongoing browser speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [audioVoiceBase64, voiceText]);

  // Translate Base64 PCM elements containing raw linear16 data into full-bodied WAV wrappers
  useEffect(() => {
    if (!audioVoiceBase64) {
      setProcessedAudioSrc(undefined);
      return;
    }

    try {
      // Determine if base64 contains standard headers (mp3 or wav with RIFF chunk metadata starting with 'UklGR')
      const isPreFormatted = 
        audioVoiceBase64.startsWith("UklGR") || 
        audioMimeType === "audio/mpeg" || 
        audioMimeType === "audio/mp3" || 
        audioMimeType.includes("mpeg") || 
        audioMimeType.includes("mp3");

      if (isPreFormatted) {
        setProcessedAudioSrc(`data:${audioMimeType};base64,${audioVoiceBase64}`);
        return;
      }

      // Convert raw linear16 24000Hz PCM stream bytes to rich WAV files
      const binaryString = window.atob(audioVoiceBase64);
      const dataLength = binaryString.length;
      const pcmBytes = new Uint8Array(dataLength);
      for (let i = 0; i < dataLength; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i);
      }

      const sampleRate = 24000; // Gemini default audio sampling rate
      const numChannels = 1;    // Mono config
      const bitsPerSample = 16; // 16-bit encoding depth

      const wavBuffer = new ArrayBuffer(44 + dataLength);
      const headerView = new DataView(wavBuffer);

      // Write WAV Structure ("RIFF" magic marker)
      headerView.setUint8(0, 0x52); // R
      headerView.setUint8(1, 0x49); // I
      headerView.setUint8(2, 0x46); // F
      headerView.setUint8(3, 0x46); // F
      
      // Set Subchunk1 size
      headerView.setUint32(4, 36 + dataLength, true);

      // WAVE identification header
      headerView.setUint8(8, 0x57);  // W
      headerView.setUint8(9, 0x41);  // A
      headerView.setUint8(10, 0x56); // V
      headerView.setUint8(11, 0x45); // E

      // Format tag header ("fmt ")
      headerView.setUint8(12, 0x66); // f
      headerView.setUint8(13, 0x6d); // m
      headerView.setUint8(14, 0x74); // t
      headerView.setUint8(15, 0x20); // ' '

      // Subchunk size
      headerView.setUint32(16, 16, true);
      // Format code: PCM = 1
      headerView.setUint16(20, 1, true);
      // Channels count: Mono = 1
      headerView.setUint16(22, numChannels, true);
      // Sampling rate
      headerView.setUint32(24, sampleRate, true);
      // Byte rate
      headerView.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
      // Block alignment factor
      headerView.setUint16(32, numChannels * (bitsPerSample / 8), true);
      // Bits per sample
      headerView.setUint16(34, bitsPerSample, true);

      // Data subchunk chunk tag ("data")
      headerView.setUint8(36, 0x64); // d
      headerView.setUint8(37, 0x61); // a
      headerView.setUint8(38, 0x74); // t
      headerView.setUint8(39, 0x61); // a

      // Subchunk data payload dimension
      headerView.setUint32(40, dataLength, true);

      // Assemble final array bytes
      const wavUint8Array = new Uint8Array(wavBuffer);
      wavUint8Array.set(pcmBytes, 44);

      const blob = new Blob([wavUint8Array], { type: "audio/wav" });
      const objectUrl = URL.createObjectURL(blob);
      setProcessedAudioSrc(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } catch (e: any) {
      console.error("PCM stream translation crashed, reverting to raw fallback base64:", e.message);
      setProcessedAudioSrc(`data:${audioMimeType};base64,${audioVoiceBase64}`);
    }
  }, [audioVoiceBase64, audioMimeType]);

  // Clean playbacks on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePlayback = () => {
    if (isBrowserSpeaking) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsBrowserSpeaking(false);
      return;
    }

    if (!audioVoiceBase64) {
      triggerBrowserSpeech();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsBrowserSpeaking(false);

      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn("Audio playback stalled or blocked by gesture constraints:", err);
          // Auto-fallback with full conversational state tracking to standard TTS Engine
          triggerBrowserSpeech();
        });
    }
  };

  const triggerBrowserSpeech = () => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis unsupported by user environment browser.");
      return;
    }

    if (isBrowserSpeaking) {
      window.speechSynthesis.cancel();
      setIsBrowserSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(voiceText);
      
      // Try resolving English neutral/aesthetic voice profiles if they exist
      const voices = window.speechSynthesis.getVoices();
      const idealVoice = voices.find(v => v.lang.startsWith("en-") && v.name.toLowerCase().includes("google")) || 
                         voices.find(v => v.lang.startsWith("en-")) || 
                         null;
      if (idealVoice) {
        utterance.voice = idealVoice;
      }
      
      utterance.pitch = 1.0;
      utterance.rate = 1.05;

      utterance.onend = () => {
        setIsBrowserSpeaking(false);
      };

      utterance.onerror = () => {
        setIsBrowserSpeaking(false);
      };

      setIsBrowserSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-emerald-50 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4" id="audio-synthesizer-bar">
      {processedAudioSrc && (
        <audio 
          ref={audioRef} 
          src={processedAudioSrc} 
          onEnded={handleAudioEnded}
          id="tts-audio-element"
        />
      )}

      {/* Synthesis Metadata */}
      <div className="flex items-center gap-3.5 w-full md:w-auto text-left" id="synthesis-details-row">
        <div className={`w-10 h-10 border border-black flex items-center justify-center ${
          isPlaying || isBrowserSpeaking 
            ? "bg-black text-white" 
            : "bg-white text-black"
        }`} id="audio-icon-box">
          <Headphones className="w-5 h-5 animate-bounce" />
        </div>

        <div className="min-w-0" id="audio-diagnostics">
          <div className="flex flex-wrap items-center gap-2" id="diagnostics-headline">
            <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wider block">
              VOICE RECOMMENDATION AUDITOR
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 border border-black bg-white text-black font-mono" id="engine-badge">
              <Sparkles className="w-2.5 h-2.5 inline text-black" /> {audioVoiceBase64 ? "GEMINI-TTS NEURAL" : "LOCAL-SPEECH API"}
            </span>
          </div>
          <p className="text-sm font-serif text-black font-medium line-clamp-2 mt-1 italic pr-2" id="speech-transcript">
            &ldquo;{voiceText}&rdquo;
          </p>
        </div>
      </div>

      {/* Control Actions & Audio Equalizer representation */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-black/10 pt-3.5 md:pt-0" id="audio-controls-row">
        {/* Animated simulation Equalizer Bars */}
        {(isPlaying || isBrowserSpeaking) && (
          <div className="flex items-end gap-1 px-2 h-6" id="audio-soundwave-anim">
            <span className="w-0.5 bg-black h-3 animate-bounce" style={{ animationDelay: "0.1s" }} />
            <span className="w-0.5 bg-black h-5 animate-bounce" style={{ animationDelay: "0.3s" }} />
            <span className="w-0.5 bg-black h-2 animate-bounce" style={{ animationDelay: "0.5s" }} />
            <span className="w-0.5 bg-black h-6 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span className="w-0.5 bg-black h-4 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        )}

        <button
          onClick={togglePlayback}
          className={`px-4 py-2 border-2 border-black text-xs font-bold font-mono transition-none ${
            isPlaying || isBrowserSpeaking
              ? "bg-black text-white hover:bg-zinc-800"
              : "bg-white text-black hover:bg-zinc-100"
          }`}
          id="audio-action-btn"
        >
          {isPlaying || isBrowserSpeaking ? (
            <span className="flex items-center gap-1.5 uppercase">
              <Pause className="w-4 h-4 fill-current" />
              Mute Speech
            </span>
          ) : (
            <span className="flex items-center gap-1.5 uppercase">
              <Play className="w-4 h-4 fill-current" />
              Play Synthesis
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
