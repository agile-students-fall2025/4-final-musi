const express = require("express") 
const cors = require('cors');
const app = express() 

app.use(cors());
app.use(express.json());

app.get('/api/music/:type/:artist/:title', (req, res) => {
    const { type, artist, title } = req.params;
    const data = { 
        imageUrl: "/olivia-album.jpg",
        title: title || "SOUR",
        artist: artist || "Olivia Rodrigo",
        avgScore: 8.4,
        totalRatings: 1250,
        isRated: false, 
        musicType: type || "Album",
        vibe: ["heartbreak", "pop", "emotional"],
        genre: ["pop", "indie pop"],
        year: 2021,
    }

    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: "Music not found" });
    }
})

// --- MOCK DATA (replace with DB later) ---
const MOCK_SONGS = [
  { id: 1,  title: "As It Was",         artist: "Harry Styles",   tags: ["Pop","Indie Pop","UK"],        score: 8.2, musicType: "Song" },
  { id: 2,  title: "Flowers",           artist: "Miley Cyrus",    tags: ["Pop","Dance","Contemporary"],  score: 7.9, musicType: "Song" },
  { id: 3,  title: "Kill Bill",         artist: "SZA",            tags: ["R&B","Soul","Alt R&B"],        score: 8.7, musicType: "Song" },
  { id: 4,  title: "About Damn Time",   artist: "Lizzo",          tags: ["Funk Pop","Disco","Soul"],     score: 8.0, musicType: "Song" },
  { id: 5,  title: "Blinding Lights",   artist: "The Weeknd",     tags: ["Synthpop","Pop","R&B"],        score: 9.1, musicType: "Song" },
  { id: 6,  title: "Levitating",        artist: "Dua Lipa",       tags: ["Disco Pop","Dance","Funk"],    score: 8.4, musicType: "Song" },
  { id: 7,  title: "Got to Be Real",    artist: "Cheryl Lynn",    tags: ["Disco","R&B / Soul","Funk"],   score: 9.0, musicType: "Song" },
  { id: 8,  title: "Superstition",      artist: "Stevie Wonder",  tags: ["Funk","Soul","Classic"],       score: 9.5, musicType: "Song" },
  { id: 9,  title: "Dreams",            artist: "Fleetwood Mac",  tags: ["Soft Rock","Pop Rock","Classic"], score: 9.2, musicType: "Song" },
  { id: 10, title: "Good as Hell",      artist: "Lizzo",          tags: ["Pop Soul","Empowerment","Funk"], score: 8.3, musicType: "Song" },
];

// --- /api/lists ---
// GET /api/lists?tab=listened|want|recs|trending|friends|new&q=...&limit=10&offset=0
app.get('/api/lists', (req, res) => {
  const {
    tab = 'listened',
    q = '',
    limit = '50',
    offset = '0',
  } = req.query;

  const lim = Math.max(1, Math.min(parseInt(limit, 10) || 50, 100));
  const off = Math.max(0, parseInt(offset, 10) || 0);
  const query = String(q).trim().toLowerCase();

  let rows = [...MOCK_SONGS];
  switch (tab) {
    case 'want':
      rows = rows.filter((_, i) => i % 3 === 0);
      break;
    case 'recs':
      rows = rows.filter(s => (s.score ?? 0) >= 8.5);
      break;
    case 'trending':
      rows = rows.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      break;
    case 'friends':
      rows = rows.filter((_, i) => i % 2 === 1);
      break;
    case 'new':
      rows = rows.slice().reverse();
      break;
    case 'listened':
    default:
      break;
  }

  if (query) {
    rows = rows.filter(s => {
      const hay = [
        s.title,
        s.artist,
        ...(s.tags || []),
        s.musicType || ''
      ].join(' ').toLowerCase();
      return hay.includes(query);
    });
  }

  const total = rows.length;
  const page = rows.slice(off, off + lim);

  res.json({
    tab,
    q: query || undefined,
    total,
    limit: lim,
    offset: off,
    items: page,
  });
});

// --- /api/tabs route ---
app.get('/api/tabs', (req, res) => {
  const tabs = [
    { key: "listened", label: "Listened", count: 204 },
    { key: "want", label: "Want to listen", count: 10 },
    { key: "recs", label: "Recs" },
    { key: "trending", label: "Trending" },
    { key: "recs from friends", label: "Recs from friends" },
    { key: "new releases", label: "New releases" },
  ];
  res.json(tabs);
});




module.exports = app