const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ============================
    USER
============================ */
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: String,
    dateJoined: { type: Date, default: Date.now },

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],

    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });


/* ============================
    SONG
============================ */
const songSchema = new Schema(
  {
    spotifyId: { type: String, required: true, unique: true },

    // Cached Spotify metadata
    title: String,
    artist: String,
    albumName: String,
    coverUrl: String,
    durationMs: Number,
    previewUrl: String,

    albumId: { type: Schema.Types.ObjectId, ref: "Album" },

    // Reference to reviews
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],

    lastSyncedAt: Date
  },
  { timestamps: true }
);

songSchema.index({ spotifyId: 1 }, { unique: true });


/* ============================
    ALBUM
============================ */
const albumSchema = new Schema(
  {
    spotifyId: { type: String, required: true, unique: true },

    // Cached metadata
    title: String,
    artist: String,
    coverUrl: String,
    releaseDate: String,

    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    lastSyncedAt: Date
  },
  { timestamps: true }
);

albumSchema.index({ spotifyId: 1 }, { unique: true });


/* ============================
    REVIEW
============================ */
const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    targetType: {
      type: String,
      enum: ["song", "album"],
      required: true
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      // dynamic ref depending on targetType
      refPath: "targetType"
    },

    rating: { type: Number, min: 0, max: 5 },
    text: String
  },
  { timestamps: true }
);

reviewSchema.index({ targetType: 1, targetId: 1 });


/* ============================
    LIST
============================ */
const listSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,

    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    songIds: [{ type: Schema.Types.ObjectId, ref: "Song" }],

    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);


/* ============================
    EXPORT MODELS
============================ */
const User = mongoose.model("User", userSchema);
const Song = mongoose.model("Song", songSchema);
const Album = mongoose.model("Album", albumSchema);
const Review = mongoose.model("Review", reviewSchema);
const List = mongoose.model("List", listSchema);

module.exports = {
  User,
  Song,
  Album,
  Review,
  List
};
