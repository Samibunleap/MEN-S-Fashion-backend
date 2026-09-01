const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

const PAYWAY_GENERATE_QR_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr";

/*
  PayWay request time
  Format: YYYYMMDDHHmmss
  UTC
*/
function createRequestTime() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");
  const second = String(now.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hour}${minute}${second}`;
}

/*
  Create unique transaction ID.
  Maximum: 20 characters
*/
function createTransactionId() {
  const timestamp = Date.now().toString();
  const random = Math.floor(1000 + Math.random() * 9000).toString();

  return `${timestamp}${random}`.slice(0, 20);
}

/*
  Convert string/object to Base64
*/
function toBase64(value) {
  const text =
    typeof value === "string"
      ? value
      : JSON.stringify(value);

  return Buffer.from(text, "utf8").toString("base64");
}

/*
  Split customer name
*/
function splitCustomerName(fullName) {
  const parts = String(fullName || "Customer")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = parts.shift() || "Customer";
  const lastName = parts.join(" ") || "Customer";

  return {
    firstName,
    lastName,
  };
}

/*
  Generate PayWay QR hash.

  IMPORTANT:
  PayWay requires this EXACT field order:

  req_time
  merchant_id
  tran_id
  amount
  items
  first_name
  last_name
  email
  phone
  purchase_type
  payment_option
  callback_url
  return_deeplink
  currency
  custom_fields
  return_params
  payout
  lifetime
  qr_image_template
*/
function generatePayWayHash(payload) {
  const apiKey = process.env.PAYWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "PAYWAY_API_KEY is missing in server/.env"
    );
  }

  const hashString =
    String(payload.req_time ?? "") +
    String(payload.merchant_id ?? "") +
    String(payload.tran_id ?? "") +
    String(payload.amount ?? "") +
    String(payload.items ?? "") +
    String(payload.first_name ?? "") +
    String(payload.last_name ?? "") +
    String(payload.email ?? "") +
    String(payload.phone ?? "") +
    String(payload.purchase_type ?? "") +
    String(payload.payment_option ?? "") +
    String(payload.callback_url ?? "") +
    String(payload.return_deeplink ?? "") +
    String(payload.currency ?? "") +
    String(payload.custom_fields ?? "") +
    String(payload.return_params ?? "") +
    String(payload.payout ?? "") +
    String(payload.lifetime ?? "") +
    String(payload.qr_image_template ?? "");

  return crypto
    .createHmac("sha512", apiKey)
    .update(hashString, "utf8")
    .digest("base64");
}

/*
  POST:
  /api/payway/generate-qr
*/
router.post("/generate-qr", async (req, res) => {
  try {
    const {
      amount,
      customerName,
      customerEmail = "",
      customerPhone = "",
      address = "",
      items = [],
    } = req.body || {};

    const merchantId = process.env.PAYWAY_MERCHANT_ID;

    /*
      Validate environment variables
    */
    if (!merchantId) {
      return res.status(500).json({
        success: false,
        message:
          "PAYWAY_MERCHANT_ID is missing in server/.env",
      });
    }

    if (!process.env.PAYWAY_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "PAYWAY_API_KEY is missing in server/.env",
      });
    }

    /*
      Validate amount
    */
    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount must be greater than zero.",
      });
    }

    /*
      Validate customer name
    */
    if (!String(customerName || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    /*
      Validate phone
    */
    if (!String(customerPhone || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required.",
      });
    }

    const reqTime = createRequestTime();
    const transactionId = createTransactionId();

    const {
      firstName,
      lastName,
    } = splitCustomerName(customerName);

    /*
      Normalize products
    */
    const normalizedItems = Array.isArray(items)
      ? items.map((item) => ({
          name:
            item.name ||
            item.productName ||
            "Product",

          quantity: Number(
            item.quantity ??
              item.qty ??
              1
          ),

          price: Number(
            item.price ?? 0
          ),
        }))
      : [];

    /*
      IMPORTANT:
      PayWay server must be able to reach callback URL.

      localhost WILL NOT work for PayWay callback.
    */
    const publicBackendUrl = String(
      process.env.PUBLIC_BACKEND_URL ||
        "http://localhost:8080"
    ).replace(/\/$/, "");

    const callbackUrl = toBase64(
      `${publicBackendUrl}/api/payway/callback`
    );

    /*
      Return params
    */
    const returnParams = toBase64({
      transactionId,
      customerName,
      customerEmail,
      customerPhone,
      address,
    });

    /*
      Amount should be formatted consistently.
      PayWay documentation uses formatted decimal amount.
    */
    const formattedAmount =
      paymentAmount.toFixed(2);

    /*
      PayWay payload
    */
    const payload = {
      req_time: reqTime,

      merchant_id: merchantId,

      tran_id: transactionId,

      first_name: firstName,

      last_name: lastName,

      email: String(customerEmail).trim(),

      phone: String(customerPhone).trim(),

      amount: formattedAmount,

      purchase_type: "purchase",

      payment_option: "abapay_khqr",

      items: toBase64(normalizedItems),

      currency: "USD",

      callback_url: callbackUrl,

      return_deeplink: null,

      custom_fields: null,

      return_params: returnParams,

      payout: null,

      lifetime: 6,

      qr_image_template: "template3_color",
    };

    /*
      Generate PayWay hash
    */
    payload.hash =
      generatePayWayHash(payload);

    /*
      Debug information.
      DO NOT print API key or hash string.
    */
    console.log(
      "PayWay request:",
      {
        req_time: payload.req_time,
        merchant_id: payload.merchant_id,
        tran_id: payload.tran_id,
        amount: payload.amount,
        currency: payload.currency,
        payment_option:
          payload.payment_option,
      }
    );

    /*
      Send request to PayWay
    */
    const response = await axios.post(
      PAYWAY_GENERATE_QR_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },

        timeout: 30000,

        maxBodyLength: Infinity,
      }
    );

    const result = response.data || {};

    const statusCode = String(
      result.status?.code ?? ""
    );

    /*
      PayWay success = status.code "0"
    */
    if (statusCode !== "0") {
      console.error(
        "PayWay rejected request:",
        result
      );

      return res.status(400).json({
        success: false,

        message:
          result.status?.message ||
          "PayWay could not generate the QR.",

        paywayStatus:
          result.status || null,
      });
    }

    /*
      Success
    */
    return res.status(200).json({
      success: true,

      transactionId,

      qrImage:
        result.qrImage || null,

      qrString:
        result.qrString || null,

      abaPayDeeplink:
        result.abapay_deeplink || null,

      amount:
        result.amount,

      currency:
        result.currency,

      status:
        result.status,
    });
  } catch (error) {
    const payWayError =
      error.response?.data;

    console.error(
      "PayWay Generate QR Error:",
      payWayError || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,

      message:
        payWayError?.status?.message ||
        payWayError?.message ||
        error.message ||
        "Cannot generate PayWay QR.",
    });
  }
});

/*
  PayWay callback
*/
router.post("/callback", async (req, res) => {
  try {
    console.log(
      "PayWay callback received:",
      req.body
    );

    const transactionId =
      String(
        req.body?.tran_id || ""
      );

    const status =
      String(
        req.body?.status ?? ""
      );

    if (!transactionId) {
      return res.status(400).json({
        received: false,

        message:
          "Transaction ID is missing.",
      });
    }

    console.log(
      `PayWay transaction ${transactionId}, status: ${status}`
    );

    /*
      PayWay callback status 0 means
      the payment notification indicates success.

      IMPORTANT:
      For production, verify the transaction
      with PayWay's transaction API before
      marking the order as PAID.
    */
    if (
      status === "0" ||
      status === "00"
    ) {
      console.log(
        `Payment successful: ${transactionId}`
      );

      /*
        TODO:

        1. Find order by transactionId
        2. Verify transaction with PayWay
        3. Update MySQL:
           payment_status = "PAID"
        4. Save APV / transaction information
      */
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error(
      "PayWay callback error:",
      error
    );

    return res.status(500).json({
      received: false,

      message:
        "Cannot process PayWay callback.",
    });
  }
});

module.exports = router;