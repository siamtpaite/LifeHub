const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const subscriptions = require("./routes/subscriptions");
const warranties = require("./routes/warranties");
const skills = require("./routes/skills");
const savings = require("./routes/savings");
const monetisation = require("./routes/monetisation");
const analytics = require("./routes/analytics");
const localization = require("./routes/localization");
const recalls = require("./routes/recalls");
const predictions = require("./routes/predictions");
const enterprise = require("./routes/enterprise");
const audit = require("./routes/audit");
const auth = require("./routes/auth");
const aiAdvisor = require("./routes/ai-advisor");
const checkExpiring = require("./cron/checkExpiring");

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // CSP set at CDN/Vercel level for the frontend
  crossOriginResourcePolicy: { policy: "same-site" },
}));

// CORS — only allow known origins
const allowedOrigins = [
  "https://lifehub.fit",
  "https://www.lifehub.fit",
  "https://lifehub-bay.vercel.app",
  // Allow any *.vercel.app preview URL during development
  /^https:\/\/lifehub.*\.vercel\.app$/,
  // Local dev
  "http://localhost:3000",
  "http://localhost:5000",
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Vercel internals, webhooks) and known origins
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error("Not allowed by CORS"), allowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"],
}));

// Body size limits to prevent payload DoS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// General API rate limit — 200 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Tighter limit for webhook and AI endpoints
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit reached. Please wait before sending more messages." },
});

app.use("/api/", apiLimiter);
app.use("/api/monetisation/gumroad/webhook", webhookLimiter);
app.use("/api/monetisation/revenuecat/webhook", webhookLimiter);
app.use("/api/ai/", aiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "lifehub-backend" });
});

app.use("/api/subscriptions", subscriptions);
app.use("/api/warranties", warranties);
app.use("/api/skills", skills);
app.use("/api/savings", savings);
app.use("/api/monetisation", monetisation);
app.use("/api/analytics", analytics);
app.use("/api/localization", localization);
app.use("/api/recalls", recalls);
app.use("/api/predictions", predictions);
app.use("/api/enterprise", enterprise);
app.use("/api/audit", audit);
app.use("/api/auth", auth);
app.use("/api/ai", aiAdvisor);

// Vercel Cron Job — runs daily at 8am IST (2:30 UTC)
app.get("/api/cron/check-expiring", checkExpiring);

const PORT = process.env.PORT || 5000;

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}
