import '../styles/global.css';

export default function Header() {
  return (
    <header className="header">
      <h1>VinylVerse</h1>
      <nav>
        <a href="/">Home</a> <span>| </span>
        <a href="/aboutUs">About Us</a> <span>| </span>
        <a href="/contactUs">Contact Us</a> <span>| </span>
        <a href="/purchase">Purchase</a>
      </nav>
    </header>
  );
}