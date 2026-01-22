const API = "http://127.0.0.1:5000";

export default function Playlists({ playlists, songs, refresh, setCurrentSong }) {
  const addSongToPlaylist = async (playlistId, songId) => {
    await fetch(`${API}/api/playlists/${playlistId}/add/${songId}`, {
      method: "POST",
    });
    refresh();
  };

  return (
    <div className="playlists-grid">
      {playlists.map((pl) => (
        <div key={pl.id} className="playlist-card">
          <h4>{pl.name}</h4>
          <div className="playlist-songs">
            {pl.songs.map((sid) => {
              const s = songs.find((song) => song.id === sid);
              if (!s) return null;
              return (
                <div key={s.id} onClick={() => setCurrentSong(s)}>
                  {s.title}
                </div>
              );
            })}
          </div>
          <div className="add-song">
            {songs.map(
              (s) =>
                !pl.songs.includes(s.id) && (
                  <button
                    key={s.id}
                    onClick={() => addSongToPlaylist(pl.id, s.id)}
                  >
                    + {s.title}
                  </button>
                )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
