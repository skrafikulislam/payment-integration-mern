import express from "express";
import cors from "cors";
import Razorpay from "razorpay";

const app = express();

app.use(express.json());
app.use(cors("*"));

app.get("/", (req, res) => {
  res.status(200).json("Testing razor pay integration");
});

//! First Generate Order Id on Razorpay
app.post("/payment/orderId", async (req, res) => {
  const razorpay = new Razorpay({
    key_id: "your_key_id",
    key_secret: "your_key_secret",
  });

  const options = {
    amount: req.body.amount, // amount in smallest currency unit (for INR, it's 100)
    currency: "INR", //? req.body.currency
    receipt: "RafikulReceipt#1", //? can name anything
    payment_capture: 1, // 1: automatic capture, 0: manual capture
  };
  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
      description: response.description,
      receipt: response.receipt,
      notes: response.notes,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        `Failed to Generate Payment Id \n Internal Server Error: \n ${error}`
      );
  }
});

//! This api is for Get The Payment Information Via Payment Id
app.get("/getpayment/:Id", async (req, res) => {
  const { Id } = req.params;

  const razorpay = new Razorpay({
    key_id: "your_key_id",
    key_secret: "your_key_secret",
  });

  try {
    const payment = await razorpay.payments.fetch(Id);
    if (!payment) {
      return res.status(404).json("Payment not found");
    }
    res.status(200).json({
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      notes: payment.notes,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        `Failed to Fetch Payment Deatils Via Id \n Internal Server Error: \n ${error}`
      );
  }
});



app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
