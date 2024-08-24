import React from "react";
import axios from "axios";

const App = () => {
  let data = {
    name: "rafikul",
    amount: 1,
    number: "9064288864",
    MID: `MID` + Date.now(),
    transactionId: "TID" + Date.now(),
  };

  const handleClick = async () => {
    try {
      await axios
        .post(`http://localhost:5000/order`, data)
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(`Error On Receiving Response For Order Details: ${err}`);
        });
    } catch (error) {
      console.log(`Error On Sending Order Details: ${error}`);
    }
  };

  
  return (
    <div>
      <h1>Using PhonePe Integration</h1>
      <button onClick={handleClick}>Pay Now</button>
    </div>
  );
};

export default App;
