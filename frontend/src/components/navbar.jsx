export default function Navbar({ view, setView }) {
  return (
    <nav className="navbar">
      <button
        className={view === "library" ? "active" : ""}
        onClick={() => setView("library")}
      >
        Library
      </button>
      <button
        className={view === "playlists" ? "active" : ""}
        onClick={() => setView("playlists")}
      >
        Playlists
      </button>
    </nav>
  );
}
