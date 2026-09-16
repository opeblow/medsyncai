"use client";

import { useVoiceAgent, MessageItem } from "@/hooks/useVoiceAgent";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  Stethoscope,
  X,
  ShieldAlert,
  Phone,
  Clock,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

function AudioVisualizer({
  active,
  volume,
  agent,
}: {
  active: boolean;
  volume: number;
  agent: boolean;
}) {
  const bars = 24;
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = 4;
        const maxHeight = 28;
        const randomPhase = Math.sin(i * 0.7 + Date.now() * 0.003) * 0.3 + 0.5;
        const h = active
          ? baseHeight + (maxHeight - baseHeight) * volume * randomPhase
          : baseHeight;
        return (
          <div
            key={i}
            className={`w-[2px] rounded-full transition-all duration-100 ${
              agent ? "bg-gray-300" : "bg-blue-400"
            }`}
            style={{ height: `${Math.max(baseHeight, h)}px` }}
          />
        );
      })}
    </div>
  );
}

function TranscriptBubble({ msg }: { msg: MessageItem }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Stethoscope className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-md"
            : "bg-gray-100 text-gray-700 rounded-2xl rounded-tl-md"
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

export default function TalkPage() {
  const {
    connect,
    disconnect,
    connectionStatus,
    isAgentSpeaking,
    isUserSpeaking,
    isCapturing,
    transcript,
    currentUserText,
    currentAgentText,
    emergencyAlert,
    micVolume,
    error,
  } = useVoiceAgent();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, currentUserText, currentAgentText]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connectionStatus]);

  const statusText =
    connectionStatus === "connected"
      ? isAgentSpeaking
        ? "MedSync is speaking..."
        : isUserSpeaking
        ? "Listening to you..."
        : "MedSync is listening..."
      : connectionStatus === "connecting"
      ? "Setting up your session..."
      : connectionStatus === "error"
      ? error || "Connection error"
      : "";

  // ─── Pre-Connection State ───
  if (connectionStatus === "disconnected") {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <Stethoscope className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
          Ready to talk?
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Click below to start a voice conversation with MedSync, your health
          companion.
        </p>
        <button
          onClick={connect}
          className="bg-blue-600 text-white rounded-xl px-8 py-4 text-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-3"
        >
          <Mic className="w-6 h-6" />
          Start Conversation
        </button>
        <p className="text-xs text-gray-400 mt-6">
          Make sure your microphone is enabled
        </p>
        <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
          MedSync AI is an AI health companion and is not a substitute for
          professional medical advice, diagnosis, or treatment.
        </p>
      </div>
    );
  }

  // ─── Connected State ───
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Connection status pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              connectionStatus === "connected"
                ? "bg-emerald-50 text-emerald-700"
                : connectionStatus === "connecting"
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-emerald-500"
                  : connectionStatus === "connecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
              ? "Connecting..."
              : "Error"}
          </div>
          {connectionStatus === "connected" && (
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(elapsed)}
            </span>
          )}
        </div>
        <button
          onClick={disconnect}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          End Session
        </button>
      </div>

      {/* Emergency Alert Banner */}
      <AnimatePresence>
        {emergencyAlert && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-red-50 border border-red-200 rounded-xl p-5 mb-4"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">
                  Emergency Detected
                </h3>
                <div className="space-y-1 text-sm text-red-700">
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Call 911 immediately
                  </p>
                  <p>988 Suicide &amp; Crisis Lifeline — call or text 988</p>
                  <p>Poison Control — 1-800-222-1222</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 bg-gray-50/40 border border-gray-200 rounded-xl p-6 mb-4"
      >
        {transcript.map((msg) => (
          <TranscriptBubble key={msg.id} msg={msg} />
        ))}

        {/* Streaming partial user text */}
        {currentUserText && (
          <div className="flex items-start gap-3 justify-end">
            <div className="max-w-[75%] px-4 py-3 text-sm bg-blue-600/80 text-white rounded-2xl rounded-tr-md">
              {currentUserText}
              <span className="inline-block w-1 h-4 bg-white/60 ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* Streaming partial agent text */}
        {currentAgentText && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            <div className="max-w-[75%] px-4 py-3 text-sm bg-gray-100 text-gray-700 rounded-2xl rounded-tl-md">
              {currentAgentText}
              <span className="inline-block w-1 h-4 bg-gray-400/60 ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* Connecting placeholder */}
        {connectionStatus === "connecting" && transcript.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">
              Setting up your session...
            </span>
          </div>
        )}
      </div>

      {/* Visualizer */}
      <div className="mb-4">
        <AudioVisualizer
          active={isUserSpeaking || isAgentSpeaking}
          volume={isUserSpeaking ? micVolume : isAgentSpeaking ? 0.5 : 0}
          agent={isAgentSpeaking}
        />
      </div>

      {/* Mic Button & Status */}
      <div className="flex flex-col items-center gap-3 pb-4">
        <button
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isAgentSpeaking
              ? "bg-gray-200 text-gray-500 cursor-default"
              : isUserSpeaking
              ? "bg-blue-600 text-white ring-4 ring-blue-200"
              : connectionStatus === "connecting"
              ? "bg-blue-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isAgentSpeaking || connectionStatus === "connecting"}
        >
          {connectionStatus === "connecting" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isAgentSpeaking ? (
            <Volume2 className="w-6 h-6" />
          ) : isCapturing ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>
        <span className="text-xs text-gray-500 font-medium h-4">
          {statusText}
        </span>
      </div>
    </div>
  );
}
