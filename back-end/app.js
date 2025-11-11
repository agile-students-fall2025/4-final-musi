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

module.exports = app