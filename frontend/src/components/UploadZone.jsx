const API = "http://127.0.0.1:5000";

export default function Upload({ refresh }) {
  const fileInput = React.useRef();

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    await fetch(`${API}/api/upload`, {
      method: "POST",
      body: data,
    });

    refresh();
  };

  return (
    <div className="upload-container">
      <button onClick={() => fileInput.current.click()}>Upload Song</button>
      <input
        type="file"
        accept=".mp3,.m4a"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={upload}
      />
    </div>
  );
}
