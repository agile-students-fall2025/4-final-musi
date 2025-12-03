require('dotenv').config();
const express = require("express");
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const User = require('./models').User;
const Review = require('./models').Review;
const app = express() 

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musi';

// Spotify connection
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'YOUR_SPOTIFY_CLIENT_SECRET';

// Connect to MongoDB using Mongoose
async function connectToMongoDB() {
  try {
    if (!MONGODB_URI) {
      console.log('⚠️ No MONGODB_URI found in .env - running without database');
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Continuing without database...');
  }
}

// Connect to Spotify
async function getSpotifyAccessToken() {
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenUrl = 'https://accounts.spotify.com/api/token';

    try {
        const response = await axios({
            method: 'POST',
            url: tokenUrl,
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: 'grant_type=client_credentials',
        });

        const accessToken = response.data.access_token;
        return accessToken;

    } catch (error) {
        console.error('Error fetching Spotify access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to authenticate with Spotify API.');
    }
}

// Initialize connection
connectToMongoDB();

app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use(authMiddleware);

app.get('/api/music/:type/:artist/:title', (req, res) => {
    const { type, artist, title } = req.params;
    const userId = req.user.id;
    const data = { 
        imageUrl: "/olivia-album.jpg",
        spotifyId: `${type}-${artist}-${title}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: title || "SOUR",
        artist: artist || "Olivia Rodrigo",
        avgScore: 8.4,
        totalRatings: 1250,
        isRated: false, 
        musicType: type || "Album",
        vibe: ["heartbreak", "pop", "emotional"],
        genre: ["pop", "indie pop"],
        year: 2021,
    };

    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: "Music not found" });
    }
});

app.get('/api/followers/:username', (req, res) => {
    const { username } = req.params;
    const userId = req.user.id;
    const followers = [
      { id: 'user1', name: 'David', username: '@dvd', mutual: true },
      { id: 'user2', name: 'Zuhair', username: '@zuhair', mutual: false },
      { id: 'user3', name: 'Julz', username: '@julz', mutual: true },
    ];
    
    const following = [
      { id: 'user4', name: 'Ian', username: '@ian' },
      { id: 'user5', name: 'Lana', username: '@lana' },
      { id: 'user6', name: 'Patrick', username: '@patrick' },
      { id: 'user7', name: 'Tobey', username: '@tobey' },
      { id: 'user8', name: 'Liam', username: '@liam' },
      { id: 'user1', name: 'David', username: '@david' },
    ];
    if (followers && following) {
        res.json({ followers, following });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

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
app.get('/api/lists', (req, res) => {
  const {
    tab = 'listened',
    q = '',
    limit = '50',
    offset = '0',
  } = req.query;

  const userId = req.user.id;

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
  const userId = req.user.id;
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
    const userId = req.user.id;
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

app.get('/api/search', (req, res) => {
  const userId = req.user.id;
  res.json(MOCK_SONGS);
});

app.get('/api/leaderboard', (req, res) => {
  const userId = req.user.id;
    
  const reviewData = [
    { rank: 1, username: "@dvd", score: 640 },
    { rank: 2, username: "@andycabindol", score: 569 },
    { rank: 3, username: "@julz", score: 467 },
    { rank: 4, username: "@ian", score: 428 },
    { rank: 5, username: "@zuhair", score: 304 },
    { rank: 6, username: "@beef", score: 237 },
    { rank: 7, username: "@fish", score: 220 },
    { rank: 8, username: "@tofu", score: 96 },
    { rank: 9, username: "@salmon", score: 90 },
    { rank: 10, username: "@trash", score: 9 },
    { rank: 11, username: "@slop", score: 1 },
  ];

  const albumData = [
    { rank: 1, username: "@tea", score: 190 },
    { rank: 2, username: "@egg", score: 179 },
    { rank: 3, username: "@julz", score: 167 },
    { rank: 4, username: "@ian", score: 128 },
    { rank: 5, username: "@zuhair", score: 104 },
    { rank: 6, username: "@beef", score: 100 },
    { rank: 7, username: "@fish", score: 99 },
    { rank: 8, username: "@andycabindol", score: 96 },
    { rank: 9, username: "@salmon", score: 29 },
    { rank: 10, username: "@trash", score: 14 },
    { rank: 11, username: "@slop", score: 1 },
  ];

  const songData = [
    { rank: 1, username: "@ian", score: 1640 },
    { rank: 2, username: "@andycabindol", score: 1569 },
    { rank: 3, username: "@julz", score: 1467 },
    { rank: 4, username: "@andy", score: 1428 },
    { rank: 5, username: "@zuhair", score: 1304 },
    { rank: 6, username: "@beef", score: 1237 },
    { rank: 7, username: "@fish", score: 1220 },
    { rank: 8, username: "@jules", score: 1096 },
    { rank: 9, username: "@salmon", score: 1029 },
    { rank: 10, username: "@trash", score: 814 },
    { rank: 11, username: "@slop", score: 451 },
  ];

  const dataMap = {
    reviews: reviewData,
    songs: songData,
    albums: albumData,
  };

  res.json(dataMap);
});

app.get('/api/albumlist/:artist/:title', (req, res) => {
    const { artist, title } = req.params;
    const userId = req.user.id;
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
      { id: 4, title: "Ain't Nobody", subtitle: "Song • Chaka Khan" },
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
  const userId = req.user.id;
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

// ===== PROFILE ROUTES - FETCH FROM MONGODB =====

// GET full profile bundle from MongoDB
app.get('/api/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', 'username name')
      .populate('following', 'username name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate member since date
    const memberSince = new Date(user.dateJoined || user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const profile = {
      name: user.name || user.username,
      username: user.username,
      bio: user.bio || 'No bio yet',
      memberSince: memberSince,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      rank: 2, // TODO: Calculate actual rank from leaderboard
      streakDays: user.currentStreak || 0,
      listenedCount: user.reviews?.length || 0,
      wantCount: 0, // TODO: Implement want list
    };

    // Mock activity data (replace with real reviews later)
    const activity = [
      {
        id: 1,
        user: user.name || user.username,
        activity: "ranked",
        rating: "7.6",
        time: "Today",
        review: "Great song!",
        likes: 0,
        bookmarks: 0,
        isLiked: false,
        artist: "Sample Artist",
        title: "Sample Song",
        musicType: "Song"
      }
    ];

    // Mock taste data (replace with real data later)
    const taste = {
      genres: [
        { name: 'R&B', value: 32, color: '#4A4A4A' },
        { name: 'Pop', value: 28, color: '#C0C0C0' },
        { name: 'Hip Hop', value: 24, color: '#6B6B6B' },
        { name: 'Rock', value: 16, color: '#E8E8E8' }
      ],
      topTracks: [
        { id: 1, title: "Sample Track", artist: "Sample Artist", tags: ["Pop"], score: 8.0 }
      ],
      insights: {
        artistsListened: 10,
        songsRated: user.reviews?.length || 0
      }
    };

    res.json({
      profile,
      activity,
      taste
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT partial update (name, username, bio)
app.put('/api/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (name !== undefined && name.trim()) {
      user.name = name.trim();
    }
    
    if (username !== undefined && username.trim()) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: username.trim(), 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      user.username = username.trim();
    }
    
    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    // Return updated profile
    const memberSince = new Date(user.dateJoined || user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const profile = {
      name: user.name || user.username,
      username: user.username,
      bio: user.bio || 'No bio yet',
      memberSince: memberSince,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      rank: 2,
      streakDays: user.currentStreak || 0,
      listenedCount: user.reviews?.length || 0,
      wantCount: 0,
    };

    res.json({ 
      ok: true, 
      profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Mock activity like toggle (will be replaced with real data)
let PROFILE_ACTIVITY = [
  { 
    id: 1, 
    user: "User", 
    activity: "ranked", 
    rating: "7.6", 
    time: "Today", 
    review: "Great song!", 
    likes: 0, 
    bookmarks: 0, 
    isLiked: false,
    artist: "Sample Artist",
    title: "Sample Song",
    musicType: "Song"
  },
];

// POST like toggle on activity item
app.post('/api/profile/activity/:id/like', (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    let found = false;

    PROFILE_ACTIVITY = PROFILE_ACTIVITY.map((it) => {
      if (it.id !== id) return it;
      
      found = true;
      const wasLiked = it.isLiked;
      return { ...it, isLiked: !wasLiked, likes: wasLiked ? it.likes - 1 : it.likes + 1 };
    });

    if (!found) {
      return res.status(404).json({ error: 'Activity item not found' });
    }

    res.json({ ok: true, id });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

app.delete('/api/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    await User.findByIdAndDelete(userId);

    await Review.deleteMany({ userId: userId }); 

    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ===== STREAK ROUTES (ENHANCED) =====

//mock data for our profile
let userData = {
  profile: {
    name: "John Doe",
    username: "johndoe",
    bio: "Music lover 🎵",
    memberSince: "January 2024",
    followers: 1234,
    following: 567,
    rank: 42,
    streakDays: 7, // Current streak
    lastActivity: new Date().toISOString().split('T')[0], // Today's date
    listenedCount: 89,
    wantCount: 23
  },
  streakHistory: [
    { date: "2024-11-11", activity: "listened" },
    { date: "2024-11-10", activity: "listened" },
    { date: "2024-11-09", activity: "listened" },
    { date: "2024-11-08", activity: "listened" },
    { date: "2024-11-07", activity: "listened" },
    { date: "2024-11-06", activity: "listened" },
    { date: "2024-11-05", activity: "listened" }
  ]
};

function calculateCurrentStreak(streakHistory) {
  if (!streakHistory || streakHistory.length === 0) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const sortedHistory = streakHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const record of sortedHistory) {
    const recordDate = record.date;
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (recordDate === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
// ===== STREAK ROUTES =====

// GET streak from MongoDB
app.get('/api/streak', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('currentStreak longestStreak lastLoginDate totalLogins');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastLoginDate: user.lastLoginDate,
      totalLogins: user.totalLogins || 0
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
});

// POST activity to update streak
app.post('/api/streak/activity', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update streak
    const streakUpdate = user.updateStreak();
    await user.save();
    
    res.json({
      message: "Activity recorded successfully",
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakUpdate: streakUpdate
    });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

app.use('/api/reviews', require('./routes/reviews'));

app.get('/api/friendscores/:type/:artist/:title', (req, res) => {
    const { type, artist, title } = req.params;
    const userId = req.user.id;
    const friendScores = [
      { id: 1, name: 'David', handle: '@dvd', score: 7.1, rating: 3, imgUrl: '' },
      { id: 2, name: 'Julz Liang', handle: '@julzliang', score: 7.2, rating: 3, imgUrl: '' },
      { id: 3, name: 'Andy Cabindol', handle: '@andycabindol', score: 3.4, rating: 2, imgUrl: '' },
      { id: 4, name: 'Zuhair', handle: '@zuhair', score: 6.7, rating: 3, imgUrl: '' },
    ];
    if (friendScores) {
        res.json(friendScores);
    } else {
        res.json([]);
    }
});

module.exports = app;