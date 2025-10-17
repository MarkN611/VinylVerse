import { Link } from "react-router-dom";
import "../styles/global.css";

export default function Header() {
  return (
    <header className="header">
      <h1 className="brand">VinylVerse</h1>
      <nav className="nav">
        <Link to="/">Home</Link><span> | </span>
        <Link to="/aboutUs">About Us</Link><span> | </span>
        <Link to="/contactUs">Contact Us</Link><span> | </span>
        <Link to="/purchase">Purchase</Link>
      </nav>
    </header>
  );
}
