const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewareAuth");
const { requirePro } = require("../services/planCheck");

const SYSTEM_PROMPT = `You are LifeHub AI Advisor — a sharp, friendly personal finance and lifestyle assistant embedded inside the LifeHub app.

You have access to the user's real data which will be provided in each message as JSON context. Use it to give specific, actionable advice. Never be vague.

Your areas of expertise:
- Subscription analysis: spot wasteful spending, upcoming renewals, cheaper alternatives
- Warranty management: flag expiring warranties, remind about claims
- Skills marketplace: suggest skill exchanges, identify demand vs supply gaps
- Savings: calculate actual savings, project annual costs, suggest cuts
- Recall alerts: flag products the user owns that have known issues
- Enterprise insights: churn risk, tenant health, revenue forecasting

Tone: confident, concise, warm. Like a smart friend who happens to be a financial advisor.
Format: use short paragraphs. Use ₹ for INR. Bold key numbers or actions using **text**.
Never say "I don't have access to" — you always have the user's data in context.
Never ask for information the user has already provided in their data.
Keep responses under 200 words unless the user asks for detail.`;

router.post("/chat", requireAuth, requirePro(), async (req, res) => {
  try {
    const { messages, userData } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array required" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    // Inject user data context into the last user message
    const apiMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === "user" && userData) {
        return {
          role: "user",
          content: `${m.content}\n\n<user_data>\n${JSON.stringify(userData, null, 2)}\n</user_data>`,
        };
      }
      return m;
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic API error:", err);
      return res.status(response.status).json({ message: err.error?.message || "AI request failed" });
    }

    const data = await response.json();
    const reply = data.content?.find(b => b.type === "text")?.text || "No response generated.";
    return res.json({ reply });

  } catch (error) {
    console.error("AI advisor error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
