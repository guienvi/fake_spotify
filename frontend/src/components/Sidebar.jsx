import { useEffect, useState } from "react";

export default function LibraryView({ setCurrent, playlists }) {
  const [songs, setSongs] = useState([]);

  const loadSongs = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/songs");
    const data = await res.json();
    setSongs(data);
  };

  useEffect(() => { loadSongs(); }, []);

  const addToPlaylist = async (playlistId, songId) => {
    await fetch(`http://127.0.0.1:5000/api/playlists/${playlistId}/add_song`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song_id: songId })
    });
    alert("Added to playlist");
  };

  return (
    <div>
      <h2>Library</h2>
      {songs.map(song => (
        <div key={song.id} style={rowStyle} draggable
          onDragStart={(e) => e.dataTransfer.setData("song", JSON.stringify(song))}
        >
          <span onClick={() => setCurrent(song)} style={{ cursor: "pointer" }}>
            ▶ {song.title}
          </span>

          <select onChange={(e) => addToPlaylist(e.target.value, song.id)} defaultValue="">
            <option value="" disabled>Add to playlist</option>
            {playlists.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px",
  borderBottom: "1px solid #333"
};
