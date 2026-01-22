import { useState, useEffect, useRef } from "react";
import Navbar from "./components/navbar";
import Library from "./components/library";
import Playlists from "./components/PlaylistView";
import Upload from "./components/UploadZone";

const API = "http://127.0.0.1:5000";

export default function App() {
  const [view, setView] = useState("library");
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);

  // Load all songs from backend
  const loadSongs = () =>
    fetch(`${API}/api/songs`)
      .then((res) => res.json())
      .then(setSongs);

  // Load all playlists
  const loadPlaylists = () =>
    fetch(`${API}/api/playlists`)
      .then((res) => res.json())
      .then(setPlaylists);

  useEffect(() => {
    loadSongs();
    loadPlaylists();
  }, []);

  return (
    <div className="app">
      <Navbar view={view} setView={setView} />

      <div className="main">
        {view === "library" && (
          <>
            <Upload refresh={loadSongs} />
            <Library songs={songs} setCurrentSong={setCurrentSong} />
          </>
        )}

        {view === "playlists" && (
          <Playlists
            playlists={playlists}
            songs={songs}
            refresh={loadPlaylists}
            setCurrentSong={setCurrentSong}
          />
        )}
      </div>

      {currentSong && (
        <div className="player">
          <audio
            ref={audioRef}
            controls
            autoPlay
            src={`${API}/music/${currentSong.filename}`}
          />
          <div className="now-playing">
            <img
              src={`${API}/static/covers/${currentSong.cover}`}
              alt="cover"
            />
            <div>
              <strong>{currentSong.title}</strong>
              <small>{currentSong.artist}</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
