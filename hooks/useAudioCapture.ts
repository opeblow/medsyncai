"use client";

import { useState, useRef, useCallback } from "react";

interface UseAudioCaptureOptions {
  onAudioChunk: (chunk: Int16Array) => void;
}

export function useAudioCapture({ onAudioChunk }: UseAudioCaptureOptions) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      await audioCtx.audioWorklet.addModule("/pcm-processor.js");

      const source = audioCtx.createMediaStreamSource(stream);

      // Volume level analyzer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor", {
        processorOptions: { sampleRate: 24000 },
      });
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        const pcm16Chunk = event.data as Int16Array;
        if (pcm16Chunk && pcm16Chunk.length > 0) {
          onAudioChunk(pcm16Chunk);
        }
      };

      source.connect(workletNode);
      // Connect to destination to keep node active (muted to avoid feedback)
      const silenceGain = audioCtx.createGain();
      silenceGain.gain.value = 0;
      workletNode.connect(silenceGain);
      silenceGain.connect(audioCtx.destination);

      // Monitor mic volume for visualizer
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(1, avg / 128));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      setIsCapturing(true);
    } catch (err: any) {
      console.error("Failed to start audio capture:", err);
      setError(err.message || "Microphone access denied");
      setIsCapturing(false);
    }
  }, [onAudioChunk]);

  const stopCapture = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsCapturing(false);
    setMicVolume(0);
  }, []);

  return { startCapture, stopCapture, isCapturing, micVolume, error };
}
