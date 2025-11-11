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

app.get('/api/scores/:type/:artist/:title', (req, res) => {
    const { type, artist, title } = req.params;
    
    const { isRated } = req.query; 

    let responseData = {};

    if (isRated === 'true') {
        responseData = {
            scores: [9.2, 7.6, 7.8], 
            counts: [1, 2, 12],
            scoreTitles: ["Your Musi Rating", "Friend Score", "User Score"],
            descriptions: [
                "#<strong>1</strong> on your list of music", 
                "What your <strong>friends</strong> think", 
                "Average score from <strong>all</strong> users"
            ]
        };
    } else {
        responseData = {
            scores: [7.6, 7.6, 7.8],
            counts: [101, 2, 12],
            scoreTitles: ["Rec Score", "Friend Score", "User Score"],
            descriptions: [
                "How much we think <strong>you</strong> will like it",
                "What your <strong>friends</strong> think", 
                "Average score from <strong>all</strong> users"
            ]
        };
    }

    res.json(responseData);
});

app.get('/api/albumlist/:artist/:title', (req, res) => {
    const { artist, title } = req.params;
    const songList = [
      { id: 1, title: "drivers license", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
      { id: 2, title: "deja vu", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
      { id: 3, title: "good 4 u", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
      { id: 4, title: "traitor", artist: "Olivia Rodrigo", isRated: false, score: (Math.random() * 10).toFixed(1) },
    ];
    if (songList) {
        res.json(songList);
    } else {
        res.json([]);
    }
});

// ---- FEATURED LISTS (mock) ----
const FEATURED_LISTS = [
  {
    title: "Study flow",
    tracks: [
      { id: 1, title: "Got to Be Real", subtitle: "Song • Cheryl Lynn" },
      { id: 2, title: "September", subtitle: "Song • Earth, Wind & Fire" },
      { id: 3, title: "Boogie Wonderland", subtitle: "Song • Earth, Wind & Fire, The Emotions" },
      { id: 4, title: "Ain’t Nobody", subtitle: "Song • Chaka Khan" },
      { id: 5, title: "Le Freak", subtitle: "Song • CHIC" }
    ],
  },
  {
    title: "RapCaviar",
    tracks: [
      { id: 11, title: "Meltdown", subtitle: "Song • Travis Scott, Drake" },
      { id: 12, title: "First Person Shooter", subtitle: "Song • Drake, J. Cole" },
      { id: 13, title: "Rich Flex", subtitle: "Song • Drake, 21 Savage" },
      { id: 14, title: "BROTHER STONE", subtitle: "Song • Don Toliver" },
      { id: 15, title: "Knife Talk", subtitle: "Song • Drake, 21 Savage, Project Pat" }
    ],
  },
  {
    title: "Teenage Fever",
    tracks: [
      { id: 21, title: "drivers license", subtitle: "Song • Olivia Rodrigo" },
      { id: 22, title: "Heather", subtitle: "Song • Conan Gray" },
      { id: 23, title: "Telepatía", subtitle: "Song • Kali Uchis" },
      { id: 24, title: "Sweater Weather", subtitle: "Song • The Neighbourhood" },
      { id: 25, title: "Someone You Loved", subtitle: "Song • Lewis Capaldi" }
    ],
  },
];

app.get("/api/featured-lists", (req, res) => {
  res.json(FEATURED_LISTS);
});

// ---- FEED DATA (mock, tabbed) ----
const FEED_SETS = {
  "trending": [
    {
      id: 1, user: "Mia", activity: "ranked", rating: "7.6", time: "Today",
      review: "People slept on Views way too hard when it dropped. Yeah, it's moody and self-indulgent, but that's what makes it timeless. The production aged beautifully.",
      likes: 10, bookmarks: 5, isLiked: false, artist: "Drake", title: "Views", musicType: "Album",
    },
    {
      id: 2, user: "Alex", activity: "ranked", rating: "9.2", time: "2 hours ago",
      review: "Kendrick really outdid himself here. Every track hits different and the production is insane.",
      likes: 24, bookmarks: 12, isLiked: false, artist: "Kendrick Lamar", title: "DAMN.", musicType: "Album",
    },
  ],
  "friend-recs": [
    {
      id: 3, user: "Sarah", activity: "recommended", rating: "8.8", time: "1 day ago",
      review: "If you haven't listened to Igor yet, you're missing out. Tyler's evolution as an artist is incredible.",
      likes: 15, bookmarks: 8, isLiked: false, artist: "Tyler, The Creator", title: "Igor", musicType: "Album",
    },
    {
      id: 4, user: "Jake", activity: "recommended", rating: "9.5", time: "2 days ago",
      review: "Still the best album of the 2010s. Frank's vocals and the production are otherworldly.",
      likes: 31, bookmarks: 18, isLiked: false, artist: "Frank Ocean", title: "Blonde", musicType: "Album",
    },
  ],
  "new-releases": [
    {
      id: 5, user: "Music Bot", activity: "new release", rating: "8.4", time: "3 hours ago",
      review: "SZA's highly anticipated follow-up to Ctrl is finally here. R&B perfection with modern twists.",
      likes: 42, bookmarks: 25, isLiked: false, artist: "SZA", title: "SOS", musicType: "Album",
    },
    {
      id: 6, user: "Music Bot", activity: "new release", rating: "7.9", time: "5 hours ago",
      review: "Metro proves once again why he's one of the best producers in the game right now.",
      likes: 28, bookmarks: 14, isLiked: false, artist: "Metro Boomin", title: "Heroes & Villains", musicType: "Album",
    },
  ],
};

app.get("/api/feed", (req, res) => {
  const { tab = "trending" } = req.query;
  const items = FEED_SETS[tab] || [];
  res.json({ tab, total: items.length, items });
});

// like/unlike toggle (in-memory)
app.post("/api/feed/:id/like", (req, res) => {
  const id = Number(req.params.id);
  for (const key of Object.keys(FEED_SETS)) {
    FEED_SETS[key] = FEED_SETS[key].map((it) =>
      it.id === id ? { ...it, isLiked: !it.isLiked, likes: it.isLiked ? it.likes - 1 : it.likes + 1 } : it
    );
  }
  res.json({ ok: true, id });
});

app.post('/api/onboarding', (req, res) => {
  const { answers } = req.body;
  
  console.log('Onboarding answers received:', answers);
  
  if (!answers) {
    return res.status(400).json({ error: 'Onboarding answers are required' });
  }
  
  res.json({ 
    message: 'Onboarding completed successfully',
    data: answers
  });
});




let PROFILE = {
  name: 'Andy Cabindol',
  username: 'andycabindol',
  bio: 'love listening to R&B',
  memberSince: 'August 1, 2025',
  followers: 2,
  following: 6,
  rank: 2,
  streakDays: 2,
  listenedCount: 1,
  wantCount: 0,
};

let PROFILE_ACTIVITY = [
  { id: 1, user: "You", activity: "ranked Cheryl Lynn's 'Got to Be Real'", rating: "7.6", time: "Today", review: "The song was awesome", likes: 0, bookmarks: 0, isLiked: false },
];

const PROFILE_TASTE = {
  genres: [
    { name: 'R&B',     value: 32, color: '#4A4A4A' },
    { name: 'Pop',     value: 28, color: '#C0C0C0' },
    { name: 'Hip Hop', value: 24, color: '#6B6B6B' },
    { name: 'Rock',    value: 16, color: '#E8E8E8' },
  ],
  topTracks: [
    { id: 1, title: "Got to Be Real", artist: "Cheryl Lynn", tags: ["Disco","R&B / Soul","Funk"], score: 9.0 },
    { id: 2, title: "Got to Be Real", artist: "Cheryl Lynn", tags: ["Disco","R&B / Soul","Funk"], score: 9.0 },
    { id: 3, title: "Got to Be Real", artist: "Cheryl Lynn", tags: ["Disco","R&B / Soul","Funk"], score: 9.0 },
  ],
  insights: {
    artistsListened: 32,
    songsRated: 156,
  }
};

// GET full profile bundle
app.get('/api/profile', (req, res) => {
  res.json({
    profile: PROFILE,
    activity: PROFILE_ACTIVITY,
    taste: PROFILE_TASTE,
  });
});

// PUT partial update (name, username, bio)
app.put('/api/profile', (req, res) => {
  const allowed = ['name', 'username', 'bio'];
  for (const k of allowed) {
    if (typeof req.body?.[k] === 'string') {
      PROFILE[k] = req.body[k];
    }
  }
  res.json({ ok: true, profile: PROFILE });
});

// POST like toggle on activity item
app.post('/api/profile/activity/:id/like', (req, res) => {
  const id = Number(req.params.id);
  PROFILE_ACTIVITY = PROFILE_ACTIVITY.map((it) => {
    if (it.id !== id) return it;
    const wasLiked = it.isLiked;
    return { ...it, isLiked: !wasLiked, likes: wasLiked ? it.likes - 1 : it.likes + 1 };
  });
  res.json({ ok: true, id });
});



module.exports = app