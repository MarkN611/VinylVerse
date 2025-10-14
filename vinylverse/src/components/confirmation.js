import React from "react";
import { useLocation, Link } from "react-router-dom";
import '../styles/confirmation.css';

const CONFIRMATION_CODE = "VV-2025-0001"; //hard-coded

export default function Confirmation() {
  const location = useLocation();

  const order = location.state?.order || {};

  const qty = Array.isArray(order.buyQuantity) ? order.buyQuantity : [0, 0, 0, 0, 0];

  const name = order.shipping?.name || "Customer";
  const cardNumber = order.paymentInfo?.cardNumber || "";
  const last4 = cardNumber ? cardNumber.slice(-4) : null;

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "16px" }}>
      <h1>Thank you, {name}.</h1>
      <p>Your order has been placed successfully.</p>

      <div
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 8,
          margin: "16px 0"
        }}
      >
        <strong>Confirmation:</strong> <span style={{ marginLeft: 8 }}>{CONFIRMATION_CODE}</span>
      </div>

      <h2>Order summary</h2>
      <ul>
        <li>Product 1: {qty[0] || 0}</li>
        <li>Product 2: {qty[1] || 0}</li>
        {qty.length > 2 && <li>Product 3: {qty[2] || 0}</li>}
        {qty.length > 3 && <li>Product 4: {qty[3] || 0}</li>}
        {qty.length > 4 && <li>Product 5: {qty[4] || 0}</li>}
      </ul>

      <h3>Payment</h3>
      <p>{last4 ? `Card ending in •••• ${last4}` : "Not provided"}</p>

      <h3>Shipping</h3>
      <p>
        {order.shipping?.name ? `${order.shipping.name}, ` : ""}
        {order.shipping?.addressLine1 || "Not provided"}
        {order.shipping?.addressLine2 ? `, ${order.shipping.addressLine2}` : ""}
        {order.shipping?.city ? `, ${order.shipping.city}` : ""}
        {order.shipping?.state ? `, ${order.shipping.state}` : ""}{" "}
        {order.shipping?.zip || ""}
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(CONFIRMATION_CODE).catch(() => {});
            alert("Confirmation code copied");
          }}
        >
          Copy code
        </button>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}
