const express = require("express");
const cors = require("cors");
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
const tenants = require("./routes/tenants");
const audit = require("./routes/audit");
const security = require("./routes/security");
const auth = require("./routes/auth");
const aiAdvisor = require("./routes/ai-advisor");
const checkExpiring = require("./cron/checkExpiring");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.use("/api/tenants", tenants);
app.use("/api/audit", audit);
app.use("/api/security", security);
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
