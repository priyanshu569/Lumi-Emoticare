import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Chat isn't configured yet.");
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 500,
      system: `${SYSTEM_PROMPT}\n\nThe person's most recent check-in mood was: ${data.mood}.`,
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    if (response.stop_reason === "refusal") {
      return {
        reply:
          "I'm not able to respond to that one. Let's talk about something else — or if you need a real person right now, there are crisis resources just below.",
      };
    }

    const textBlock = response.content.find((block) => block.type === "text");
    return {
      reply:
        textBlock?.type === "text"
          ? textBlock.text
          : "I'm here, but I'm having trouble finding the words right now.",
    };
  });
