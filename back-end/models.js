const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

/* ============================
    USER
============================ */
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, "Please fill a valid email address"]},
    password: { type: String, required: true },
    dateJoined: { type: Date, default: Date.now },
    bio: { type: String, default: "" },

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],

    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    wantList: [{ type: String, default: [] }], // array of spotifyIds for want-to-listen
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },
    totalLogins: { type: Number, default: 0 },
    profilePictureUrl: { type: String, default: "" },
    avatarColor: { type: String, default: "" }
  },
  { timestamps: true }
);

function computeAvatarColor(username = "") {
  const clean = username.replace(/^@/, "") || "user";
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const saturation = 65;
  const lightness = 55;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (!this.avatarColor && this.username) {
    this.avatarColor = computeAvatarColor(this.username);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ===== STREAK METHOD =====
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If no last login, start streak at 1
  if (!this.lastLoginDate) {
    this.currentStreak = 1;
    this.longestStreak = 1;
    this.lastLoginDate = today;
    this.totalLogins = 1;
    return { streakIncreased: true, newStreak: true };
  }

  const lastLogin = new Date(this.lastLoginDate);
  const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  
  const daysDifference = Math.floor((today - lastLoginDay) / (1000 * 60 * 60 * 24));

  // Same day - don't update streak
  if (daysDifference === 0) {
    return { streakIncreased: false, sameDay: true };
  }

  // Consecutive day - increment streak
  if (daysDifference === 1) {
    this.currentStreak += 1;
    this.lastLoginDate = today;
    this.totalLogins += 1;

    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    
    return { streakIncreased: true, consecutive: true };
  } 
  
  // Missed days - reset streak
  if (daysDifference > 1) {
    this.currentStreak = 1;
    this.lastLoginDate = today;
    this.totalLogins += 1;
    
    return { streakIncreased: false, streakBroken: true };
  }
};

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


/* ============================
    REVIEW
============================ */
const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    targetType: {
      type: String,
      enum: ["Song", "Album"],
      required: true
    },

    targetId: {
      type: String,
      required: true,
      // dynamic ref depending on targetType
      refPath: "targetType"
    },

    rating: { type: Number, min: 0, max: 10 },
    ratingIndex: { type: Number, enum: [0, 1, 2], default: 0 }, // 0: Liked, 1: Fine, 2: Disliked
    text: String,
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }] // Array of user IDs who liked this review
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