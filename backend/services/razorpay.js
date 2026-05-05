const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createOrder(amount, currency = "INR") {
  const options = {
    amount: Math.round(Number(amount) * 100),
    currency,
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  };

  const order = await razorpay.orders.create(options);
  return order;
}

module.exports = { createOrder };
