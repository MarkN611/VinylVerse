// src/components/home.js
import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero__copy">
          <h1>Discover your next favorite record</h1>
          <p>Fresh drops, curated picks, and a checkout flow that does not fight you.</p>
          <div className="hero__cta">
            <Link className="btn btn--primary" to="/purchase">Browse Products</Link>
            <Link className="btn btn--ghost" to="/purchase">Quick Purchase</Link>
          </div>
        </div>
        <div className="hero__art">
          <div className="vinyl">
            <div className="vinyl__label">VV</div>
            <div className="vinyl__grooves"></div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="marquee" aria-hidden="true">
        <div className="marquee__track">
          <span>New Releases • Classics • Indie • Hip Hop • Jazz • RnB • Electronic • Limited Press • </span>
          <span>New Releases • Classics • Indie • Hip Hop • Jazz • RnB • Electronic • Limited Press • </span>
        </div>
      </section>

      {/* FEATURED (removed Staff Picks) */}
      <section className="featured">
        <article className="card">
          <h3>Fast Checkout</h3>
          <p>Two screens. Done. No account required.</p>
          <Link to="/purchase" className="card__link">Buy now →</Link>
        </article>
        <article className="card">
          <h3>Safe Packaging</h3>
          <p>Corner guards and mailers that keep sleeves mint.</p>
          <Link to="/contactUs" className="card__link">Support →</Link>
        </article>
      </section>

      {/* SOCIAL PROOF */}
      <section className="proof">
        <div className="proof__item"><strong>4.9/5</strong> average rating</div>
        <div className="proof__dot">•</div>
        <div className="proof__item"><strong>48h</strong> average ship time</div>
        <div className="proof__dot">•</div>
        <div className="proof__item"><strong>Free returns</strong> on defects</div>
      </section>
    </main>
  );
}
