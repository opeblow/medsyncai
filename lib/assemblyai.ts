export const VOICE_AGENT_WS_URL = "wss://agents.assemblyai.com/v1/ws";
export const VOICE_AGENT_TOKEN_URL = "https://agents.assemblyai.com/v1/token";
export const SAMPLE_RATE = 24000;

export const MEDSYNC_SYSTEM_PROMPT = `You are MedSync AI, a warm, professional, and empathetic voice health companion.

YOUR PERSONALITY:
- You speak like a caring, experienced nurse — warm, reassuring, and professional.
- You use simple, clear language — avoid medical jargon unless asked.
- You are patient and never rush the conversation.
- You show empathy: "I understand that must be uncomfortable" or "I'm sorry to hear that."
- You ALWAYS remind users you are an AI health companion, not a replacement for professional medical advice.

YOUR CONVERSATION STYLE:
- Ask ONE follow-up question at a time — never batch multiple questions.
- Acknowledge what the user said before asking the next question.
- Use transitional phrases: "Thank you for sharing that. Let me ask..."
- Keep responses concise — 2-3 sentences max per turn when gathering info.

YOUR CAPABILITIES (use tools when appropriate):
1. SYMPTOM TRIAGE: When a user describes symptoms, use lookup_symptoms to find possible conditions, then use triage_severity to classify urgency. Ask follow-up questions to narrow down the diagnosis.
2. MEDICATION INFO: When asked about medications, use get_medication_info to provide accurate dosage, side effects, and warnings.
3. DRUG INTERACTIONS: When a user mentions taking multiple medications, use check_drug_interactions to check for dangerous combinations.
4. HEALTH JOURNALING: At the end of a symptom conversation, use log_health_entry to save symptoms, mood, and notes to their health journal.
5. HEALTH HISTORY: Use get_health_history when the user mentions recurring symptoms or asks "has this happened before?"
6. MEDICATION REMINDERS: Use schedule_reminder when users want to be reminded to take medications or appointments.
7. EMERGENCY ESCALATION: If symptoms suggest a medical emergency (chest pain with arm/jaw pain, stroke symptoms, severe breathing difficulty, suicidal thoughts), IMMEDIATELY use emergency_escalate and clearly tell the user to call 911 or go to the ER.

SAFETY RULES:
- ALWAYS include this disclaimer after giving health advice: "Please remember, I'm an AI health companion and this is not a substitute for professional medical advice. If you're concerned, please consult with a healthcare provider."
- NEVER diagnose definitively — say "this could possibly be" or "this might suggest."
- NEVER prescribe medication — say "you might want to discuss with your doctor."
- ALWAYS escalate emergencies immediately.
- If someone mentions mental health crisis or suicidal thoughts, provide the 988 Suicide and Crisis Lifeline number immediately and use emergency_escalate.

CONVERSATION FLOW:
1. Greet the user warmly.
2. Ask what brings them in today.
3. Listen to symptoms and ask focused follow-up questions (one at a time).
4. Use tools to look up information.
5. Provide a summary of findings and recommended action.
6. Ask if they would like to log this in their health journal.`;

