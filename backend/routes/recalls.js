const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { aggregateRecalls } = require("../services/recallService");

const router = express.Router();

// GET /api/recalls?products=ProductA,ProductB,ProductC
// Fetch recalls that match user's products (from their Warranties)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { products } = req.query;
    
    if (!products) {
      return res.json({});
    }

    // Guard against excessively long query strings that could cause ReDoS
    if (products.length > 500) {
      return res.status(400).json({ message: "Query too long." });
    }

    // Parse comma-separated product names (max 20 products, max 100 chars each)
    const productList = products
      .split(",")
      .slice(0, 20)
      .map(p => p.trim().toLowerCase().slice(0, 100))
      .filter(Boolean);
    
    // Query recalls collection for matching products
    const snapshot = await db.collection("recalls")
      .orderBy("reportedAt", "desc")
      .get();
    
    let recalls = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    // Filter to only recalls for products user owns
    // (fuzzy match on product names for flexibility)
    recalls = recalls.filter(recall => {
      const recallProduct = (recall.product || "").toLowerCase();
      return productList.some(userProduct => 
        recallProduct.includes(userProduct) || userProduct.includes(recallProduct.split(" ")[0])
      );
    });
    
    const aggregated = await aggregateRecalls(recalls);
    return res.json(aggregated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
