/**
 * نهى - نموذج الذكاء الاصطناعي من منصة علم
 * Nahya LLM integration helper - compatible with OpenAI API format
 */
import { ENV } from "./env";

export type NahyaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type NahyaResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: { name: string; strict?: boolean; schema: Record<string, unknown> } };

export type NahyaParams = {
  messages: NahyaMessage[];
  response_format?: NahyaResponseFormat;
  max_tokens?: number;
};

export type NahyaResult = {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * استدعاء نموذج نهى من منصة علم
 * Uses nuha-2.0 model with OpenAI-compatible API
 */
export async function invokeNahya(params: NahyaParams): Promise<NahyaResult> {
  const apiKey = ENV.nahyaApiKey;
  const apiBase = ENV.nahyaApiBase;

  if (!apiKey) {
    throw new Error("NAHYA_API_KEY is not configured");
  }

  const payload: Record<string, unknown> = {
    model: "nuha-2.0",
    messages: params.messages,
    max_tokens: params.max_tokens ?? 4096,
  };

  if (params.response_format) {
    payload.response_format = params.response_format;
  }

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Nahya API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as NahyaResult;
}