// Tool definitions for AssemblyAI Voice Agent API
// CRITICAL: Uses FLAT schema, NOT OpenAI's nested format
export const MEDSYNC_TOOLS = [
  {
    type: "function",
    name: "lookup_symptoms",
    description: "Look up possible medical conditions based on symptoms the user described. Returns matching conditions with likelihood and severity.",
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "List of symptoms described by the user, e.g. ['headache', 'nausea']"
        },
        duration: {
          type: "string",
          description: "How long the symptoms have lasted, e.g. '3 days'"
        }
      },
      required: ["symptoms"]
    }
  },
  {
    type: "function",
    name: "triage_severity",
    description: "Classify the urgency/severity level of symptoms. Returns severity level (critical, urgent, moderate, mild) and recommended action.",
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "List of symptoms"
        },
        duration: {
          type: "string",
          description: "Duration of symptoms"
        },
        additional_context: {
          type: "string",
          description: "Context like pre-existing conditions"
        }
      },
      required: ["symptoms"]
    }
  },
  {
    type: "function",
    name: "check_drug_interactions",
    description: "Check if two or more medications have known interactions.",
    parameters: {
      type: "object",
      properties: {
        medications: {
          type: "array",
          items: { type: "string" },
          description: "List of medication names"
        }
      },
      required: ["medications"]
    }
  },
  {
    type: "function",
    name: "get_medication_info",
    description: "Get detailed information about a specific medication including dosage, side effects, and warnings.",
    parameters: {
      type: "object",
      properties: {
        medication_name: {
          type: "string",
          description: "Name of the medication"
        }
      },
      required: ["medication_name"]
    }
  },
  {
    type: "function",
    name: "log_health_entry",
    description: "Save a health journal entry with symptoms, mood, notes, and severity.",
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "Symptoms discussed"
        },
        severity: {
          type: "string",
          enum: ["mild", "moderate", "urgent", "critical"],
          description: "Assessed severity"
        },
        mood: {
          type: "string",
          enum: ["good", "okay", "not_great", "bad", "terrible"],
          description: "User self-reported mood"
        },
        notes: {
          type: "string",
          description: "Summary notes from conversation"
        },
        recommended_action: {
          type: "string",
          description: "Recommended action"
        }
      },
      required: ["symptoms", "notes"]
    }
  },
  {
    type: "function",
    name: "get_health_history",
    description: "Retrieve past health journal entries to identify patterns or recurring symptoms.",
    parameters: {
      type: "object",
      properties: {
        symptom_filter: {
          type: "string",
          description: "Optional filter by symptom"
        }
      },
      required: []
    }
  },
  {
    type: "function",
    name: "schedule_reminder",
    description: "Set up a medication or appointment reminder.",
    parameters: {
      type: "object",
      properties: {
        reminder_type: {
          type: "string",
          enum: ["medication", "appointment", "follow_up", "check_in"],
          description: "Type of reminder"
        },
        title: {
          type: "string",
          description: "Reminder title, e.g. 'Take Ibuprofen 200mg'"
        },
        frequency: {
          type: "string",
          enum: ["once", "daily", "twice_daily", "weekly"],
          description: "Frequency"
        },
        time: {
          type: "string",
          description: "Time of day, e.g. '8:00 AM'"
        }
      },
      required: ["reminder_type", "title"]
    }
  },
  {
    type: "function",
    name: "emergency_escalate",
    description: "Trigger emergency protocol for life-threatening situations (chest pain with arm/jaw pain, stroke symptoms, severe breathing difficulty, suicidal thoughts).",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Why emergency was triggered"
        },
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "Critical symptoms detected"
        }
      },
      required: ["reason", "symptoms"]
    }
  }
];

// Explicit allowlisted registry mapping each registered tool to its backend route.
// Do not derive the endpoint from the tool name: `check_drug_interactions` maps to
// `check-interactions`, and any tool without a handler must fail loudly.
export const TOOL_ENDPOINTS: Record<string, string> = {
  lookup_symptoms: "/api/tools/lookup-symptoms",
  triage_severity: "/api/tools/triage-severity",
  check_drug_interactions: "/api/tools/check-interactions",
  get_medication_info: "/api/tools/get-medication-info",
  log_health_entry: "/api/tools/log-health-entry",
  get_health_history: "/api/tools/get-health-history",
  schedule_reminder: "/api/tools/schedule-reminder",
  emergency_escalate: "/api/tools/emergency-escalate",
};

export const VOICE_CONFIG = {
  voice: "anna",
  greeting: "Hi there! I'm MedSync, your health companion. How are you feeling today? Is there anything I can help you with?",
  input: {
    format: { encoding: "audio/pcm" },
    turn_detection: {
      vad_threshold: 0.5,
      min_silence: 300,
      max_silence: 1200,
      interrupt_response: true
    }
  },
  output: {
    format: { encoding: "audio/pcm" }
  }
};
