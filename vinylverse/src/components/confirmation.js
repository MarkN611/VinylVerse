import React from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/confirmation.css";

const today = new Date();
const eta = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);

export default function Confirmation() {
  const { state } = useLocation() || {};
  const order = state?.order || {};
  // Use confirmation ID from API response if available, otherwise use hard-coded fallback
  const CONFIRMATION_CODE = state?.confirmationId || state?.orderResponse?.confirmationId || "VV-2025-0001";

  // Derive purchased line items with product names & quantities
  const products = Array.isArray(order.products) ? order.products : [];
  const quantities = Array.isArray(order.buyQuantity) ? order.buyQuantity : [];
  const purchased = products
    .map((p, i) => ({ name: p.name, qty: Number(quantities[i] || 0), price: p.price }))
    .filter(l => l.qty > 0);

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
          <button className="btn btn--ghost--copy" onClick={copyCode}>Copy code</button>
        </div>

        <div className="confirm__meta">
          <div><span className="label">Order date</span>{today.toLocaleDateString()}</div>
          <div><span className="label">Est. delivery</span>{eta.toLocaleDateString()}</div>
        </div>

        <section className="confirm__section">
          <h2>Order summary</h2>
          {purchased.length ? (
            <ul className="list">
              {purchased.map((line, idx) => (
                <li key={idx}>
                  <strong>{line.name}</strong> × {line.qty}
                  {line.price ? (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
                      ${(line.price * line.qty).toFixed(2)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No items were purchased.</p>
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
          {/* Route user back to purchase flow */}
          <Link className="btn btn--primary" to="/purchase">Continue shopping</Link>
          <Link className="btn" to="/">Back to Home</Link>
          <button className="btn btn--ghost" onClick={() => window.print()}>Print</button>
        </div>
      </section>
    </main>
  );
}
