const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_OLLAMA_MODEL = "gemma3:1b";
const MAX_OUTPUT_TOKENS = 160;
const DEFAULT_GEMINI_TIMEOUT_MS = 20000;
const MIN_GEMINI_TIMEOUT_MS = 1000;
const MAX_GEMINI_TIMEOUT_MS = 60000;
const OLLAMA_TIMEOUT_MS = 8000;

const createProviderError = (stage, message, details = {}) =>
  Object.assign(new Error(message), { stage, ...details });

const getGeminiTimeoutMs = () => {
  const timeoutText = process.env.GEMINI_TIMEOUT_MS?.trim();
  const geminiTimeoutMs = timeoutText ? Number(timeoutText) : DEFAULT_GEMINI_TIMEOUT_MS;
  if (
    !Number.isInteger(geminiTimeoutMs) ||
    geminiTimeoutMs < MIN_GEMINI_TIMEOUT_MS ||
    geminiTimeoutMs > MAX_GEMINI_TIMEOUT_MS
  ) {
    throw createProviderError(
      "configuration",
      `GEMINI_TIMEOUT_MS must be an integer between ${MIN_GEMINI_TIMEOUT_MS} and ${MAX_GEMINI_TIMEOUT_MS}.`
    );
  }

  return geminiTimeoutMs;
};

const readSettings = () => ({
  provider: (process.env.AI_PROVIDER || "gemini").trim().toLowerCase(),
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  geminiModel: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  ollamaUrl: (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, ""),
  ollamaModel: process.env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL,
});

const assertModelName = (model) => {
  if (!/^[\w.-]{1,100}$/.test(model)) {
    throw createProviderError("configuration", "The configured AI model name is invalid.");
  }
  return model;
};

const safeDiagnosticText = (value, apiKey) => {
  if (typeof value !== "string") return undefined;
  let text = value.replace(/[\r\n\t]+/g, " ").trim();
  if (apiKey) text = text.split(apiKey).join("[redacted]");
  text = text.replace(/\bAIza[\w-]{20,}\b/g, "[redacted]");
  return text.slice(0, 500);
};

const getGoogleError = async (response, apiKey) => {
  let body;
  try {
    body = await response.json();
  } catch {
    return {
      googleCode: response.status,
      message: "Google returned a non-JSON error response.",
      details: [],
    };
  }

  const error = body?.error;
  const message = safeDiagnosticText(error?.message, apiKey);
  const details = Array.isArray(error?.details)
    ? error.details.slice(0, 5).map((detail) => {
        const info = detail && typeof detail === "object" ? detail : {};
        return {
          type: safeDiagnosticText(info["@type"], apiKey),
          reason: safeDiagnosticText(
            info.reason || info.metadata?.reason || info.status,
            apiKey
          ),
          domain: safeDiagnosticText(info.domain, apiKey),
          service: safeDiagnosticText(info.metadata?.service, apiKey),
        };
      }).filter((detail) => Object.values(detail).some(Boolean))
    : [];
  return {
    googleCode: Number.isInteger(error?.code) ? error.code : response.status,
    googleStatus: safeDiagnosticText(error?.status, apiKey),
    message: message || "Google did not provide an error message.",
    details,
  };
};

const getHttpErrorCategory = (status, googleStatus) => {
  const providerStatus = String(googleStatus || "").toUpperCase();
  if (/API_KEY_INVALID|INVALID_API_KEY/.test(providerStatus)) return "Check that the API key is valid.";
  if (status === 400) return "Malformed request or unsupported request parameters.";
  if (status === 401 || status === 403 || providerStatus === "PERMISSION_DENIED") {
    return "Check the API key and API access permissions.";
  }
  if (status === 404 || providerStatus === "NOT_FOUND") {
    return "Check that the configured Gemini model and API endpoint are available.";
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|RATE_LIMIT/.test(providerStatus)) {
    return "Gemini quota or rate limit was reached.";
  }
  if (status >= 500) return "Gemini service is temporarily unavailable.";
  return "Gemini rejected the request.";
};

