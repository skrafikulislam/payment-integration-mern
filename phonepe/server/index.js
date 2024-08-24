// import express from "express";
// import cors from "cors";
// import crypto from "crypto";
// import axios from "axios";
// import rateLimit from "express-rate-limit";

// const app = express();
// const port = 5000;
// const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
// const merchant_Id = "PGTESTPAYUAT";

// app.use(express.json());
// // app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
// app.use(cors());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 requests per windowMs
//   message: "Too many requests, please try again later.",
// });

// app.get("/", (req, res) => {
//   res.status(200).json("Welcome to server 5000");
// });

// app.post("/order", limiter, async (req, res) => {
//   try {
//     const data = {
//       merchantId: merchant_Id,
//       merchantTransactionId: req.body.transactionId,
//       name: req.body.name,
//       amount: req.body.amount * 100,
//       redirectUrl: `http://localhost:5000/status?id=${req.body.transactionId}`,
//       redirectMethod: "POST",
//       mobileNumber: req.body.number,
//       paymentInstrument: {
//         type: "PAY_PAGE",
//       },
//     };

//     //! conver the data to safe
//     const payload = JSON.stringify(data);
//     const payloadMain = Buffer.from(payload).toString("base64");
//     const keyIndex = 1;
//     const string = payloadMain + "/pg/v1/pay" + salt_key;
//     const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//     const checksum = sha256 + "###" + keyIndex;

//     const prod_URL =
//       "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

//     const options = {
//       method: "POST",
//       url: prod_URL,
//       headers: {
//         accept: "application/json",
//         "Content-Type": "application/json",
//         "X-VERIFY": checksum,
//       },
//       data: {
//         request: payloadMain,
//       },

//     };

// // Log for debugging
// console.log("Payload:", payload);
// console.log("Checksum:", checksum);
// console.log("Request Options:", options);

//     await axios
//       .request(options)
//       .then((response) => {
//         console.log(response.data);
//         res.status(200).json(response.data);
//       })
//       .catch((err) => {
//         console.error(`Error On Receiving Response From The Prod URL: ${err}`);
//         res
//           .status(500)
//           .json(`Error On Receiving Response From The Prod URL: ${err}`);
//       });
//   } catch (error) {
//     console.error(`Internal Server Error: ${error}`);
//     res.status(500).json(`Internal Server Error: ${error}`);
//   }
// });

// ! To Get The Payment Done
// app.post("/status", async (req, res) => {
//   const merchantTransactionId = req.query.id;
//   const merchantId = merchant_Id;

//   const keyIndex = 1;
//   const string =
//     `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
//   const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//   const checksum = sha256 + "###" + keyIndex;

//   const options = {
//     method: "GET",
//     url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
//     headers: {
//       accept: "application/json",
//       "Content-Type": "application/json",
//       "X-VERIFY": checksum,
//       "X-MERCHANT-ID": `${merchantId}`,
//     },
//   };

//   // ! This is for getting payment completed succesfully or not
//   await axios
//     .request(options)
//     .then((res) => {
//       if (res.data.success === true) {
//         const url = `http://localhost:5173/success`;
//         return res.redirectUrl(url);
//       } else {
//         const url = `http://localhost:5173/fail`;
//         return res.redirectUrl(url);
//       }
//     })
//     .catch((err) => {
//       res
//         .status(500)
//         .json(`Error On Receiving Response From The Status API : ${err}`);
//     });
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

import express from "express";
import cors from "cors";
import axios from "axios";
import uniqid from "uniqid";
import sha256 from "sha256";

const app = express();

const PHONEPE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT";
const SALY_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Hello from server");
});

//! First API which first create a payment req and then give payment url where the actual payment occurs , now the given url we send the user to do the payment , after completing the payment the user will also redirect to my anothe api which is to do the status if payment verification
app.get("/pay", (req, res) => {
  const payEndPoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const merchantUserId = `MUID + ${uniqid()}`; //? Here I Have Changed

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: merchantUserId,
    amount: 10000,
    redirectUrl: `http://localhost:5000/redirect-url/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  //     const payload = JSON.stringify(data);
  //     const payloadMain = Buffer.from(payload).toString("base64");
  //     const keyIndex = 1;
  //     const string = payloadMain + "/pg/v1/pay" + salt_key;
  //     const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  //     const checksum = sha256 + "###" + keyIndex;

  const bufferObj = Buffer.from(JSON.stringify(payload), "utf-8");
  const base64Payload = bufferObj.toString("base64");
  const xVerify =
    sha256(base64Payload + payEndPoint + SALT_KEY) + "###" + SALY_INDEX;

  const options = {
    method: "post",
    url: `${PHONEPE_URL}${payEndPoint}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: base64Payload,
    },
  };

  try {
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        const url = response.data.data.instrumentResponse.redirectInfo.url;
        res.redirect(url);
        // res.json(url);
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    res.status(500).json("Internal Server Error" + error);
  }
});

app.get("/redirect-url/:merchantTransactionId", (req, res) => {
  const { merchantTransactionId } = req.params;
  console.log("merchantTransactionId : ", merchantTransactionId);

  if (merchantTransactionId) {
    const xVerify =
      sha256(
        `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY
      ) +
      "###" +
      SALY_INDEX;

    const options = {
      method: "get",
      url: `${PHONEPE_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": merchantTransactionId,
        "X-VERIFY": xVerify,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        if (response.data.success === true) {
          res.redirect("FrontEnd Specific Url Or Data Access");
        } else if (response.data.success === false) {
          res.redirect("FrontEnd Specific Url Or Data Access");
        } else {
          // payment loading api or callback or something else
        }
        res.json(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    // res
    //   .status(200)
    //   .json(
    //     { message: "Payment Success" },
    //     { merchantTransactionId: merchantTransactionId },
    //     { amount: 300 }
    //   );
  } else {
    res.status(400).json({
      message:
        "Invalid merchantTransactionId and Payment is Not SuccessFully Done",
    });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
