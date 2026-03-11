import OpenAI from "openai";

// Node.js runtime: 60s timeout vs edge's 10s, required for streaming GPT responses
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a warm, empathetic business advisor for "Business First Aid", a service that helps Israeli businesses in crisis. 
Your role is to have a short, supportive conversation with a business owner to understand their situation BEFORE they fill out a diagnostic form.

LANGUAGE: Detect the language of the first user message and respond in the same language throughout (Hebrew or English).

YOUR GOAL: After 2-4 conversational turns, extract:
- main_problem: one of [tourism_loss, demand_drop, staffing, cashflow, supply_chain, overwhelmed, legal_regulatory, unclear]
- severity: one of [mild, moderate, severe, critical]  
- changes: array of any that apply [revenue_drop, tourism_disappeared, closed_temporarily, employees_unavailable, costs_increased, supply_unreliable, marketing_not_working, no_clear_plan]
- help_needed: one of [marketing_help, finance_help, operations_help, legal_help, prioritisation, emotional_support]
- urgency: one of [today, 2_3_days, week, month]
- stress_level: integer 1-5 inferred from tone (1=calm, 5=panic)
- summary: 1-2 sentence summary of their situation in their language

CONVERSATION RULES:
- Be warm and human. Start with: "Hi, I'm here to help. Tell me what's going on with your business, in your own words, no need to be formal." (or Hebrew equivalent)
- Ask at most 2 follow-up questions. Keep it short.
- Do NOT ask them to fill out forms or list options.
- Pick up on emotional signals (urgency words, stress level from language patterns).
- When you have enough information (usually after 1-3 user messages), respond with your empathetic summary AND append the extraction block.

WHEN READY TO PROCEED, end your final message with exactly this block (on a new line):
##TRIAGE_DATA##
{"main_problem":"...","severity":"...","changes":[...],"help_needed":"...","urgency":"...","stress_level":3,"summary":"..."}
##END##

Do NOT include the ##TRIAGE_DATA## block in any message except the final one.`;

const openaiClient = new OpenAI();

export async function POST(req: Request) {
  // Fast-fail if the env var is missing so errors are visible, not silent
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY is not configured on this deployment", {
      status: 500,
    });
  }

  const { messages } = await req.json();
  const encoder = new TextEncoder();

  // Use the raw OpenAI SDK with streaming, bypassing the AI SDK wrapper.
  // Errors from the OpenAI API are surfaced in the response body.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 500,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("[chat stream error]", err);
        controller.enqueue(
          encoder.encode(`\n[Server error: ${String(err)}]`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
