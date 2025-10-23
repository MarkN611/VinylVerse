import React from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/confirmation.css";

const CONFIRMATION_CODE = "VV-2025-0001"; // hard-coded
const today = new Date();
const eta = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);

export default function Confirmation() {
  const { state } = useLocation() || {};
  const order = state?.order || {};

  const qty = Array.isArray(order.buyQuantity) ? order.buyQuantity : [];
  const nonZeroLines = qty
    .map((q, i) => ({ i: i + 1, q: Number(q) || 0 }))
    .filter(x => x.q > 0);

  const name = order.shipping?.name || "Customer";
  const cardNumber = order.paymentInfo?.cardNumber || "";
  const last4 = cardNumber ? cardNumber.slice(-4) : null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CONFIRMATION_CODE);
      alert("Confirmation code copied");
    } catch {
      /* no-op */
    }
  };

  return (
    <main className="confirm">
      <section className="confirm__card">
        <header className="confirm__head">
          <h1>Thank you, {name}</h1>
          <p>Your order has been placed successfully.</p>
        </header>

        <div className="confirm__code">
          <div>
            <span className="label">Confirmation</span>
            <strong className="code">{CONFIRMATION_CODE}</strong>
          </div>
          <button className="btn btn--ghost" onClick={copyCode}>Copy code</button>
        </div>

        <div className="confirm__meta">
          <div><span className="label">Order date</span>{today.toLocaleDateString()}</div>
          <div><span className="label">Est. delivery</span>{eta.toLocaleDateString()}</div>
        </div>

        <section className="confirm__section">
          <h2>Order summary</h2>
          {nonZeroLines.length ? (
            <ul className="list">
              {nonZeroLines.map(line => (
                <li key={line.i}>Product {line.i}: {line.q}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No item quantities were provided.</p>
          )}
        </section>

        <section className="confirm__section">
          <h3>Payment</h3>
          <p className="muted">
            {last4 ? `Card ending in •••• ${last4}` : "Not provided"}
          </p>
        </section>

        <section className="confirm__section">
          <h3>Shipping</h3>
          <p className="muted">
            {order.shipping?.name ? `${order.shipping.name}, ` : ""}
            {order.shipping?.addressLine1 || "Not provided"}
            {order.shipping?.addressLine2 ? `, ${order.shipping.addressLine2}` : ""}
            {order.shipping?.city ? `, ${order.shipping.city}` : ""}
            {order.shipping?.state ? `, ${order.shipping.state}` : ""}{" "}
            {order.shipping?.zip || ""}
          </p>
        </section>

        <div className="confirm__actions">
          <Link className="btn btn--primary" to="/products">Continue shopping</Link>
          <Link className="btn" to="/">Back to Home</Link>
          <button className="btn btn--ghost" onClick={() => window.print()}>Print</button>
        </div>
      </section>
    </main>
  );
}
