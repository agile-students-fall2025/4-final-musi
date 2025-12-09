require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const { User, Review, Song, Album } = require("./models");
const app = express();

// --- Avatar color helper (matches user schema logic) ---
function computeAvatarColor(username = "") {
  const clean = (username || "").replace(/^@/, "") || "user";
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const saturation = 65;
  const lightness = 55;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/musi";

// Spotify connection
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "YOUR_SPOTIFY_CLIENT_ID";
const CLIENT_SECRET =
  process.env.SPOTIFY_CLIENT_SECRET || "YOUR_SPOTIFY_CLIENT_SECRET";

// Connect to MongoDB using Mongoose
async function connectToMongoDB() {
  try {
    if (!MONGODB_URI) {
      console.log("⚠️ No MONGODB_URI found in .env - running without database");
      return;
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("Continuing without database...");
  }
}

// Connect to Spotify
async function getSpotifyAccessToken() {
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );
  const tokenUrl = "https://accounts.spotify.com/api/token";

  try {
    const response = await axios({
      method: "POST",
      url: tokenUrl,
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
    });

    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error(
      "Error fetching Spotify access token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to authenticate with Spotify API.");
  }
}

// Initialize connection
connectToMongoDB();

app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use("/api/auth", authRoutes);

// Protected routes (auth required)
app.use(authMiddleware);

app.get("/api/music/:type/:artist/:title", authMiddleware, async (req, res) => {
  try {
    const { type, artist, title } = req.params;
    const userId = req.user.id;

    const targetId = `${type}-${artist}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    console.log(`Fetching data for: ${targetId}`);

    // 1) Get existing review stats from Mongo
    const userReview = await Review.findOne({
      userId: userId,
      targetId: targetId,
    });

    const stats = await Review.aggregate([
      { $match: { targetId: targetId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$rating" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const avgScore =
      stats.length > 0 ? parseFloat(stats[0].averageScore.toFixed(1)) : 0;
    const totalRatings = stats.length > 0 ? stats[0].totalCount : 0;

    // 2) Fetch metadata from Spotify based on type + artist + title
    const accessToken = await getSpotifyAccessToken();
    const isSong = (type || "").toLowerCase() === "song";

    const searchQuery = isSong
      ? `track:${title} artist:${artist}`
      : `album:${title} artist:${artist}`;

    const spotifyResp = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: searchQuery,
        type: isSong ? "track" : "album",
        limit: 1,
      },
    });

    let spotifyItem = null;
    if (isSong) {
      spotifyItem = spotifyResp.data?.tracks?.items?.[0] || null;
    } else {
      spotifyItem = spotifyResp.data?.albums?.items?.[0] || null;
    }

    if (!spotifyItem) {
      console.warn("No Spotify item found for", { type, artist, title });
    }
    let genres = [];
    
    if (spotifyItem && spotifyItem.artists && spotifyItem.artists.length > 0) {
      const mainArtistId = spotifyItem.artists[0].id;
      
      if (mainArtistId) {
        try {
          const artistResp = await axios.get(
            `https://api.spotify.com/v1/artists/${mainArtistId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          
          if (artistResp.data && artistResp.data.genres) {
            genres = artistResp.data.genres;
          }
        } catch (artistErr) {
          console.warn("Failed to fetch artist genres:", artistErr.message);
        }
      }
    }
    // 3) Normalize Spotify data
    const imageUrl = isSong
      ? spotifyItem?.album?.images?.[0]?.url || ""
      : spotifyItem?.images?.[0]?.url || "";

    const displayTitle = spotifyItem?.name || title;
    const displayArtist =
      (spotifyItem?.artists || []).map((a) => a.name).join(", ") || artist;

    const releaseDate = isSong
      ? spotifyItem?.album?.release_date
      : spotifyItem?.release_date;

    const year = releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : null;

    const user = await User.findById(userId).select("wantList").lean().exec();
    const wantList = Array.isArray(user?.wantList) ? user.wantList : [];
    const spotifyId = spotifyItem?.id || targetId;
    const spotifyUrl = spotifyItem?.external_urls?.spotify || null;

    const data = {
      spotifyId,
      title: displayTitle,
      artist: displayArtist,
      musicType: type,

      isRated: !!userReview,
      avgScore: avgScore,
      totalRatings: totalRatings,

      imageUrl,
      vibe: [], // could be enhanced later with audio features
      genre: genres, // could be enhanced later with artist/album genres
      year,
      isBookmarked: wantList.includes(spotifyId),
      spotifyUrl,
    };

    res.json(data);
  } catch (err) {
    console.error(
      "Error fetching music details:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/followers/:username", async (req, res) => {
  try {
    const rawUsername = req.params.username || "";
    const username = rawUsername.startsWith("@")
      ? rawUsername.slice(1)
      : rawUsername;

    const user = await User.findOne({ username })
      .populate("followers", "username name profilePictureUrl avatarColor")
      .populate("following", "username name profilePictureUrl avatarColor");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingIds = new Set(
      (user.following || []).map((u) => String(u._id))
    );

    const followers = (user.followers || []).map((u) => {
      const color = u.avatarColor || computeAvatarColor(u.username);
      return {
        id: String(u._id),
        name: u.name || u.username,
        username: `@${u.username}`,
        profilePictureUrl: u.profilePictureUrl || "",
        avatarColor: color,
        mutual: followingIds.has(String(u._id)),
      };
    });

    const following = (user.following || []).map((u) => {
      const color = u.avatarColor || computeAvatarColor(u.username);
      return {
        id: String(u._id),
        name: u.name || u.username,
        username: `@${u.username}`,
        profilePictureUrl: u.profilePictureUrl || "",
        avatarColor: color,
      };
    });

    res.json({ followers, following });
  } catch (err) {
    console.error("Error fetching followers/following:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- MOCK DATA (replace with DB later) ---
const MOCK_SONGS = [
  {
    id: 1,
    title: "As It Was",
    artist: "Harry Styles",
    tags: ["Pop", "Indie Pop", "UK"],
    score: 8.2,
    musicType: "Song",
  },
  {
    id: 2,
    title: "Flowers",
    artist: "Miley Cyrus",
    tags: ["Pop", "Dance", "Contemporary"],
    score: 7.9,
    musicType: "Song",
  },
  {
    id: 3,
    title: "Kill Bill",
    artist: "SZA",
    tags: ["R&B", "Soul", "Alt R&B"],
    score: 8.7,
    musicType: "Song",
  },
  {
    id: 4,
    title: "About Damn Time",
    artist: "Lizzo",
    tags: ["Funk Pop", "Disco", "Soul"],
    score: 8.0,
    musicType: "Song",
  },
  {
    id: 5,
    title: "Blinding Lights",
    artist: "The Weeknd",
    tags: ["Synthpop", "Pop", "R&B"],
    score: 9.1,
    musicType: "Song",
  },
  {
    id: 6,
    title: "Levitating",
    artist: "Dua Lipa",
    tags: ["Disco Pop", "Dance", "Funk"],
    score: 8.4,
    musicType: "Song",
  },
  {
    id: 7,
    title: "Got to Be Real",
    artist: "Cheryl Lynn",
    tags: ["Disco", "R&B / Soul", "Funk"],
    score: 9.0,
    musicType: "Song",
  },
  {
    id: 8,
    title: "Superstition",
    artist: "Stevie Wonder",
    tags: ["Funk", "Soul", "Classic"],
    score: 9.5,
    musicType: "Song",
  },
  {
    id: 9,
    title: "Dreams",
    artist: "Fleetwood Mac",
    tags: ["Soft Rock", "Pop Rock", "Classic"],
    score: 9.2,
    musicType: "Song",
  },
  {
    id: 10,
    title: "Good as Hell",
    artist: "Lizzo",
    tags: ["Pop Soul", "Empowerment", "Funk"],
    score: 8.3,
    musicType: "Song",
  },
];

// --- /api/lists ---
app.get("/api/lists", async (req, res) => {
  try {
    const { tab = "listened", q = "", limit = "50", offset = "0" } = req.query;

    const userId = req.user.id;

    const lim = Math.max(1, Math.min(parseInt(limit, 10) || 50, 100));
    const off = Math.max(0, parseInt(offset, 10) || 0);
    const query = String(q).trim().toLowerCase();

    let rows = [];

    if (tab === "listened") {
      // All songs/albums the user has reviewed
      const reviews = await Review.find({ userId })
        .sort({ rating: -1 })
        .lean()
        .exec();

      if (reviews.length) {
        const songIds = reviews
          .filter((r) => r.targetType === "Song")
          .map((r) => r.targetId);
        const albumIds = reviews
          .filter((r) => r.targetType === "Album")
          .map((r) => r.targetId);

        const [songs, albums] = await Promise.all([
          songIds.length
            ? Song.find({ spotifyId: { $in: songIds } })
                .lean()
                .exec()
            : [],
          albumIds.length
            ? Album.find({ spotifyId: { $in: albumIds } })
                .lean()
                .exec()
            : [],
        ]);

        const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
        const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

        rows = reviews.map((r) => {
          const isSong = r.targetType === "Song";
          const meta = isSong
            ? songMap.get(r.targetId) || {}
            : albumMap.get(r.targetId) || {};

          return {
            id: r._id,
            title: meta.title || "Unknown",
            artist: meta.artist || "Unknown",
            imageUrl: meta.coverUrl || "",
            tags: [],
            score: typeof r.rating === "number" ? r.rating.toFixed(1) : null,
            musicType: r.targetType,
          };
        });
      }
    } else if (tab === "want") {
      // Songs/albums the user bookmarked (want-to-listen)
      const user = await User.findById(userId).select("wantList").lean().exec();
      const wantIds = Array.isArray(user?.wantList) ? user.wantList : [];

      if (wantIds.length) {
        const [songs, albums, reviews] = await Promise.all([
          Song.find({ spotifyId: { $in: wantIds } })
            .lean()
            .exec(),
          Album.find({ spotifyId: { $in: wantIds } })
            .lean()
            .exec(),
          Review.find({ userId }).select("targetId").lean().exec(),
        ]);

        const reviewedIds = new Set(reviews.map((r) => r.targetId));

        const slugify = (type, artistName, titleName) =>
          `${type}-${artistName}-${titleName}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-");

        rows = [
          ...songs
            .filter(
              (s) =>
                !reviewedIds.has(slugify("Song", s.artist || "", s.title || ""))
            )
            .map((s) => ({
              id: s._id,
              spotifyId: s.spotifyId,
              title: s.title || "Unknown",
              artist: s.artist || "Unknown",
              imageUrl: s.coverUrl || "",
              tags: [],
              score: null,
              musicType: "Song",
            })),
          ...albums
            .filter(
              (a) =>
                !reviewedIds.has(
                  slugify("Album", a.artist || "", a.title || "")
                )
            )
            .map((a) => ({
              id: a._id,
              spotifyId: a.spotifyId,
              title: a.title || "Unknown",
              artist: a.artist || "Unknown",
              imageUrl: a.coverUrl || "",
              tags: [],
              score: null,
              musicType: "Album",
            })),
        ];
      }
    } else if (tab === "new") {
      // Fetch new releases from Spotify
      try {
        const accessToken = await getSpotifyAccessToken();
        const spotifyResp = await axios.get(
          "https://api.spotify.com/v1/browse/new-releases",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              limit: Math.min(lim + off, 50), // Spotify API max is 50
              offset: off,
              country: "US", // You can make this configurable
            },
          }
        );

        const albums = spotifyResp.data?.albums?.items || [];
        const user = await User.findById(userId)
          .select("wantList")
          .lean()
          .exec();
        const wantList = Array.isArray(user?.wantList) ? user.wantList : [];

        rows = albums.map((album) => {
          const artistNames = (album.artists || [])
            .map((a) => a.name)
            .join(", ");
          return {
            id: album.id,
            spotifyId: album.id,
            title: album.name || "Unknown",
            artist: artistNames || "Unknown",
            imageUrl: album.images?.[0]?.url || "",
            tags: album.album_type ? [album.album_type] : [],
            score: null,
            musicType: "Album",
            bookmarked: wantList.includes(album.id),
          };
        });
      } catch (error) {
        console.error(
          "Error fetching new releases from Spotify:",
          error.response ? error.response.data : error.message
        );
        rows = [];
      }
    } else if (tab === "trending") {
      // Fetch trending songs from Spotify Global Top 50
      try {
        console.log("Fetching Spotify trending for userId:", userId);
        console.log("CLIENT_ID exists:", !!CLIENT_ID);
        console.log("CLIENT_SECRET exists:", !!CLIENT_SECRET);
        const accessToken = await getSpotifyAccessToken();
        console.log("Got Spotify access token:", accessToken ? "YES" : "NO");
        
        // Use Spotify's Browse API to get new releases (most reliable with Client Credentials)
        const spotifyResp = await axios.get(
          "https://api.spotify.com/v1/browse/new-releases",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              limit: 50,
              country: "US",
            },
          }
        );

        console.log("Got Spotify response, albums:", spotifyResp.data?.albums?.items?.length);
        const albums = spotifyResp.data?.albums?.items || [];
        
        const user = await User.findById(userId)
          .select("wantList")
          .lean()
          .exec();
        const wantList = Array.isArray(user?.wantList) ? user.wantList : [];

        // Convert albums to song-like format for trending display
        rows = albums.slice(0, 50).map((album) => {
          const artistNames = (album.artists || [])
            .map((a) => a.name)
            .join(", ");
          return {
            id: album.id,
            spotifyId: album.id,
            title: album.name || "Unknown",
            artist: artistNames || "Unknown",
            imageUrl: album.images?.[0]?.url || "",
            tags: ["New Release"],
            score: null,
            musicType: "Album",
            bookmarked: wantList.includes(album.id),
          };
        });
        console.log("Processed trending tracks:", rows.length);
      } catch (error) {
        console.error(
          "Error fetching trending from Spotify:",
          error.response ? error.response.data : error.message
        );
        console.error("Full error:", error);
        rows = [];
      }
    } else if (tab === "friends") {
      // Songs that the user hasn't rated, but people they're following have
      // Ordered by highest reviewed (average rating) to lowest
      try {
        const currentUser = await User.findById(userId)
          .select("following")
          .lean()
          .exec();
        const friendIds = (currentUser?.following || []).map((id) => String(id));

        if (friendIds.length === 0) {
          rows = [];
        } else {
          // Get all reviews from friends (only Songs) with user information
          const friendReviews = await Review.find({
            userId: { $in: friendIds },
            targetType: "Song",
          })
            .populate("userId", "username name")
            .select("targetId rating userId")
            .lean()
            .exec();

          if (friendReviews.length === 0) {
            rows = [];
          } else {
            // Get current user's reviewed songs to filter them out
            const userReviews = await Review.find({
              userId,
              targetType: "Song",
            })
              .select("targetId")
              .lean()
              .exec();
            const userReviewedTargetIds = new Set(
              userReviews.map((r) => r.targetId)
            );

            // Group reviews by targetId and calculate average rating
            // Also track the friend with the highest rating for each song
            const songReviewMap = new Map();
            friendReviews.forEach((review) => {
              const targetId = review.targetId;
              // Skip songs the user has already reviewed
              if (userReviewedTargetIds.has(targetId)) {
                return;
              }

              if (!songReviewMap.has(targetId)) {
                songReviewMap.set(targetId, {
                  targetId,
                  ratings: [],
                  totalRating: 0,
                  count: 0,
                  topFriend: null, // Store friend with highest rating
                  topRating: -1,
                });
              }
              const entry = songReviewMap.get(targetId);
              entry.ratings.push(review.rating);
              entry.totalRating += review.rating;
              entry.count += 1;

              // Track friend with highest rating
              if (review.rating > entry.topRating && review.userId) {
                entry.topRating = review.rating;
                entry.topFriend = {
                  username: review.userId.username || "",
                  name: review.userId.name || review.userId.username || "",
                };
              }
            });

            // Convert to array and calculate average ratings
            const songsWithRatings = Array.from(songReviewMap.values()).map(
              (entry) => ({
                targetId: entry.targetId,
                avgRating: entry.totalRating / entry.count,
                count: entry.count,
                friend: entry.topFriend, // Include friend info
              })
            );

            // Sort by highest average rating to lowest
            songsWithRatings.sort((a, b) => b.avgRating - a.avgRating);

            // Get unique targetIds
            const targetIds = songsWithRatings.map((s) => s.targetId);

            if (targetIds.length === 0) {
              rows = [];
            } else {
              // Fetch song metadata and user's want list
              const [songs, user] = await Promise.all([
                Song.find({
                  spotifyId: { $in: targetIds },
                })
                  .lean()
                  .exec(),
                User.findById(userId).select("wantList").lean().exec(),
              ]);

              const wantList = Array.isArray(user?.wantList) ? user.wantList : [];
              const wantListSet = new Set(wantList);

              // Create a map for quick lookup
              const songMap = new Map(songs.map((s) => [s.spotifyId, s]));

              // Build rows maintaining the sorted order
              rows = songsWithRatings
                .map((songRating) => {
                  const song = songMap.get(songRating.targetId);
                  if (!song) return null;

                  return {
                    id: song._id,
                    spotifyId: song.spotifyId,
                    title: song.title || "Unknown",
                    artist: song.artist || "Unknown",
                    imageUrl: song.coverUrl || "",
                    tags: [],
                    score: songRating.avgRating.toFixed(1),
                    musicType: "Song",
                    bookmarked: wantListSet.has(song.spotifyId),
                    friendRating: songRating.friend
                      ? {
                          username: songRating.friend.username,
                          name: songRating.friend.name,
                        }
                      : null,
                  };
                })
                .filter((item) => item !== null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching friends recommendations:", error);
        rows = [];
      }
    } else {
      // For now, unsupported tabs return empty
      rows = [];
    }

    if (query) {
      rows = rows.filter((s) => {
        const hay = [s.title, s.artist, ...(s.tags || []), s.musicType || ""]
          .join(" ")
          .toLowerCase();
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
  } catch (error) {
    console.error("Error building lists:", error.message);
    res.status(500).json({ error: "Failed to load lists" });
  }
});

// --- Want-to-listen (bookmark) endpoints ---
app.post("/api/want", async (req, res) => {
  try {
    const userId = req.user.id;
    let { spotifyId, title, artist, musicType, imageUrl } = req.body;

    if (!spotifyId && title && artist && musicType) {
      spotifyId = `${musicType}-${artist}-${title}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
    }

    if (!spotifyId) {
      return res.status(400).json({ error: "spotifyId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure metadata is cached
    const normalizedType =
      (musicType || "Song").toLowerCase() === "album" ? "Album" : "Song";
    const targetData = {
      spotifyId,
      title,
      artist,
      coverUrl: imageUrl,
    };

    // If this item is already reviewed, don't keep it in wantList
    const slugBase = `${musicType || "Song"}-${artist}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const alreadyReviewed = await Review.findOne({
      userId,
      targetId: slugBase,
    })
      .lean()
      .exec();

    if (alreadyReviewed) {
      // Ensure it's removed from wantList if present
      user.wantList = (user.wantList || []).filter(
        (id) => id !== spotifyId && id !== slugBase
      );
      await user.save();
      return res.json({ ok: true, wantList: user.wantList });
    }

    if (normalizedType === "Song") {
      await Song.findOneAndUpdate({ spotifyId }, targetData, {
        new: true,
        upsert: true,
      });
    } else {
      await Album.findOneAndUpdate({ spotifyId }, targetData, {
        new: true,
        upsert: true,
      });
    }

    if (!Array.isArray(user.wantList)) {
      user.wantList = [];
    }

    if (!user.wantList.includes(spotifyId)) {
      user.wantList.push(spotifyId);
      await user.save();
    }

    res.json({ ok: true, wantList: user.wantList });
  } catch (error) {
    console.error("Error adding to want list:", error.message);
    res.status(500).json({ error: "Failed to update want list" });
  }
});

app.post("/api/want/remove", async (req, res) => {
  try {
    const userId = req.user.id;
    const { spotifyId } = req.body;

    if (!spotifyId) {
      return res.status(400).json({ error: "spotifyId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.wantList = (user.wantList || []).filter((id) => id !== spotifyId);
    await user.save();

    res.json({ ok: true, wantList: user.wantList });
  } catch (error) {
    console.error("Error removing from want list:", error.message);
    res.status(500).json({ error: "Failed to update want list" });
  }
});

// --- /api/tabs route ---
app.get("/api/tabs", async (req, res) => {
  try {
    const userId = req.user.id;

    const [listenedCount, user, reviews] = await Promise.all([
      Review.countDocuments({ userId }),
      User.findById(userId).select("wantList").lean().exec(),
      Review.find({ userId }).select("targetId").lean().exec(),
    ]);

    const wantList = Array.isArray(user?.wantList) ? user.wantList : [];
    const reviewedIdSet = new Set(reviews.map((r) => r.targetId));

    // To properly match, we need to look up Songs/Albums and generate targetIds
    let effectiveWantCount = 0;
    if (wantList.length > 0) {
      const [songs, albums] = await Promise.all([
        Song.find({ spotifyId: { $in: wantList } })
          .select("spotifyId title artist")
          .lean()
          .exec(),
        Album.find({ spotifyId: { $in: wantList } })
          .select("spotifyId title artist")
          .lean()
          .exec(),
      ]);

      const slugify = (type, artistName, titleName) =>
        `${type}-${artistName}-${titleName}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

      // Count how many wantList items correspond to unreviewed items
      effectiveWantCount = wantList.filter((id) => {
        // Check if this ID itself is reviewed (exact match)
        if (reviewedIdSet.has(id)) return false;

        // Look up the Song/Album to get the targetId and check if that's reviewed
        const song = songs.find((s) => s.spotifyId === id);
        if (song) {
          const targetId = slugify("Song", song.artist || "", song.title || "");
          return !reviewedIdSet.has(targetId);
        }

        const album = albums.find((a) => a.spotifyId === id);
        if (album) {
          const targetId = slugify(
            "Album",
            album.artist || "",
            album.title || ""
          );
          return !reviewedIdSet.has(targetId);
        }

        // If we can't find it in Songs/Albums, check if the ID itself matches a reviewed targetId
        // (it might already be in targetId format)
        return !reviewedIdSet.has(id);
      }).length;
    }

    const tabs = [
      { key: "listened", label: "Listened", count: listenedCount },
      { key: "want", label: "Want to listen", count: effectiveWantCount },
      { key: "recs", label: "Recs" },
      { key: "trending", label: "Trending" },
      { key: "recs from friends", label: "Recs from friends" },
      { key: "new releases", label: "New releases" },
    ];
    res.json(tabs);
  } catch (error) {
    console.error("Error building tabs:", error.message);
    res.status(500).json({ error: "Failed to load tabs" });
  }
});

app.get("/api/scores/:type/:artist/:title", async (req, res) => {
  const { type, artist, title } = req.params;
  const userId = req.user.id;

  const targetId = `${type}-${artist}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  try {
    const userReview = await Review.findOne({ userId, targetId });
    const isRated = !!userReview;

    let rank = "-";

    if (isRated) {
      const userReviews = await Review.find({
        userId,
        targetType: userReview.targetType,
      }).sort({ rating: -1 });

      const rankIndex = userReviews.findIndex((r) => r.targetId === targetId);
      rank = rankIndex !== -1 ? rankIndex + 1 : "?";
    }

    const userScore =
      userReview && userReview.rating !== undefined
        ? userReview.rating.toFixed(1)
        : "-";

    const currentUser = await User.findById(userId);
    const friendIds = currentUser ? currentUser.following : [];

    const friendReviews = await Review.find({
      targetId: targetId,
      userId: { $in: friendIds },
    });

    let friendScore = "-";
    let friendCount = 0;

    if (friendReviews.length > 0) {
      const total = friendReviews.reduce((sum, r) => sum + r.rating, 0);
      friendScore = (total / friendReviews.length).toFixed(1);
      friendCount = friendReviews.length;
    }

    const globalStats = await Review.aggregate([
      { $match: { targetId: targetId } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const globalScore =
      globalStats.length > 0 ? globalStats[0].avg.toFixed(1) : "-";
    const globalCount = globalStats.length > 0 ? globalStats[0].count : 0;

    let responseData = {};

    if (isRated) {
      responseData = {
        scores: [userScore, friendScore, globalScore],
        counts: ["You", friendCount, globalCount],
        scoreTitles: ["Your Musi Rating", "Friend Score", "User Score"],
        descriptions: [
          `#<strong>${rank}</strong> on your list of ${
            type === "Song" ? "songs" : "albums"
          }`,
          friendCount === 1
            ? `What <strong>1 friend</strong> thinks`
            : `What your <strong>${friendCount} friends</strong> think`,
          `Average score from <strong>${globalCount}</strong> users`,
        ],
      };
    } else {
      responseData = {
        scores: ["-", friendScore, globalScore],
        counts: [0, friendCount, globalCount],
        scoreTitles: ["Rec Score", "Friend Score", "User Score"],
        descriptions: [
          "How much we think <strong>you</strong> will like it",
          friendCount === 1
            ? `What <strong>1 friend</strong> thinks`
            : `What your <strong>${friendCount} friends</strong> think`,
          `Average score from <strong>${globalCount}</strong> users`,
        ],
      };
    }

    res.json(responseData);
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ---- SPOTIFY SEARCH (tracks + albums) ----
app.get("/api/search", async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    const query = (q || "").trim();
    if (!query) {
      return res.json([]);
    }

    const accessToken = await getSpotifyAccessToken();

    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: "track,album",
        limit: 20,
      },
    });

    const trackItems = response.data.tracks?.items || [];
    const albumItems = response.data.albums?.items || [];

    const user = await User.findById(userId).select("wantList").lean().exec();
    const wantList = Array.isArray(user?.wantList) ? user.wantList : [];

    // Filter out albums with only one track
    const validAlbums = albumItems.filter((a) => {
      // Spotify API includes total_tracks field in album objects
      const totalTracks = a.total_tracks || 0;
      return totalTracks > 1;
    });

    // Normalize to unified shape for frontend
    const results = [
      ...trackItems.map((t) => ({
        id: t.id,
        title: t.name,
        artist: t.artists?.map((a) => a.name).join(", ") || "",
        tags: t.album?.album_type ? [t.album.album_type] : [],
        score: null,
        musicType: "Song",
        imageUrl: t.album?.images?.[0]?.url || "",
        bookmarked: wantList.includes(t.id),
      })),
      ...validAlbums.map((a) => ({
        id: a.id,
        title: a.name,
        artist: a.artists?.map((ar) => ar.name).join(", ") || "",
        tags: a.album_type ? [a.album_type] : [],
        score: null,
        musicType: "Album",
        imageUrl: a.images?.[0]?.url || "",
        bookmarked: wantList.includes(a.id),
      })),
    ];

    res.json(results);
  } catch (error) {
    console.error(
      "Error searching Spotify:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to search Spotify" });
  }
});

// ---- USER SEARCH (by username or name) ----
app.get("/api/search/users", async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    const query = (q || "").trim();
    if (!query) {
      return res.json([]);
    }

    // Case-insensitive partial match on username or name
    // Exclude the current user from search results
    const regex = new RegExp(query, "i");

    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
      _id: { $ne: userId },
    })
      .limit(20)
      .select("username name profilePictureUrl avatarColor")
      .lean()
      .exec();

    const currentUser = await User.findById(userId)
      .select("followers following")
      .lean()
      .exec();

    const followingIds = new Set(
      (currentUser?.following || []).map((id) => String(id))
    );
    const followerIds = new Set(
      (currentUser?.followers || []).map((id) => String(id))
    );

    const results = users.map((u) => {
      const color = u.avatarColor || computeAvatarColor(u.username);
      const idStr = String(u._id);
      return {
        id: u._id,
        username: u.username,
        name: u.name || u.username,
        profilePictureUrl: u.profilePictureUrl || "",
        avatarColor: color,
        isFollowing: followingIds.has(idStr),
        isFollower: followerIds.has(idStr),
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// Helper function to calculate user rank based on review count
async function calculateUserRank(userId) {
  try {
    // Get review counts for all users
    const reviewCounts = await Review.aggregate([
      {
        $group: {
          _id: "$userId",
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    // Create a map of userId to reviewCount
    const countMap = new Map();
    reviewCounts.forEach((item) => {
      countMap.set(String(item._id), item.reviewCount);
    });

    // Get all users with their usernames and review counts
    const users = await User.find({}).select("_id username").lean().exec();

    // Add review counts to users and sort
    const usersWithCounts = users.map((user) => ({
      _id: user._id,
      username: user.username || "",
      reviewCount: countMap.get(String(user._id)) || 0,
    }));

    // Sort by review count descending, then alphabetically by username
    usersWithCounts.sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return (a.username || "").localeCompare(b.username || "");
    });

    // Find the user's position in the sorted list
    const userIndex = usersWithCounts.findIndex(
      (u) => String(u._id) === String(userId)
    );

    // Rank is 1-indexed, or null if user not found
    return userIndex !== -1 ? userIndex + 1 : null;
  } catch (error) {
    console.error("Error calculating user rank:", error);
    return null;
  }
}

// ---- PUBLIC USER PROFILE (by username, for other profiles) ----
app.get("/api/users/:username/profile", async (req, res) => {
  try {
    const rawUsername = req.params.username || "";
    const username = rawUsername.startsWith("@")
      ? rawUsername.slice(1)
      : rawUsername;

    const currentUserId = req.user?.id || null;

    const user = await User.findOne({ username })
      .select(
        "username name email bio dateJoined followers following currentStreak longestStreak totalLogins profilePictureUrl avatarColor wantList"
      )
      .populate([
        { path: "followers", select: "_id" },
        { path: "following", select: "_id" },
      ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followerIds = (user.followers || []).map((u) => String(u._id));
    const followingIds = (user.following || []).map((u) => String(u._id));

    const isFollowing =
      currentUserId != null && followerIds.includes(String(currentUserId));
    const isCurrentUser =
      currentUserId != null && String(user._id) === String(currentUserId);

    const memberSinceDate = user.dateJoined || user.createdAt;
    const memberSince = memberSinceDate
      ? memberSinceDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

    const color = user.avatarColor || computeAvatarColor(user.username || "");
    const rank = await calculateUserRank(user._id);

    // Get review count (listened)
    const listenedCount = await Review.countDocuments({ userId: user._id });

    // Get want list count (excluding items that are already reviewed)
    const wantList = Array.isArray(user.wantList) ? user.wantList : [];
    const reviewedIds = await Review.find({ userId: user._id })
      .select("targetId")
      .lean()
      .exec();
    const reviewedIdSet = new Set(reviewedIds.map((r) => r.targetId));

    // To properly match, we need to look up Songs/Albums and generate targetIds
    let wantCount = 0;
    if (wantList.length > 0) {
      const [songs, albums] = await Promise.all([
        Song.find({ spotifyId: { $in: wantList } })
          .select("spotifyId title artist")
          .lean()
          .exec(),
        Album.find({ spotifyId: { $in: wantList } })
          .select("spotifyId title artist")
          .lean()
          .exec(),
      ]);

      const slugify = (type, artistName, titleName) =>
        `${type}-${artistName}-${titleName}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

      // Count how many wantList items correspond to unreviewed items
      wantCount = wantList.filter((id) => {
        // Check if this ID itself is reviewed (exact match)
        if (reviewedIdSet.has(id)) return false;

        // Look up the Song/Album to get the targetId and check if that's reviewed
        const song = songs.find((s) => s.spotifyId === id);
        if (song) {
          const targetId = slugify("Song", song.artist || "", song.title || "");
          return !reviewedIdSet.has(targetId);
        }

        const album = albums.find((a) => a.spotifyId === id);
        if (album) {
          const targetId = slugify(
            "Album",
            album.artist || "",
            album.title || ""
          );
          return !reviewedIdSet.has(targetId);
        }

        // If we can't find it in Songs/Albums, check if the ID itself matches a reviewed targetId
        // (it might already be in targetId format)
        return !reviewedIdSet.has(id);
      }).length;
    }

    const profile = {
      id: user._id,
      name: user.name || user.username,
      username: user.username,
      bio: user.bio || "No bio yet",
      memberSince,
      followers: followerIds.length,
      following: followingIds.length,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalLogins: user.totalLogins || 0,
      isFollowing,
      isCurrentUser,
      profilePictureUrl: user.profilePictureUrl || "",
      avatarColor: color,
      dateJoined: memberSinceDate,
      rank: rank || 999, // Default to 999 if rank calculation fails
      listenedCount,
      wantCount,
    };

    // Build recent activity from real reviews
    const reviews = await Review.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    const songIds = reviews
      .filter((r) => r.targetType === "Song")
      .map((r) => r.targetId);
    const albumIds = reviews
      .filter((r) => r.targetType === "Album")
      .map((r) => r.targetId);

    const [songs, albums] = await Promise.all([
      songIds.length
        ? Song.find({ spotifyId: { $in: songIds } })
            .lean()
            .exec()
        : [],
      albumIds.length
        ? Album.find({ spotifyId: { $in: albumIds } })
            .lean()
            .exec()
        : [],
    ]);

    const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
    const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

    // Get current user's liked reviews
    const userLikedReviews = await Review.find({
      likes: currentUserId,
    })
      .select("_id")
      .lean()
      .exec();
    const likedReviewIds = new Set(userLikedReviews.map((r) => String(r._id)));

    const activity = reviews.map((r) => {
      const isSong = r.targetType === "Song";
      const meta = isSong
        ? songMap.get(r.targetId) || {}
        : albumMap.get(r.targetId) || {};

      const title = meta.title || "Unknown";
      const artist = meta.artist || "Unknown";
      const rating = typeof r.rating === "number" ? r.rating.toFixed(1) : "-";
      const imageUrl = meta.imageUrl || meta.coverUrl || "";

      const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();
      const time = createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const likesArray = Array.isArray(r.likes) ? r.likes : [];
      const likesCount = likesArray.length;
      const isLiked = likedReviewIds.has(String(r._id));

      return {
        id: r._id,
        user: user.name || user.username,
        username: user.username,
        userAvatar: user.profilePictureUrl || "",
        userAvatarColor:
          user.avatarColor || computeAvatarColor(user.username || ""),
        activity: "ranked",
        rating,
        time,
        review: r.text || "",
        likes: likesCount,
        bookmarks: 0,
        isLiked,
        artist,
        title,
        musicType: r.targetType,
        imageUrl,
      };
    });

    // Add taste data using the same function as /api/profile
    const taste = await generateTasteData(user._id, reviews, songs, songMap);

    res.json({ profile, activity, taste });
  } catch (error) {
    console.error("Error fetching public user profile:", error.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ---- FOLLOW / UNFOLLOW USER ----
app.post("/api/users/:id/follow", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add to following / followers (no duplicates)
    if (!currentUser.following.includes(targetUser._id)) {
      currentUser.following.push(targetUser._id);
    }
    if (!targetUser.followers.includes(currentUser._id)) {
      targetUser.followers.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ ok: true });
  } catch (error) {
    console.error("Error following user:", error.message);
    res.status(500).json({ error: "Failed to follow user" });
  }
});

app.post("/api/users/:id/unfollow", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ error: "Cannot unfollow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => String(id) !== String(targetUser._id)
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => String(id) !== String(currentUser._id)
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ ok: true });
  } catch (error) {
    console.error("Error unfollowing user:", error.message);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = "all" } = req.query; // 'all' or 'following'

    // Get review counts for all users
    const reviewCounts = await Review.aggregate([
      {
        $group: {
          _id: "$userId",
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    // Create a map of userId to reviewCount
    const countMap = new Map();
    reviewCounts.forEach((item) => {
      countMap.set(String(item._id), item.reviewCount);
    });

    // Get all users with their usernames and review counts
    let usersQuery = User.find({}).select(
      "_id username name profilePictureUrl avatarColor"
    );

    // If filtering by following, get users that the current user follows + the current user
    if (filter === "following") {
      const currentUser = await User.findById(userId)
        .select("following")
        .lean()
        .exec();
      const followingIds = (currentUser?.following || []).map((id) =>
        String(id)
      );
      // Include current user in the following list
      const userIdsToInclude = [...new Set([...followingIds, String(userId)])];
      if (userIdsToInclude.length === 0) {
        return res.json({ users: [], currentUserId: String(userId) });
      }
      usersQuery = User.find({ _id: { $in: userIdsToInclude } }).select(
        "_id username name profilePictureUrl avatarColor"
      );
    }

    // Get current user's username for highlighting
    const currentUserData = await User.findById(userId)
      .select("username")
      .lean()
      .exec();
    const currentUsername = currentUserData?.username || "";

    const users = await usersQuery.lean().exec();

    // Add review counts to users and sort
    const usersWithCounts = users.map((user) => ({
      _id: user._id,
      username: user.username || "",
      name: user.name || user.username || "",
      reviewCount: countMap.get(String(user._id)) || 0,
      profilePictureUrl: user.profilePictureUrl || "",
      avatarColor: user.avatarColor || computeAvatarColor(user.username || ""),
    }));

    // Sort by review count descending, then alphabetically by username
    usersWithCounts.sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return (a.username || "").localeCompare(b.username || "");
    });

    // Assign ranks (1-indexed)
    const usersWithRanks = usersWithCounts.map((user, index) => ({
      rank: index + 1,
      username: `@${user.username}`,
      score: user.reviewCount,
      name: user.name,
      profilePictureUrl: user.profilePictureUrl,
      avatarColor: user.avatarColor,
      isCurrentUser: user.username === currentUsername,
    }));

    res.json({ users: usersWithRanks, currentUsername: currentUsername });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get user-specific lists (listened, want, both)
app.get('/api/users/:username/lists', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const { tab = 'listened' } = req.query;
    const currentUserId = req.user.id;

    // Find the target user
    const targetUser = await User.findOne({ username })
      .select('_id username wantList')
      .lean()
      .exec();

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUserId = targetUser._id;
    let rows = [];

    if (tab === 'listened') {
      // All songs/albums the target user has reviewed
      const reviews = await Review.find({ userId: targetUserId })
        .sort({ rating: -1, createdAt: -1 })
        .lean()
        .exec();

      if (reviews.length) {
        const songIds = reviews
          .filter((r) => r.targetType === 'Song')
          .map((r) => r.targetId);
        const albumIds = reviews
          .filter((r) => r.targetType === 'Album')
          .map((r) => r.targetId);

        const [songs, albums] = await Promise.all([
          songIds.length
            ? Song.find({ spotifyId: { $in: songIds } })
                .lean()
                .exec()
            : [],
          albumIds.length
            ? Album.find({ spotifyId: { $in: albumIds } })
                .lean()
                .exec()
            : [],
        ]);

        const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
        const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

        rows = reviews.map((r) => {
          const isSong = r.targetType === 'Song';
          const meta = isSong
            ? songMap.get(r.targetId) || {}
            : albumMap.get(r.targetId) || {};

          return {
            id: r._id,
            spotifyId: meta.spotifyId || r.targetId,
            title: meta.title || 'Unknown',
            artist: meta.artist || 'Unknown',
            imageUrl: meta.imageUrl || meta.coverUrl || '',
            tags: [],
            score: typeof r.rating === 'number' ? r.rating.toFixed(1) : null,
            musicType: r.targetType,
            bookmarked: false,
          };
        });
      }
    } else if (tab === 'want') {
      // Songs/albums the target user bookmarked (want-to-listen)
      const wantIds = Array.isArray(targetUser.wantList) ? targetUser.wantList : [];

      if (wantIds.length) {
        const [songs, albums, reviews] = await Promise.all([
          Song.find({ spotifyId: { $in: wantIds } })
            .lean()
            .exec(),
          Album.find({ spotifyId: { $in: wantIds } })
            .lean()
            .exec(),
          Review.find({ userId: targetUserId }).select('targetId').lean().exec(),
        ]);

        const reviewedIds = new Set(reviews.map((r) => r.targetId));

        const slugify = (type, artistName, titleName) =>
          `${type}-${artistName}-${titleName}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');

        rows = [
          ...songs
            .filter(
              (s) =>
                !reviewedIds.has(slugify('Song', s.artist || '', s.title || ''))
            )
            .map((s) => ({
              id: s._id,
              spotifyId: s.spotifyId,
              title: s.title || 'Unknown',
              artist: s.artist || 'Unknown',
              imageUrl: s.imageUrl || s.coverUrl || '',
              tags: [],
              score: null,
              musicType: 'Song',
              bookmarked: false,
            })),
          ...albums
            .filter(
              (a) =>
                !reviewedIds.has(
                  slugify('Album', a.artist || '', a.title || '')
                )
            )
            .map((a) => ({
              id: a._id,
              spotifyId: a.spotifyId,
              title: a.title || 'Unknown',
              artist: a.artist || 'Unknown',
              imageUrl: a.imageUrl || a.coverUrl || '',
              tags: [],
              score: null,
              musicType: 'Album',
              bookmarked: false,
            })),
        ];
      }
    } else if (tab === 'both') {
      // Music both users have reviewed (intersection)
      const [currentUserReviews, targetUserReviews] = await Promise.all([
        Review.find({ userId: currentUserId })
          .select('targetId targetType rating')
          .lean()
          .exec(),
        Review.find({ userId: targetUserId })
          .select('targetId targetType rating')
          .lean()
          .exec(),
      ]);

      // Create sets of reviewed targetIds for both users
      const currentUserTargetIds = new Set(
        currentUserReviews.map((r) => `${r.targetType}-${r.targetId}`)
      );
      const targetUserTargetIds = new Set(
        targetUserReviews.map((r) => `${r.targetType}-${r.targetId}`)
      );

      // Find intersection
      const bothReviewed = targetUserReviews.filter((r) =>
        currentUserTargetIds.has(`${r.targetType}-${r.targetId}`)
      );

      if (bothReviewed.length) {
        const songIds = bothReviewed
          .filter((r) => r.targetType === 'Song')
          .map((r) => r.targetId);
        const albumIds = bothReviewed
          .filter((r) => r.targetType === 'Album')
          .map((r) => r.targetId);

        const [songs, albums] = await Promise.all([
          songIds.length
            ? Song.find({ spotifyId: { $in: songIds } })
                .lean()
                .exec()
            : [],
          albumIds.length
            ? Album.find({ spotifyId: { $in: albumIds } })
                .lean()
                .exec()
            : [],
        ]);

        const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
        const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

        // Create a map of current user's ratings for comparison
        const currentUserRatingMap = new Map(
          currentUserReviews.map((r) => [
            `${r.targetType}-${r.targetId}`,
            r.rating,
          ])
        );

        rows = bothReviewed.map((r) => {
          const isSong = r.targetType === 'Song';
          const meta = isSong
            ? songMap.get(r.targetId) || {}
            : albumMap.get(r.targetId) || {};

          const currentUserRating = currentUserRatingMap.get(
            `${r.targetType}-${r.targetId}`
          );

          return {
            id: r._id,
            spotifyId: meta.spotifyId || r.targetId,
            title: meta.title || 'Unknown',
            artist: meta.artist || 'Unknown',
            imageUrl: meta.imageUrl || meta.coverUrl || '',
            tags: [],
            score: typeof r.rating === 'number' ? r.rating.toFixed(1) : null,
            currentUserScore:
              typeof currentUserRating === 'number'
                ? currentUserRating.toFixed(1)
                : null,
            musicType: r.targetType,
            bookmarked: false,
          };
        });

        // Sort by target user's rating (highest first)
        rows.sort((a, b) => {
          const scoreA = parseFloat(a.score) || 0;
          const scoreB = parseFloat(b.score) || 0;
          return scoreB - scoreA;
        });
      }
    }

    // For 'both' tab, also return the count
    const response = { items: rows };
    if (tab === 'both') {
      response.count = rows.length;
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching user lists:', error);
    res.status(500).json({ error: 'Failed to fetch user lists' });
  }
});

app.get("/api/albumlist/:artist/:title", async (req, res) => {
  try {
    const { artist, title } = req.params;
    const userId = req.user.id;

    // Search for the album on Spotify
    const accessToken = await getSpotifyAccessToken();
    const searchQuery = `album:${title} artist:${artist}`;

    const spotifyResp = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: searchQuery,
        type: "album",
        limit: 1,
      },
    });

    const album = spotifyResp.data?.albums?.items?.[0];
    if (!album) {
      return res.json([]);
    }

    // Get album tracks
    const tracksResp = await axios.get(
      `https://api.spotify.com/v1/albums/${album.id}/tracks`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          limit: 50, // Get up to 50 tracks
        },
      }
    );

    const tracks = tracksResp.data?.items || [];

    // Get user's reviewed songs and want list
    const user = await User.findById(userId).select("wantList").lean().exec();
    const wantList = Array.isArray(user?.wantList) ? user.wantList : [];

    const reviews = await Review.find({ userId })
      .select("targetId rating")
      .lean()
      .exec();
    const reviewedIdSet = new Set(reviews.map((r) => r.targetId));
    const reviewMap = new Map(reviews.map((r) => [r.targetId, r.rating]));

    const slugify = (type, artistName, titleName) =>
      `${type}-${artistName}-${titleName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

    // Format tracks for frontend
    const songList = tracks.map((track, index) => {
      const trackTitle = track.name || "Unknown";
      const trackArtists =
        (track.artists || []).map((a) => a.name).join(", ") || artist;
      const targetId = slugify("Song", trackArtists, trackTitle);
      const isRated = reviewedIdSet.has(targetId);
      const score =
        isRated && reviewMap.has(targetId)
          ? parseFloat(reviewMap.get(targetId)).toFixed(1)
          : null;
      const spotifyId = track.id;
      const isBookmarked = wantList.includes(spotifyId);

      return {
        id: spotifyId || index + 1,
        spotifyId: spotifyId,
        title: trackTitle,
        artist: trackArtists,
        isRated,
        score: score || (Math.random() * 10).toFixed(1), // Keep random score for unrated songs for display
        isBookmarked,
        imageUrl: album.images?.[0]?.url || "",
      };
    });

    res.json(songList);
  } catch (error) {
    console.error(
      "Error fetching album tracks:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to fetch album tracks" });
  }
});

// ---- FEATURED LISTS (mock) ----
const FEATURED_LISTS = [
  {
    title: "Indie Vibes",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    tracks: [
      { id: 1, title: "Electric Feel", subtitle: "Song • MGMT" },
      { id: 2, title: "Time to Pretend", subtitle: "Song • MGMT" },
      { id: 3, title: "Kids", subtitle: "Song • MGMT" },
      { id: 4, title: "1901", subtitle: "Song • Phoenix" },
      { id: 5, title: "Lisztomania", subtitle: "Song • Phoenix" },
      { id: 6, title: "Sleepyhead", subtitle: "Song • Passion Pit" },
      {
        id: 7,
        title: "The Less I Know The Better",
        subtitle: "Song • Tame Impala",
      },
      { id: 8, title: "Feel It Still", subtitle: "Song • Portugal. The Man" },
    ],
  },
  {
    title: "Hip Hop Essentials",
    imageUrl:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
    tracks: [
      { id: 11, title: "Juicy", subtitle: "Song • The Notorious B.I.G." },
      { id: 12, title: "N.Y. State of Mind", subtitle: "Song • Nas" },
      { id: 13, title: "Shook Ones, Part II", subtitle: "Song • Mobb Deep" },
      {
        id: 14,
        title: "The Message",
        subtitle: "Song • Grandmaster Flash & The Furious Five",
      },
      { id: 15, title: "Straight Outta Compton", subtitle: "Song • N.W.A" },
      { id: 16, title: "Gin and Juice", subtitle: "Song • Snoop Dogg" },
      { id: 17, title: "California Love", subtitle: "Song • 2Pac, Dr. Dre" },
    ],
  },
  {
    title: "Chill Beats",
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
    tracks: [
      { id: 21, title: "Midnight City", subtitle: "Song • M83" },
      { id: 22, title: "Breathe Me", subtitle: "Song • Sia" },
      { id: 23, title: "Holocene", subtitle: "Song • Bon Iver" },
      { id: 24, title: "Skinny Love", subtitle: "Song • Bon Iver" },
      { id: 25, title: "The Night We Met", subtitle: "Song • Lord Huron" },
      { id: 26, title: "Lost in the Light", subtitle: "Song • Bahamas" },
      {
        id: 27,
        title: "Rivers and Roads",
        subtitle: "Song • The Head and the Heart",
      },
    ],
  },
  {
    title: "Rock Classics",
    imageUrl:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop",
    tracks: [
      { id: 31, title: "Bohemian Rhapsody", subtitle: "Song • Queen" },
      { id: 32, title: "Stairway to Heaven", subtitle: "Song • Led Zeppelin" },
      { id: 33, title: "Hotel California", subtitle: "Song • Eagles" },
      {
        id: 34,
        title: "Sweet Child O' Mine",
        subtitle: "Song • Guns N' Roses",
      },
      { id: 35, title: "Smells Like Teen Spirit", subtitle: "Song • Nirvana" },
      { id: 36, title: "Wonderwall", subtitle: "Song • Oasis" },
      { id: 37, title: "Don't Stop Believin'", subtitle: "Song • Journey" },
    ],
  },
  {
    title: "R&B Soul",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    tracks: [
      { id: 41, title: "Let's Stay Together", subtitle: "Song • Al Green" },
      { id: 42, title: "Ain't No Sunshine", subtitle: "Song • Bill Withers" },
      { id: 43, title: "What's Going On", subtitle: "Song • Marvin Gaye" },
      { id: 44, title: "I Want You Back", subtitle: "Song • The Jackson 5" },
      { id: 45, title: "Superstition", subtitle: "Song • Stevie Wonder" },
      { id: 46, title: "Respect", subtitle: "Song • Aretha Franklin" },
      { id: 47, title: "Let's Get It On", subtitle: "Song • Marvin Gaye" },
    ],
  },
];

app.get("/api/featured-lists", async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();

    // Fetch artwork from Spotify for each track
    const listsWithArtwork = await Promise.all(
      FEATURED_LISTS.map(async (list) => {
        const tracksWithArtwork = await Promise.all(
          list.tracks.map(async (track) => {
            // Parse artist and title from subtitle (format: "Song • Artist Name")
            const parts = track.subtitle?.split(" • ") || [];
            const musicType = parts[0] || "Song";
            const artist = parts.slice(1).join(" • ") || "";

            if (!artist || !track.title) {
              return { ...track, imageUrl: "" };
            }

            try {
              // Search Spotify for the track
              const searchQuery = `track:${track.title} artist:${artist}`;
              const spotifyResp = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                  params: {
                    q: searchQuery,
                    type: "track",
                    limit: 1,
                  },
                }
              );

              const spotifyItem = spotifyResp.data?.tracks?.items?.[0] || null;
              // Get album artwork from Spotify (for songs, use album.images)
              const imageUrl = spotifyItem?.album?.images?.[0]?.url || "";

              return { ...track, imageUrl };
            } catch (error) {
              console.error(
                `Error fetching artwork for ${track.title} by ${artist}:`,
                error.message
              );
              return { ...track, imageUrl: "" };
            }
          })
        );

        return { ...list, tracks: tracksWithArtwork };
      })
    );

    res.json(listsWithArtwork);
  } catch (error) {
    console.error("Error fetching featured lists with artwork:", error);
    // Fallback to original lists if there's an error
    res.json(FEATURED_LISTS);
  }
});

// ---- FEED DATA from DB (following or all users) ----
app.get("/api/feed", async (req, res) => {
  try {
    const userId = req.user.id;
    const { tab = "trending" } = req.query;

    const currentUser = await User.findById(userId).select(
      "following name username"
    );

    const hasFollowing =
      currentUser &&
      Array.isArray(currentUser.following) &&
      currentUser.following.length > 0;

    const baseQuery = hasFollowing
      ? { userId: { $in: currentUser.following } }
      : {};

    let sortOption;
    switch (tab) {
      case "new-releases":
        sortOption = { createdAt: -1 };
        break;
      case "friend-recs":
        sortOption = { createdAt: -1 };
        break;
      case "trending":
        // Fetch Spotify trending/popular tracks
        try {
          const accessToken = await getSpotifyAccessToken();

          // Use Spotify's Global Top 50 playlist
          const playlistId = "37i9dQZEVXbMDoHDwVN2tF"; // Global Top 50 playlist

          const spotifyResp = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: {
                limit: 30,
                market: "US",
              },
            }
          );

          const tracks = spotifyResp.data?.items || [];

          // Create Spotify trending items
          const spotifyItems = tracks.map((item) => {
            const track = item.track;
            return {
              id: `spotify-${track.id}`,
              spotifyId: track.id,
              user: "Spotify",
              username: "spotify",
              userAvatar: "",
              userAvatarColor: "#1DB954", // Spotify green
              activity: "trending on",
              title: track.name,
              artist: track.artists.map((a) => a.name).join(", "),
              rating: null, // No rating for Spotify suggestions
              time: "Trending now",
              review: `${track.album.name}`,
              likes: 0,
              isLiked: false,
              imageUrl: track.album.images?.[0]?.url || "",
              musicType: "Song",
              isSpotifyTrending: true, // Flag to identify Spotify items
            };
          });

          // Also get top rated user reviews
          const userReviews = await Review.find(baseQuery)
            .sort({ rating: -1, createdAt: -1 })
            .limit(20)
            .lean()
            .exec();

          // Process user reviews
          const reviewerIds = [...new Set(userReviews.map((r) => String(r.userId)))];
          const songIds = userReviews
            .filter((r) => r.targetType === "Song")
            .map((r) => r.targetId);
          const albumIds = userReviews
            .filter((r) => r.targetType === "Album")
            .map((r) => r.targetId);

          const [reviewers, songs, albums] = await Promise.all([
            User.find({ _id: { $in: reviewerIds } })
              .select("name username profilePictureUrl avatarColor")
              .lean()
              .exec(),
            songIds.length
              ? Song.find({ spotifyId: { $in: songIds } })
                  .lean()
                  .exec()
              : [],
            albumIds.length
              ? Album.find({ spotifyId: { $in: albumIds } })
                  .lean()
                  .exec()
              : [],
          ]);

          const userMap = new Map(reviewers.map((u) => [String(u._id), u]));
          const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
          const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

          const userLikedReviews = await Review.find({
            likes: userId,
          })
            .select("_id")
            .lean()
            .exec();
          const likedReviewIds = new Set(
            userLikedReviews.map((r) => String(r._id))
          );

          const userReviewItems = userReviews.map((r) => {
            const reviewer = userMap.get(String(r.userId)) || {};
            const isSong = r.targetType === "Song";
            const meta = isSong
              ? songMap.get(r.targetId) || {}
              : albumMap.get(r.targetId) || {};

            const title = meta.title || "Unknown";
            const artist = meta.artist || "Unknown";
            const rating = typeof r.rating === "number" ? r.rating.toFixed(1) : "-";

            const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();
            const time = createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            const color =
              reviewer.avatarColor || computeAvatarColor(reviewer.username || "");
            const likesArray = Array.isArray(r.likes) ? r.likes : [];
            const likesCount = likesArray.length;
            const isLiked = likedReviewIds.has(String(r._id));

            return {
              id: r._id,
              user: reviewer.name || reviewer.username || "Unknown",
              username: reviewer.username || "",
              userAvatar: reviewer.profilePictureUrl || "",
              userAvatarColor: color,
              activity: "ranked",
              rating,
              time,
              review: r.text || "",
              likes: likesCount,
              isLiked,
              title,
              artist,
              imageUrl: meta.coverUrl || "",
              musicType: r.targetType || "Song",
            };
          });

          // Combine Spotify trending with user reviews
          const allItems = [...spotifyItems, ...userReviewItems];

          return res.json({ tab, total: allItems.length, items: allItems });
        } catch (error) {
          console.error("Error fetching Spotify trending:", error);
          // Fall back to just user reviews
          sortOption = { rating: -1, createdAt: -1 };
        }
        break;
      default:
        sortOption = { rating: -1, createdAt: -1 };
        break;
    }

    const reviews = await Review.find(baseQuery)
      .sort(sortOption)
      .limit(50)
      .lean()
      .exec();

    if (!reviews.length) {
      return res.json({ tab, total: 0, items: [] });
    }

    const reviewerIds = [...new Set(reviews.map((r) => String(r.userId)))];
    const songIds = reviews
      .filter((r) => r.targetType === "Song")
      .map((r) => r.targetId);
    const albumIds = reviews
      .filter((r) => r.targetType === "Album")
      .map((r) => r.targetId);

    const [reviewers, songs, albums] = await Promise.all([
      User.find({ _id: { $in: reviewerIds } })
        .select("name username profilePictureUrl avatarColor")
        .lean()
        .exec(),
      songIds.length
        ? Song.find({ spotifyId: { $in: songIds } })
            .lean()
            .exec()
        : [],
      albumIds.length
        ? Album.find({ spotifyId: { $in: albumIds } })
            .lean()
            .exec()
        : [],
    ]);

    const userMap = new Map(reviewers.map((u) => [String(u._id), u]));
    const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
    const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

    // Get current user's liked reviews
    const userLikedReviews = await Review.find({
      likes: userId,
    })
      .select("_id")
      .lean()
      .exec();
    const likedReviewIds = new Set(userLikedReviews.map((r) => String(r._id)));

    const items = reviews.map((r) => {
      const reviewer = userMap.get(String(r.userId)) || {};
      const isSong = r.targetType === "Song";
      const meta = isSong
        ? songMap.get(r.targetId) || {}
        : albumMap.get(r.targetId) || {};

      const title = meta.title || "Unknown";
      const artist = meta.artist || "Unknown";
      const rating = typeof r.rating === "number" ? r.rating.toFixed(1) : "-";

      const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();
      const time = createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const color =
        reviewer.avatarColor || computeAvatarColor(reviewer.username || "");
      const likesArray = Array.isArray(r.likes) ? r.likes : [];
      const likesCount = likesArray.length;
      const isLiked = likedReviewIds.has(String(r._id));

      return {
        id: r._id,
        user: reviewer.name || reviewer.username || "Unknown",
        username: reviewer.username || "",
        userAvatar: reviewer.profilePictureUrl || "",
        userAvatarColor: color,
        activity: "ranked",
        rating,
        time,
        review: r.text || "",
        likes: likesCount,
        bookmarks: 0,
        isLiked,
        artist,
        title,
        musicType: r.targetType,
        imageUrl: meta.coverUrl || "",
      };
    });

    res.json({ tab, total: items.length, items });
  } catch (error) {
    console.error("Error building feed:", error.message);
    res.status(500).json({ error: "Failed to load feed" });
  }
});

// Like/unlike a review
app.post("/api/reviews/:reviewId/like", async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.reviewId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const likesArray = Array.isArray(review.likes) ? review.likes : [];
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = likesArray.some((id) => String(id) === String(userId));

    if (isLiked) {
      // Unlike: remove user from likes array
      review.likes = likesArray.filter((id) => String(id) !== String(userId));
    } else {
      // Like: add user to likes array
      review.likes = [...likesArray, userObjectId];
    }

    await review.save();

    res.json({
      ok: true,
      reviewId,
      isLiked: !isLiked,
      likesCount: review.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Legacy endpoint for feed (redirects to new endpoint)
app.post("/api/feed/:id/like", async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const likesArray = Array.isArray(review.likes) ? review.likes : [];
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = likesArray.some((id) => String(id) === String(userId));

    if (isLiked) {
      review.likes = likesArray.filter((id) => String(id) !== String(userId));
    } else {
      review.likes = [...likesArray, userObjectId];
    }

    await review.save();

    res.json({
      ok: true,
      reviewId,
      isLiked: !isLiked,
      likesCount: review.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Get users who liked a review
app.get("/api/reviews/:reviewId/likes", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const reviewId = req.params.reviewId;

    const review = await Review.findById(reviewId)
      .populate({
        path: "likes",
        select:
          "username name profilePictureUrl avatarColor followers following",
        populate: [
          { path: "followers", select: "_id" },
          { path: "following", select: "_id" },
        ],
      })
      .lean()
      .exec();

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const likedUsers = (review.likes || []).map((user) => {
      const followerIds = (user.followers || []).map((u) => String(u._id));
      const followingIds = (user.following || []).map((u) => String(u._id));

      const isFollowing = followerIds.includes(String(currentUserId));
      const isFollower = followingIds.includes(String(currentUserId));
      const isCurrentUser = String(user._id) === String(currentUserId);

      let followButtonText = "Follow";
      if (isCurrentUser) {
        followButtonText = null; // Don't show button for current user
      } else if (isFollowing) {
        followButtonText = "Following";
      } else if (isFollower) {
        followButtonText = "Follow back";
      }

      return {
        _id: user._id,
        username: user.username || "",
        name: user.name || user.username || "",
        profilePictureUrl: user.profilePictureUrl || "",
        avatarColor:
          user.avatarColor || computeAvatarColor(user.username || ""),
        isFollowing,
        isFollower,
        isCurrentUser,
        followButtonText,
      };
    });

    res.json({ users: likedUsers });
  } catch (error) {
    console.error("Error fetching review likes:", error);
    res.status(500).json({ error: "Failed to fetch review likes" });
  }
});

app.post("/api/onboarding", (req, res) => {
  const { answers } = req.body;

  console.log("Onboarding answers received:", answers);

  if (!answers) {
    return res.status(400).json({ error: "Onboarding answers are required" });
  }

  res.json({
    message: "Onboarding completed successfully",
    data: answers,
  });
});

// ===== HELPER FUNCTION FOR TASTE DATA =====

async function generateTasteData(userId, reviews, songs, songMap) {
  try {
    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken();

    // Genre counting
    const genreCounts = {};
    const artistsSet = new Set();

    // Get song reviews only (filter out albums)
    const songReviews = reviews.filter(r => r.targetType === 'Song');

    // Collect unique artists from reviewed songs (limit to reduce latency)
    const uniqueArtists = Array.from(
      new Set(
        songReviews
          .map(review => {
            const song = songMap.get(review.targetId);
            return song && song.artist ? song.artist : null;
          })
          .filter(Boolean)
      )
    ).slice(0, 10); // Limit external calls to 10 artists

    // Fetch artist genres in parallel
    const artistGenreResults = await Promise.all(
      uniqueArtists.map(async (artist) => {
        try {
          const artistSearchResp = await axios.get('https://api.spotify.com/v1/search', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              q: artist,
              type: 'artist',
              limit: 1,
            },
          });

          const artistData = artistSearchResp.data?.artists?.items?.[0];
          const genres = artistData?.genres || [];
          return { artist, genres };
        } catch (error) {
          console.error(`Error fetching artist data for ${artist}:`, error.message);
          return { artist, genres: [] };
        }
      })
    );

    // Count genres
    artistGenreResults.forEach(({ genres }) => {
      genres.forEach(genre => {
        const capitalizedGenre = genre
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        genreCounts[capitalizedGenre] = (genreCounts[capitalizedGenre] || 0) + 1;
      });
    });

    // Track total unique artists listened (based on reviews)
    uniqueArtists.forEach(a => artistsSet.add(a));

    // Calculate total genre count
    const totalGenres = Object.values(genreCounts).reduce((sum, count) => sum + count, 0);

    // Sort genres by count and get top 4
    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    // Calculate "Other" category
    const top4Count = sortedGenres.reduce((sum, [, count]) => sum + count, 0);
    const otherCount = totalGenres - top4Count;

    // Define colors for the pie chart
    const colors = ['#4A4A4A', '#C0C0C0', '#6B6B6B', '#E8E8E8', '#A8A8A8'];

    // Build genres array with percentages
    const genres = sortedGenres.map(([name, count], index) => ({
      name,
      value: totalGenres > 0 ? (count / totalGenres) * 100 : 0,
      color: colors[index]
    }));

    // Add "Other" category if there are more than 4 genres
    if (otherCount > 0) {
      genres.push({
        name: 'Other',
        value: totalGenres > 0 ? (otherCount / totalGenres) * 100 : 0,
        color: colors[4]
      });
    }

    // If no genres found, use placeholder
    if (genres.length === 0) {
      genres.push({ name: 'No Data', value: 100, color: '#E8E8E8' });
    }

    // Get top 5 rated songs
    const topRatedReviews = songReviews
      .filter(r => songMap.has(r.targetId))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    const topTracks = topRatedReviews.map((review, index) => {
      const song = songMap.get(review.targetId);
      return {
        id: review._id,
        title: song.title || 'Unknown',
        artist: song.artist || 'Unknown',
        tags: [], // Could enhance this with genres if needed
        score: parseFloat(review.rating.toFixed(1)),
        imageUrl: song.imageUrl || song.coverUrl || ''
      };
    });

    // If no top tracks, provide a placeholder
    if (topTracks.length === 0) {
      topTracks.push({ 
        id: 1, 
        title: "No ratings yet", 
        artist: "Start rating songs!", 
        tags: [], 
        score: 0 
      });
    }

    return {
      genres,
      topTracks,
      insights: {
        artistsListened: artistsSet.size,
        songsRated: songReviews.length
      }
    };

  } catch (error) {
    console.error('Error generating taste data:', error);
    // Return fallback data on error
    return {
      genres: [{ name: 'Error Loading', value: 100, color: '#E8E8E8' }],
      topTracks: [{ id: 1, title: "Error", artist: "Try again later", tags: [], score: 0 }],
      insights: {
        artistsListened: 0,
        songsRated: reviews.filter(r => r.targetType === 'Song').length
      }
    };
  }
}

// ===== PROFILE ROUTES - FETCH FROM MONGODB =====

// GET full profile bundle from MongoDB
app.get("/api/profile", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "username name")
      .populate("following", "username name");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate member since date
    const memberSince = new Date(
      user.dateJoined || user.createdAt
    ).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const color = user.avatarColor || computeAvatarColor(user.username || "");
    const rank = await calculateUserRank(userId);

    // Get review count (listened)
    const listenedCount = await Review.countDocuments({ userId });

    // Get want list count (excluding items that are already reviewed)
    const wantList = Array.isArray(user.wantList) ? user.wantList : [];
    const reviewedIds = await Review.find({ userId })
      .select("targetId")
      .lean()
      .exec();
    const reviewedIdSet = new Set(reviewedIds.map((r) => r.targetId));

    // To properly match, we need to look up Songs/Albums and generate targetIds
    let wantCount = 0;
    if (wantList.length > 0) {
      const [songs, albums] = await Promise.all([
        Song.find({ spotifyId: { $in: wantList } })
          .select("spotifyId title artist")
          .lean()
          .exec(),
        Album.find({ spotifyId: { $in: wantList } })
          .select("spotifyId title artist")
          .lean()
          .exec(),
      ]);

      const slugify = (type, artistName, titleName) =>
        `${type}-${artistName}-${titleName}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

      // Count how many wantList items correspond to unreviewed items
      wantCount = wantList.filter((id) => {
        // Check if this ID itself is reviewed (exact match)
        if (reviewedIdSet.has(id)) return false;

        // Look up the Song/Album to get the targetId and check if that's reviewed
        const song = songs.find((s) => s.spotifyId === id);
        if (song) {
          const targetId = slugify("Song", song.artist || "", song.title || "");
          return !reviewedIdSet.has(targetId);
        }

        const album = albums.find((a) => a.spotifyId === id);
        if (album) {
          const targetId = slugify(
            "Album",
            album.artist || "",
            album.title || ""
          );
          return !reviewedIdSet.has(targetId);
        }

        // If we can't find it in Songs/Albums, check if the ID itself matches a reviewed targetId
        // (it might already be in targetId format)
        return !reviewedIdSet.has(id);
      }).length;
    }

    const profile = {
      name: user.name || user.username,
      username: user.username,
      bio: user.bio || "No bio yet",
      memberSince: memberSince,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      rank: rank || 999, // Default to 999 if rank calculation fails
      streakDays: user.currentStreak || 0,
      listenedCount,
      wantCount,
      profilePictureUrl: user.profilePictureUrl || "",
      avatarColor: color,
    };

    // Build recent activity from real reviews
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    const songIds = reviews
      .filter((r) => r.targetType === "Song")
      .map((r) => r.targetId);
    const albumIds = reviews
      .filter((r) => r.targetType === "Album")
      .map((r) => r.targetId);

    const [songs, albums] = await Promise.all([
      songIds.length
        ? Song.find({ spotifyId: { $in: songIds } })
            .lean()
            .exec()
        : [],
      albumIds.length
        ? Album.find({ spotifyId: { $in: albumIds } })
            .lean()
            .exec()
        : [],
    ]);

    const songMap = new Map(songs.map((s) => [s.spotifyId, s]));
    const albumMap = new Map(albums.map((a) => [a.spotifyId, a]));

    // Get current user's liked reviews
    const userLikedReviews = await Review.find({
      likes: userId,
    })
      .select("_id")
      .lean()
      .exec();
    const likedReviewIds = new Set(userLikedReviews.map((r) => String(r._id)));

    const activity = reviews.map((r) => {
      const isSong = r.targetType === "Song";
      const meta = isSong
        ? songMap.get(r.targetId) || {}
        : albumMap.get(r.targetId) || {};

      const title = meta.title || "Unknown";
      const artist = meta.artist || "Unknown";
      const rating = typeof r.rating === "number" ? r.rating.toFixed(1) : "-";
      const imageUrl = meta.imageUrl || meta.coverUrl || "";

      const createdAt = r.createdAt ? new Date(r.createdAt) : new Date();
      const time = createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const likesArray = Array.isArray(r.likes) ? r.likes : [];
      const likesCount = likesArray.length;
      const isLiked = likedReviewIds.has(String(r._id));

      return {
        id: r._id,
        user: user.name || user.username,
        username: user.username,
        userAvatar: user.profilePictureUrl || "",
        userAvatarColor:
          user.avatarColor || computeAvatarColor(user.username || ""),
        activity: "ranked",
        rating,
        time,
        review: r.text || "",
        likes: likesCount,
        bookmarks: 0,
        isLiked,
        artist,
        title,
        musicType: r.targetType,
        imageUrl,
      };
    });

    // Real taste data from Spotify and user reviews
    const taste = await generateTasteData(userId, reviews, songs, songMap);

    res.json({
      profile,
      activity,
      taste,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT partial update (name, username, bio)
app.put("/api/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update allowed fields
    if (name !== undefined && name.trim()) {
      user.name = name.trim();
    }

    if (username !== undefined && username.trim()) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({
        username: username.trim(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      user.username = username.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    // Return updated profile
    const memberSince = new Date(
      user.dateJoined || user.createdAt
    ).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const profile = {
      name: user.name || user.username,
      username: user.username,
      bio: user.bio || "No bio yet",
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
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PUT profile picture (expects base64 data URL or image URL)
app.put("/api/profile/photo", async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageData } = req.body;

    if (!imageData || typeof imageData !== "string") {
      return res.status(400).json({ error: "imageData is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.profilePictureUrl = imageData;
    await user.save();

    res.json({
      ok: true,
      profilePictureUrl: user.profilePictureUrl,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error.message);
    res.status(500).json({ error: "Failed to update profile picture" });
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
    musicType: "Song",
  },
];

// POST like toggle on activity item (legacy endpoint, redirects to new endpoint)
app.post("/api/profile/activity/:id/like", async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const likesArray = Array.isArray(review.likes) ? review.likes : [];
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = likesArray.some((id) => String(id) === String(userId));

    if (isLiked) {
      review.likes = likesArray.filter((id) => String(id) !== String(userId));
    } else {
      review.likes = [...likesArray, userObjectId];
    }

    await review.save();

    res.json({
      ok: true,
      id: reviewId,
      isLiked: !isLiked,
      likesCount: review.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

app.delete("/api/profile", async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    await Review.deleteMany({ userId: userId });

    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
    lastActivity: new Date().toISOString().split("T")[0], // Today's date
    listenedCount: 89,
    wantCount: 23,
  },
  streakHistory: [
    { date: "2024-11-11", activity: "listened" },
    { date: "2024-11-10", activity: "listened" },
    { date: "2024-11-09", activity: "listened" },
    { date: "2024-11-08", activity: "listened" },
    { date: "2024-11-07", activity: "listened" },
    { date: "2024-11-06", activity: "listened" },
    { date: "2024-11-05", activity: "listened" },
  ],
};

function calculateCurrentStreak(streakHistory) {
  if (!streakHistory || streakHistory.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const sortedHistory = streakHistory.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  let currentDate = new Date(today);

  for (const record of sortedHistory) {
    const recordDate = record.date;
    const expectedDate = currentDate.toISOString().split("T")[0];

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
app.get("/api/streak", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "currentStreak longestStreak lastLoginDate totalLogins"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastLoginDate: user.lastLoginDate,
      totalLogins: user.totalLogins || 0,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    res.status(500).json({ error: "Failed to fetch streak data" });
  }
});

// POST activity to update streak
app.post("/api/streak/activity", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update streak
    const streakUpdate = user.updateStreak();
    await user.save();

    res.json({
      message: "Activity recorded successfully",
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakUpdate: streakUpdate,
    });
  } catch (error) {
    console.error("Error recording activity:", error);
    res.status(500).json({ error: "Failed to record activity" });
  }
});

app.use("/api/reviews", require("./routes/reviews"));

app.get("/api/friendscores/:type/:artist/:title", async (req, res) => {
  const { type, artist, title } = req.params;
  const userId = req.user.id;

  const targetId = `${type}-${artist}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  try {
    const currentUser = await User.findById(userId);
    const friendIds = currentUser ? currentUser.following : [];

    if (friendIds.length === 0) {
      return res.json([]);
    }

    const friendReviews = await Review.find({
      targetId: targetId,
      userId: { $in: friendIds },
    })
      .populate("userId", "name username profilePictureUrl")
      .sort({ rating: -1 });

    // 4. Map to Frontend Format
    const friendScores = friendReviews
      .map((review) => {
        if (!review.userId) return null;
        return {
          id: review.userId._id,
          name: review.userId.name || "Unknown",
          handle: `@${review.userId.username}`,
          score: review.rating.toFixed(1),
          rating: review.ratingIndex, // 0, 1, or 2 (Circle Color)
          imgUrl: review.userId.profilePictureUrl || "", // Placeholder for now
        };
      })
      .filter((item) => item !== null);

    res.json(friendScores);
  } catch (err) {
    console.error("Error fetching friend scores:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = app;
