import '../styles/global.css';

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} VinylVerse</p>
    </footer>
  );
}