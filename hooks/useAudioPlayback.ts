"use client";

import { useState, useRef, useCallback } from "react";
import { base64ToInt16, int16ToFloat32 } from "@/lib/audio-utils";

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isPlayingCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const queueAudio = useCallback((base64Data: string) => {
    try {
      const audioCtx = getAudioContext();
      const int16Samples = base64ToInt16(base64Data);
      const float32Samples = int16ToFloat32(int16Samples);

      const buffer = audioCtx.createBuffer(1, float32Samples.length, 24000);
      buffer.getChannelData(0).set(float32Samples);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextPlaybackTimeRef.current < currentTime) {
        nextPlaybackTimeRef.current = currentTime;
      }

      source.start(nextPlaybackTimeRef.current);
      nextPlaybackTimeRef.current += buffer.duration;

      activeSourcesRef.current.push(source);
      setIsPlaying(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsPlaying(false);
        }
      };
    } catch (err) {
      console.error("Error in audio playback:", err);
    }
  }, [getAudioContext]);

  const flushAudio = useCallback(() => {
    // Stop all playing / scheduled audio sources immediately (barge-in)
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (audioContextRef.current) {
      nextPlaybackTimeRef.current = audioContextRef.current.currentTime;
    } else {
      nextPlaybackTimeRef.current = 0;
    }
    setIsPlaying(false);
  }, []);

  return { queueAudio, flushAudio, isPlaying };
}
