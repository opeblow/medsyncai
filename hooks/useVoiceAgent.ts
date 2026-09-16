"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAudioCapture } from "./useAudioCapture";
import { useAudioPlayback } from "./useAudioPlayback";
import { int16ToBase64 } from "@/lib/audio-utils";
import {
  VOICE_AGENT_WS_URL,
  MEDSYNC_SYSTEM_PROMPT,
  MEDSYNC_TOOLS,
  TOOL_ENDPOINTS,
  VOICE_CONFIG,
} from "@/lib/assemblyai";

// Adapter for AssemblyAI realtime transcript events. The documented payload
// fields are `text` (full/partial transcript) and `delta` (incremental text),
// NOT `transcript`.
function eventText(msg: any): string | null {
  if (msg.type === "transcript.user.delta" || msg.type === "transcript.user") {
    return typeof msg.text === "string" ? msg.text : null;
  }
  if (msg.type === "transcript.agent.delta") {
    return typeof msg.delta === "string" ? msg.delta : null;
  }
  if (msg.type === "transcript.agent") {
    return typeof msg.text === "string" ? msg.text : null;
  }
  return null;
}

export interface MessageItem {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function useVoiceAgent() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<MessageItem[]>([]);
  const [currentUserText, setCurrentUserText] = useState("");
  const [currentAgentText, setCurrentAgentText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pendingToolResultsRef = useRef<Array<{ call_id: string; result: any }>>([]);
  const replyInFlightRef = useRef<boolean>(false);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionDurationRef = useRef<number>(0);

  const { queueAudio, flushAudio, isPlaying } = useAudioPlayback();

  // Send PCM audio chunk to AssemblyAI WebSocket
  const handleAudioChunk = useCallback(
    (pcm16Chunk: Int16Array) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const base64Audio = int16ToBase64(pcm16Chunk);
        wsRef.current.send(
          JSON.stringify({
            type: "input.audio",
            audio: base64Audio,
          })
        );
      }
    },
    []
  );

  const { startCapture, stopCapture, isCapturing, micVolume, error: micError } = useAudioCapture({
    onAudioChunk: handleAudioChunk,
  });

  // Send any queued tool results. A slow tool call can finish after reply.done
  // has already fired; drain on completion as well as on reply.done so results
  // are never stranded until the next turn.
  const drainToolResults = useCallback(() => {
    if (pendingToolResultsRef.current.length === 0) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    for (const toolRes of pendingToolResultsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "tool.result",
          call_id: toolRes.call_id,
          result: JSON.stringify(toolRes.result),
        })
      );
    }
    pendingToolResultsRef.current = [];
  }, []);

  // Execute tool calls on Next.js backend API routes
  const handleToolCall = useCallback(
    async (callId: string, name: string, args: any) => {
      try {
        const endpoint = TOOL_ENDPOINTS[name];
        if (!endpoint) {
          throw new Error(`Unregistered tool: ${name}`);
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(args),
        });

        const data = await res.json();

        if (name === "emergency_escalate" && data.escalated) {
          setEmergencyAlert(data);
        }

        pendingToolResultsRef.current.push({
          call_id: callId,
          result: data,
        });

        if (!replyInFlightRef.current) {
          drainToolResults();
        }
      } catch (err: any) {
        console.error(`Tool execution error for ${name}:`, err);
        pendingToolResultsRef.current.push({
          call_id: callId,
          result: { error: "Tool execution failed" },
        });
        if (!replyInFlightRef.current) {
          drainToolResults();
        }
      }
    },
    [drainToolResults]
  );

  const connect = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus("connecting");
      setTranscript([]);
      setCurrentUserText("");
      setCurrentAgentText("");
      setEmergencyAlert(null);
      pendingToolResultsRef.current = [];

      // Step 1: Mint temporary authentication token
      const tokenRes = await fetch("/api/voice-token");
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error || "Failed to mint session token");
      }

      const token = tokenData.token;

      // Step 2: Open WebSocket connection
      const ws = new WebSocket(`${VOICE_AGENT_WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Step 3: Send session.update IMMEDIATELY on open
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              system_prompt: MEDSYNC_SYSTEM_PROMPT,
              greeting: VOICE_CONFIG.greeting,
              input: VOICE_CONFIG.input,
              output: {
                voice: VOICE_CONFIG.voice,
                format: VOICE_CONFIG.output.format,
              },
              tools: MEDSYNC_TOOLS,
            },
          })
        );
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case "session.ready":
              setConnectionStatus("connected");
              setSessionId(msg.session_id);
              sessionStartTimeRef.current = Date.now();
              // Start mic streaming once session is ready
              const captureResult = await startCapture();
              if (!captureResult.ok) {
                setError(captureResult.error || "Microphone access failed");
                setConnectionStatus("error");
              }
              break;

            case "input.speech.started":
              setIsUserSpeaking(true);
              // Interruption: flush pending audio playing
              flushAudio();
              break;

            case "input.speech.stopped":
              setIsUserSpeaking(false);
              break;

            case "transcript.user.delta": {
              const userDelta = eventText(msg);
              if (userDelta !== null) {
                setCurrentUserText(userDelta);
              }
              break;
            }

            case "transcript.user": {
              const userFinal = eventText(msg);
              if (userFinal !== null) {
                setTranscript((prev) => [
                  ...prev,
                  {
                    id: `msg-${Date.now()}-${Math.random()}`,
                    role: "user",
                    text: userFinal,
                    timestamp: new Date(),
                  },
                ]);
                setCurrentUserText("");
              }
              break;
            }

            case "reply.started":
              setIsAgentSpeaking(true);
              setCurrentAgentText("");
              replyInFlightRef.current = true;
              break;

            case "reply.audio":
              // CRITICAL: AssemblyAI uses "data" field for reply.audio
              if (msg.data) {
                queueAudio(msg.data);
              }
              break;

            case "transcript.agent.delta": {
              const agentDelta = eventText(msg);
              if (agentDelta !== null) {
                setCurrentAgentText((prev) => prev + agentDelta);
              }
              break;
            }

            case "transcript.agent": {
              const agentFinal = eventText(msg);
              if (agentFinal !== null) {
                setTranscript((prev) => [
                  ...prev,
                  {
                    id: `msg-${Date.now()}-${Math.random()}`,
                    role: "agent",
                    text: agentFinal,
                    timestamp: new Date(),
                  },
                ]);
                setCurrentAgentText("");
              }
              break;
            }

            case "reply.done":
              setIsAgentSpeaking(false);
              replyInFlightRef.current = false;

              if (msg.status === "interrupted") {
                // User interrupted: flush audio and discard pending tool results
                flushAudio();
                pendingToolResultsRef.current = [];
              } else {
                // Drain tool results for the completed reply
                drainToolResults();
              }
              break;

            case "tool.call":
              if (msg.call_id && msg.name) {
                handleToolCall(msg.call_id, msg.name, msg.arguments || {});
              }
              break;

            case "session.error":
            case "error":
              console.error("AssemblyAI Session Error:", msg);
              setError(msg.message || "Voice session encountered an error");
              setConnectionStatus("error");
              break;

            default:
              break;
          }
        } catch (err) {
          console.error("Error parsing WebSocket event:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket Connection Error:", err);
        setError("WebSocket connection error");
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        setIsAgentSpeaking(false);
        setIsUserSpeaking(false);
        stopCapture();
      };
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to start conversation");
      setConnectionStatus("error");
      stopCapture();
    }
  }, [queueAudio, flushAudio, startCapture, stopCapture, handleToolCall, drainToolResults]);

  const disconnect = useCallback(() => {
    if (sessionStartTimeRef.current) {
      sessionDurationRef.current = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    }
    stopCapture();
    flushAudio();
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "session.end" }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus("disconnected");
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
  }, [stopCapture, flushAudio]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connectionStatus,
    isAgentSpeaking,
    isUserSpeaking,
    isCapturing,
    isPlaying,
    transcript,
    currentUserText,
    currentAgentText,
    sessionId,
    micVolume,
    emergencyAlert,
    error,
    microphoneError: micError,
    sessionDuration: sessionDurationRef.current,
  };
}
