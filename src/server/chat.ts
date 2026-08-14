import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const chatInputSchema = z.object({
  mood: z.enum(["happy", "sad", "angry", "neutral", "calm"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT = `You are Lumi, a warm, calm, listening presence inside a mood-tracking app. You are
not a therapist and never claim to be one. Keep replies short (2-4 sentences), gentle, and
conversational — like a caring friend, not a chatbot giving advice. Ask at most one gentle
question per reply. Never diagnose. If the person describes thoughts of self-harm, suicide, or
being in danger, gently and clearly encourage them to contact a crisis line or emergency services
right now, and keep the rest of your reply brief and caring.`;

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => chatInputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chat isn't configured yet.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nThe person's most recent check-in mood was: ${data.mood}.`,
      },
      contents: data.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    return {
      reply:
        response.text?.trim() || "I'm here, but I'm having trouble finding the words right now.",
    };
  });
