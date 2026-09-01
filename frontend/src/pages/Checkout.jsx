import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkout({
  cart = [],
  currentUser,
  onCompleteOrder,
  showToast,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || "",
    streetAddress: "",
    city: "Phnom Penh",
    phone: currentUser?.phone || "",
  });

  const [selectedPayment, setSelectedPayment] = useState("aba");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.qty),
    0
  );

  const delivery = 0;
  const total = subtotal + delivery;

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Generate PayWay QR
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate delivery information
    if (
      !formData.fullName.trim() ||
      !formData.streetAddress.trim() ||
      !formData.phone.trim()
    ) {
      if (showToast) {
        showToast("Please fill in all delivery details!");
      }
      return;
    }

    // Check cart
    if (cart.length === 0) {
      if (showToast) {
        showToast("Your cart is empty.");
      }
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/payway/generate-qr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total,

            customerName: formData.fullName,

            customerEmail: currentUser?.email || "",

            customerPhone: formData.phone,

            address: `${formData.streetAddress}, ${formData.city}`,

            items: cart.map((item) => ({
              name: item.name,
              quantity: Number(item.qty),
              price: Number(item.price),
            })),
          }),
        }
      );

      const result = await response.json();

      console.log("PayWay response:", result);

      // Check backend response
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Cannot generate PayWay QR."
        );
      }

      // Save PayWay payment data
      setPaymentData(result);

      // Save order as PENDING
      const newOrderData = {
        fullName: formData.fullName,
        streetAddress: formData.streetAddress,
        city: formData.city,
        phone: formData.phone,

        paymentMethod: "ABA Mobile / KHQR",

        transactionId: result.transactionId,

        amount: total,

        paymentStatus: "PENDING",
      };

      if (onCompleteOrder) {
        onCompleteOrder(newOrderData);
      }

      if (showToast) {
        showToast("Payment QR generated successfully!");
      }
    } catch (error) {
      console.error("Payment error:", error);

      if (showToast) {
        showToast(
          error.message || "Cannot create payment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Open ABA Mobile
  const openABAMobile = () => {
    if (!paymentData?.abaPayDeeplink) {
      if (showToast) {
        showToast("ABA Mobile link is not available.");
      }
      return;
    }

    window.location.href =
      paymentData.abaPayDeeplink;
  };

  // Back to dashboard
  const goDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* ==============================
            SHOW PAYMENT QR
        =============================== */}
        {paymentData && (
          <div
            className="checkout-card"
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <h2>Scan to Pay</h2>

            <p>
              Transaction ID:
              <br />

              <strong>
                {paymentData.transactionId}
              </strong>
            </p>

            {/* QR IMAGE */}
            {paymentData.qrImage && (
              <img
                src={paymentData.qrImage}
                alt="PayWay QR Code"
                style={{
                  width: "280px",
                  maxWidth: "100%",
                  display: "block",
                  margin: "20px auto",
                }}
              />
            )}

            <p>
              Amount:
              <strong>
                {" "}
                ${total.toFixed(2)}
              </strong>
            </p>

            {/* ABA MOBILE BUTTON */}
            {paymentData.abaPayDeeplink && (
              <button
                type="button"
                onClick={openABAMobile}
                className="checkout-pay-btn"
                style={{
                  marginBottom: "10px",
                }}
              >
                Open ABA Mobile
              </button>
            )}

            {/* DASHBOARD */}
            <button
              type="button"
              onClick={goDashboard}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Back to Dashboard
            </button>

            <p
              style={{
                marginTop: "15px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Please complete the payment
              using the QR code or ABA Mobile.
            </p>
          </div>
        )}

        {/* ==============================
            CHECKOUT FORM
        =============================== */}
        {!paymentData && (
          <form onSubmit={handlePlaceOrder}>

            {/* DELIVERY DETAILS */}
            <div className="checkout-card">
              <h2>📍 Delivery details</h2>

              <div className="checkout-field">
                <label htmlFor="checkout-fullName">
                  Full name
                </label>

                <input
                  id="checkout-fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-street">
                  Street address
                </label>

                <input
                  id="checkout-street"
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="e.g. St. 271, Sangkat Takhmao"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-city">
                  City
                </label>

                <input
                  id="checkout-city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div
                className="checkout-field"
                style={{
                  marginBottom: "8px",
                }}
              >
                <label htmlFor="checkout-phone">
                  Phone
                </label>

                <input
                  id="checkout-phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="012 345 678"
                />
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="checkout-card">
              <h2>Payment method</h2>

              <div
                onClick={() =>
                  setSelectedPayment("aba")
                }
                className={`checkout-payment-option ${
                  selectedPayment === "aba"
                    ? "selected"
                    : ""
                }`}
              >
                <div>
                  <div className="checkout-payment-title">
                    💳 ABA Mobile / KHQR
                  </div>

                  <div className="checkout-payment-desc">
                    Generate a PayWay QR code
                    and pay using ABA Mobile
                    or another KHQR supported app.
                  </div>
                </div>

                <input
                  type="radio"
                  checked={
                    selectedPayment === "aba"
                  }
                  onChange={() =>
                    setSelectedPayment("aba")
                  }
                />
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="checkout-card">
              <h2>Order Summary</h2>

              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="checkout-summary-item"
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>

                  <span>
                    $
                    {(
                      Number(item.price) *
                      Number(item.qty)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}

              <hr className="checkout-divider" />

              <div
                className="checkout-summary-item"
                style={{
                  color: "#666",
                }}
              >
                <span>Subtotal</span>

                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div
                className="checkout-summary-item"
                style={{
                  color: "#666",
                  marginBottom: "16px",
                }}
              >
                <span>Delivery</span>

                <span>Free</span>
              </div>

              <hr className="checkout-divider" />

              <div className="checkout-total-row">
                <span>Total</span>

                <span className="total-price">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* PAY BUTTON */}
            <button
              type="submit"
              className="checkout-pay-btn"
              disabled={loading}
            >
              {loading
                ? "Generating QR..."
                : `Pay $${total.toFixed(
                    2
                  )} via ABA / KHQR`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}