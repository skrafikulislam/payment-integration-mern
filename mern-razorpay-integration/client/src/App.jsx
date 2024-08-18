import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [responseId, setResponseId] = useState("");
  const [responseState, setResponseState] = useState([]);

  //! This function is for razorpay pop using DOM and handling errors
  const loadSript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = (amount) => {
    let data = JSON.stringify({
      amount: amount,
      currency: "INR",
    });

    let config = () => {
      return {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/payment/orderId",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
    };

    axios
      .request(config)
      .then((res) => {
        console.log(JSON.stringify(res.data));
        handleRazorpayScreen(res.data.amount);
      })
      .catch((err) => console.log(err));
  };

  //! This function is for razor pay screen pop where the payment will successfully completed
  const handleRazorpayScreen = async (amount) => {
    const res = await loadSript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("some error at razorpay.com screen loading");
      return;
    }

    const options = {
      key: "Your Razor Pay Key",
      amount: amount,
      currency: "INR",
      name: "Sk Rafikul Islam",
      description: "Payment To Rafikul",
      handler: function (res) {
        setResponseId(res.razorpay_payment_id);
      },
      prefill: {
        name: "Rafikul",
        email: "rafikul@gmail.com",
      },
      theme: {
        color: "#F4C430",
      },
    };
    //! Open Payment Screen
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  //! Fetching Payment Information
  const paymentFetch = (e) => {
    e.preventDeafult();
    //! e.target.<rafikulPaymentId> this name should match with input name field
    const paymentId = e.target.rafikulPaymentId.value;

    axios
      .get(`http://localhost:5000/getpayment/${paymentId}`)
      .then((res) => {
        console.log(res.data);
        setResponseState(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="app">
      <button onClick={() => createRazorpayOrder(100)}>
        Payment of 100 Rupees
      </button>
      {responseId && <p>{responseId}</p>}
      <h1>This is payment verification form</h1>
      <form action=" " onClick={paymentFetch}>
        <input type="text" name="rafikulPaymentId" id="" />
        <button type="submit">Fetch Payment</button>
        {responseState.length !== 0 && (
          <ul>
            <li>Amount: {responseState.amount / 100} Rs.</li>
            <li>Currency: {responseState.currency} </li>
            <li>Status: {responseState.status} </li>
            <li>Method: {responseState.method} </li>
          </ul>
        )}
      </form>
    </div>
  );
}

export default App;

//! Demo Payment upi Id = success@razorpay