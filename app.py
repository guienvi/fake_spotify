import os, uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from mutagen import File
from PIL import Image
from io import BytesIO

BASE_DIR = os.path.dirname(__file__)
MUSIC_FOLDER = os.path.join(BASE_DIR, "music")
COVER_FOLDER = os.path.join(BASE_DIR, "static", "covers")

os.makedirs(MUSIC_FOLDER, exist_ok=True)
os.makedirs(COVER_FOLDER, exist_ok=True)

ALLOWED = (".mp3", ".m4a")

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///music.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ---------- MODELS ----------

playlist_songs = db.Table(
    "playlist_songs",
    db.Column("playlist_id", db.Integer, db.ForeignKey("playlist.id")),
    db.Column("song_id", db.Integer, db.ForeignKey("song.id")),
)

class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    artist = db.Column(db.String(200))
    filename = db.Column(db.String(300), unique=True)
    cover = db.Column(db.String(300))

class Playlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    songs = db.relationship("Song", secondary=playlist_songs, backref="playlists")

# ✅ FIX: app context
with app.app_context():
    db.create_all()

# ---------- METADATA ----------

def extract_metadata(path):
    audio = File(path)
    title = os.path.splitext(os.path.basename(path))[0]
    artist = "Unknown"
    cover = "default.jpg"

    if audio:
        if "TIT2" in audio:
            title = audio["TIT2"].text[0]
        if "TPE1" in audio:
            artist = audio["TPE1"].text[0]

        if audio.tags:
            for tag in audio.tags.values():
                if hasattr(tag, "FrameID") and tag.FrameID == "APIC":
                    img = Image.open(BytesIO(tag.data))
                    name = f"{uuid.uuid4()}.jpg"
                    img.save(os.path.join(COVER_FOLDER, name))
                    cover = name
                    break

            if "covr" in audio.tags:
                img = Image.open(BytesIO(audio.tags["covr"][0]))
                name = f"{uuid.uuid4()}.jpg"
                img.save(os.path.join(COVER_FOLDER, name))
                cover = name

    return title, artist, cover

# ---------- SYNC MUSIC ----------

def sync_music():
    existing = {s.filename for s in Song.query.all()}

    for f in os.listdir(MUSIC_FOLDER):
        if f.lower().endswith(ALLOWED) and f not in existing:
            path = os.path.join(MUSIC_FOLDER, f)
            title, artist, cover = extract_metadata(path)
            db.session.add(Song(title=title, artist=artist, filename=f, cover=cover))
    db.session.commit()

# ---------- ROUTES ----------

@app.route("/api/songs")
def get_songs():
    sync_music()
    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "artist": s.artist,
            "file": s.filename,
            "cover": s.cover
        } for s in Song.query.all()
    ])

@app.route("/api/upload", methods=["POST"])
def upload():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(ALLOWED):
        return {"error": "Invalid file"}, 400

    file.save(os.path.join(MUSIC_FOLDER, file.filename))
    sync_music()
    return {"success": True}

@app.route("/api/playlists", methods=["GET", "POST"])
def playlists():
    if request.method == "POST":
        p = Playlist(name=request.json["name"])
        db.session.add(p)
        db.session.commit()
        return {"id": p.id}

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "songs": [s.id for s in p.songs]
        } for p in Playlist.query.all()
    ])

@app.route("/api/playlists/<int:pid>/add/<int:sid>", methods=["POST"])
def add_song(pid, sid):
    p = Playlist.query.get_or_404(pid)
    s = Song.query.get_or_404(sid)
    if s not in p.songs:
        p.songs.append(s)
        db.session.commit()
    return {"success": True}

@app.route("/api/playlists/<int:pid>/remove/<int:sid>", methods=["POST"])
def remove_song(pid, sid):
    p = Playlist.query.get_or_404(pid)
    s = Song.query.get_or_404(sid)
    if s in p.songs:
        p.songs.remove(s)
        db.session.commit()
    return {"success": True}

@app.route("/music/<path:filename>")
def serve_music(filename):
    return send_from_directory(MUSIC_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True)