const getResponseText = (data) => {
  const generatedParts = data.candidates?.[0]?.content?.parts;
  if (Array.isArray(generatedParts)) {
    return generatedParts
      .filter((part) => typeof part.text === "string")
      .map((part) => part.text)
      .join("")
      .trim();
  }
  if (typeof data.message?.content === "string") return data.message.content.trim();
  if (typeof data.response === "string") return data.response.trim();
  return "";
};

const callGemini = async ({ input, systemInstruction }, settings) => {
  if (!settings.geminiApiKey) {
    throw createProviderError("configuration", "GEMINI_API_KEY is not configured.");
  }

  const model = assertModelName(settings.geminiModel);
  const timeoutMs = getGeminiTimeoutMs();
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": settings.geminiApiKey,
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: input }],
            },
          ],
          generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.3,
          },
        }),
      }
    );
  } catch (error) {
    const timedOut = ["TimeoutError", "AbortError"].includes(error.name);
    throw createProviderError(
      "request",
      timedOut
        ? `Gemini request timed out after ${timeoutMs}ms.`
        : "Gemini network request failed before receiving an HTTP response.",
      { failureType: timedOut ? "timeout" : "network", causeName: error.name }
    );
  }

  if (!response.ok) {
    const googleError = await getGoogleError(response, settings.geminiApiKey);
    const detailText = googleError.details.length
      ? ` Details: ${JSON.stringify(googleError.details)}.`
      : "";
    throw createProviderError(
      "http_response",
      `Gemini HTTP ${response.status} (Google code ${googleError.googleCode}${googleError.googleStatus ? `, ${googleError.googleStatus}` : ""}): ${googleError.message} ${getHttpErrorCategory(response.status, googleError.googleStatus)}${detailText}`,
      {
        httpStatus: response.status,
        googleCode: googleError.googleCode,
        googleStatus: googleError.googleStatus,
        googleDetails: googleError.details,
      }
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw createProviderError(
      "response_parsing",
      "Gemini returned HTTP success but its response body was not valid JSON.",
      { causeName: error.name }
    );
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createProviderError(
      "response_parsing",
      "Gemini returned JSON with an unexpected response shape."
    );
  }
  const answer = getResponseText(data);
  if (!answer) {
    const candidate = data.candidates?.[0];
    const finishReason = safeDiagnosticText(candidate?.finishReason);
    const blockReason = safeDiagnosticText(data.promptFeedback?.blockReason);
    const reason = blockReason
      ? `Prompt blocked: ${blockReason}.`
      : finishReason
        ? `Candidate finish reason: ${finishReason}.`
        : "Gemini returned no candidate text.";
    throw createProviderError("text_extraction", `Gemini response contained no usable text. ${reason}`, {
      finishReason,
      blockReason,
      candidateCount: Array.isArray(data.candidates) ? data.candidates.length : 0,
    });
  }
  return answer.slice(0, 900);
};

const callOllama = async ({ input, systemInstruction }, settings) => {
  const ollamaUrl = new URL(settings.ollamaUrl);
  if (!["http:", "https:"].includes(ollamaUrl.protocol)) {
    throw new Error("OLLAMA_URL must use HTTP or HTTPS.");
  }

  const model = assertModelName(settings.ollamaModel);
  const response = await fetch(`${settings.ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: input },
      ],
      options: { temperature: 0.3, num_predict: MAX_OUTPUT_TOKENS },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with HTTP ${response.status}.`);
  }
  const data = await response.json();
  const answer = getResponseText(data);
  if (!answer) throw new Error("Ollama returned an empty response.");
  return answer.slice(0, 900);
};

const generateAIResponse = async (prompt) => {
  const settings = readSettings();
  if (settings.provider === "none") {
    throw new Error("AI assistance is disabled.");
  }
  if (settings.provider === "gemini") return callGemini(prompt, settings);
  if (settings.provider === "ollama") return callOllama(prompt, settings);
  throw new Error("AI_PROVIDER must be gemini, ollama, or none.");
};

module.exports = {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_GEMINI_TIMEOUT_MS,
  MAX_GEMINI_TIMEOUT_MS,
  MIN_GEMINI_TIMEOUT_MS,
  MAX_OUTPUT_TOKENS,
  getGeminiTimeoutMs,
  generateAIResponse,
  getResponseText,
  readSettings,
};
