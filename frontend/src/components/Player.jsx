import { useEffect, useRef, useState } from "react";

export default function Player({ current, queue, setCurrent }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    if (current) audioRef.current.play();
  }, [current]);

  useEffect(() => {
    const audio = audioRef.current;

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, []);

  // Keyboard media keys
  useEffect(() => {
    navigator.mediaSession?.setActionHandler("play", () => audioRef.current.play());
    navigator.mediaSession?.setActionHandler("pause", () => audioRef.current.pause());
    navigator.mediaSession?.setActionHandler("nexttrack", playNext);
  }, [current]);

  const playNext = () => {
    const index = queue.findIndex(s => s.id === current.id);
    setCurrent(queue[(index + 1) % queue.length]);
  };

  return (
    <div className="player">
      <audio ref={audioRef} src={`http://127.0.0.1:5000/music/${current?.file}`} />

      <div className="song-info">
        <strong>{current?.title}</strong>
      </div>

      <div className="controls">
        <button onClick={() => audioRef.current.pause()}>⏸</button>
        <button onClick={() => audioRef.current.play()}>▶</button>
        <button onClick={playNext}>⏭</button>
      </div>

      <div className="progress">
        <input
          type="range"
          value={progress}
          onChange={e => {
            audioRef.current.currentTime =
              (e.target.value / 100) * audioRef.current.duration;
          }}
        />
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={e => {
          setVolume(e.target.value);
          audioRef.current.volume = e.target.value;
        }}
      />
    </div>
  );
}
