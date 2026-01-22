import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SongGrid from "../components/SongGrid";
import Player from "../components/Player";
import SearchBar from "../components/SearchBar";
import PlaylistPanel from "../components/PlaylistPanel";
import UploadZone from "../components/UploadZone";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/songs")
      .then(res => res.json())
      .then(data => setQueue(data));
  }, []);

  const playSong = (song) => {
    setQueue(q => [...q, song]);
    setCurrent(song);
  };


  const nextSong = () => {
    setQueue(q => {
      if (repeat) return q;

      let next;
      if (shuffle && q.length > 1) {
        next = q[Math.floor(Math.random() * q.length)];
      } else {
        next = q[1];
      }

      setCurrent(next || null);
      return q.slice(1);
    });
  };


  <Player
    song={current}
    onNext={nextSong}
    queue={queue}
    setCurrent={setCurrent}
    setQueue={setQueue}
  />

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <SearchBar setSongs={setSongs} />
        <SongGrid songs={songs} onPlay={playSong} />
      <div style={{ padding: "20px", backgroundColor: "#121212", color: "white" }}></div>
        <h1>Fake Spotify</h1>

        {/* Upload MP3 files here */}
      <UploadZone onUpload={(song) => setQueue(prev => [...prev, song])} />

      {/* Playlist / Queue */}
      <PlaylistPanel queue={queue} setCurrent={setCurrent} />

      {/* Player */}
      <Player song={current} queue={queue} setCurrent={setCurrent} />
      </div>
      <PlaylistPanel queue={queue} setQueue={setQueue} />
      <Player song={current} onNext={nextSong} />
    </div>
  );

}
