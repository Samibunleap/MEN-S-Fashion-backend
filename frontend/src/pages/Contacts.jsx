import React, { useState } from "react";
import VisitUs from "../components/VisitUs";

const API_URL = "http://localhost:8080/api";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  orderNo: "",
  subject: "",
  message: "",
};

export default function Contact({
  showToast,
}) {
  const [formData, setFormData] =
    useState(initialFormData);

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstName =
      formData.firstName.trim();

    const lastName =
      formData.lastName.trim();

    const email =
      formData.email.trim().toLowerCase();

    const phone =
      formData.phone.trim();

    const orderNo =
      formData.orderNo.trim();

    const message =
      formData.message.trim();

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !message
    ) {
      const validationMessage =
        "Please fill in all required fields.";

      setError(validationMessage);

      if (showToast) {
        showToast(validationMessage);
      }

      return;
    }

    const subject =
      formData.subject.trim() ||
      (orderNo
        ? `Order enquiry: ${orderNo}`
        : "General Enquiry");

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/contact-messages`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            email,
            phone,
            subject,
            message,
            orderNo: orderNo || null,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not send your message."
        );
      }

      setSubmitted(true);
      setFormData(initialFormData);

      if (showToast) {
        showToast(
          "Message sent successfully."
        );
      }
    } catch (requestError) {
      console.error(
        "Send contact message error:",
        requestError
      );

      const errorMessage =
        requestError.message ||
        "Could not send your message. Please try again.";

      setError(errorMessage);

      if (showToast) {
        showToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnother = () => {
    setSubmitted(false);
    setError("");
    setFormData(initialFormData);
  };

  return (
    <main>
      {/* Contact hero */}
      <section className="contact-hero">
        <div className="contact-hero-text">
          <span className="section-label">
            Get In Touch
          </span>

          <h1>
            We&apos;d Love to
            <br />

            <em>Hear From You</em>
          </h1>
        </div>
      </section>

      {/* Contact information and form */}
      <section className="contact-body">
        <div className="contact-info">
          <h3>Email Us</h3>

          <p>
            <a href="mailto:mensfashion@gmail.com">
              mensfashion@gmail.com
            </a>
          </p>

          <h3>Call Us</h3>

          <p>
            <a href="tel:+855962702059">
              +855 962702059
            </a>
          </p>
        </div>

        <div className="contact-form-wrap">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "18px",
                    padding: "12px 14px",
                    border:
                      "1px solid #fecaca",
                    borderRadius: "4px",
                    backgroundColor:
                      "#fef2f2",
                    color: "#991b1b",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    First Name *
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={
                      formData.firstName
                    }
                    onChange={handleChange}
                    autoComplete="given-name"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">
                    Last Name *
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={
                      formData.lastName
                    }
                    onChange={handleChange}
                    autoComplete="family-name"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="orderNo">
                    Order Number
                  </label>

                  <input
                    id="orderNo"
                    name="orderNo"
                    type="text"
                    placeholder="Example: 1"
                    value={
                      formData.orderNo
                    }
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="General Enquiry"
                    value={
                      formData.subject
                    }
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  Your Message *
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="7"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : "Send Message"}
              </button>
            </form>
          ) : (
            <div
              className="form-success"
              style={{
                display: "block",
              }}
            >
              <i
                className="fas fa-check-circle"
                aria-hidden="true"
              />

              <h3>Message Sent</h3>

              <p>
                Thank you for reaching
                out. We will get back to
                you shortly.
              </p>

              <button
                type="button"
                className="btn-primary"
                onClick={
                  handleSendAnother
                }
              >
                Send Another
              </button>
            </div>
          )}
        </div>
      </section>

      <VisitUs />
    </main>
  );
}