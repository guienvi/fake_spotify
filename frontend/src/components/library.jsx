export default function Library({ songs, setCurrentSong }) {
  return (
    <div className="library-grid">
      {songs.map((song) => (
        <div
          key={song.id}
          className="song-card"
          onClick={() => setCurrentSong(song)}
          draggable
        >
          <img
            src={`http://127.0.0.1:5000/static/covers/${song.cover}`}
            alt="cover"
          />
          <div className="song-info">
            <strong>{song.title}</strong>
            <small>{song.artist}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
