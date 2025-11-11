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
module.exports = app