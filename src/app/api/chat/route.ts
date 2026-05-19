import { NextResponse } from "next/server";
import { z } from "zod";

import logger from "@/lib/logger";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

function getFallbackReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
    return "Hello. I can help with DSC, IRCTC agent registration, required documents, verification steps, support details, and general guidance. What would you like to know?";
  }

  if (normalized.includes("dsc") && normalized.includes("document")) {
    return "For DSC, the commonly required documents are identity proof like PAN or Aadhaar, address proof, and basic applicant details. The exact list can vary by applicant type, so if you want, ask me for individual or business DSC requirements.";
  }

  if (normalized.includes("irctc")) {
    return "To start IRCTC agent onboarding, you usually create your profile, submit the required KYC and business details, complete verification, and then continue with approval steps. If you want, I can break the process into simple step-by-step points.";
  }

  if (normalized.includes("digital signature") || normalized.includes("what is dsc")) {
    return "A digital signature certificate is a secure electronic identity used to sign documents online and verify the signer. It is commonly used for compliance filings, tenders, registrations, and other verified digital workflows.";
  }

  if (normalized.includes("price") || normalized.includes("pricing") || normalized.includes("cost")) {
    return "Pricing can depend on certificate type, validity, and service requirements. I can explain the usual factors, but a human support teammate should confirm the exact current price.";
  }

  if (normalized.includes("support") || normalized.includes("contact")) {
    return "You can reach DongleIQ support through the contact section on the landing page. The page currently shows support hours as Monday to Friday, 9:00 AM to 6:00 PM.";
  }

  return "I can help with DSC, IRCTC agent registration, documents, verification, support, onboarding, and general guidance. Please ask your question in a little more detail and I will answer as clearly as I can.";
}

export async function POST(req: Request) {
  let fallbackMessage = "";

  try {
    const body = await req.json();
    fallbackMessage = typeof body?.message === "string" ? body.message : "";
    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { reply: "Please enter a valid message." },
        { status: 400 }
      );
    }

    const { message } = validation.data;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_api_key_here") {
      return NextResponse.json({ reply: getFallbackReply(message) });
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content:
              "You are DongleIQ's AI assistant. Help with DSC, IRCTC Agent ID, registration, documents, verification, support, onboarding, website guidance, and also answer normal general questions helpfully. Give direct, exact, concise answers. If exact pricing, legal policy, or account-specific status is requested, say a human support teammate should confirm it.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = (await openAIResponse.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
      error?: { message?: string };
    };

    if (!openAIResponse.ok) {
      logger.error("AI chat OpenAI error", {
        status: openAIResponse.status,
        message: data.error?.message,
      });

      return NextResponse.json({ reply: getFallbackReply(message) });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ reply: getFallbackReply(message) });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    logger.error("AI chat route failed", error);
    return NextResponse.json({
      reply: fallbackMessage
        ? getFallbackReply(fallbackMessage)
        : "I can help with DSC, IRCTC agent registration, documents, support, and onboarding. Please ask a more specific question.",
    });
  }
}
