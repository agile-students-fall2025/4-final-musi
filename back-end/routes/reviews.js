const express = require('express');
const router = express.Router();
const { Review, Song, Album } = require('../models'); 
const auth = require('../middleware/auth');

router.get('/my-list', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let type = req.query.type || 'Song';
    
    const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    const reviews = await Review.find({ userId, targetType: normalizedType })
      .populate('targetId') 
      .sort({ rating: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/rate-ranked', auth, async (req, res) => {
  const { 
    targetId,      
    targetType,    
    rankIndex,     
    reviewText, 
    ratingIndex,
    title,
    artist,
    imageUrl
  } = req.body; 
  
  try {
    const userId = req.user.id;
    
    const normalizedType = targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase();
    
    let dbTarget;
    const targetData = { 
        spotifyId: targetId, 
        title, 
        artist, 
        imageUrl 
    };

    if (normalizedType === 'Song') {
        dbTarget = await Song.findOneAndUpdate(
            { spotifyId: targetId }, 
            targetData, 
            { new: true, upsert: true }
        );
    } else {
        dbTarget = await Album.findOneAndUpdate(
            { spotifyId: targetId }, 
            targetData, 
            { new: true, upsert: true }
        );
    }

    let reviews = await Review.find({ userId, targetType: normalizedType })
      .sort({ rating: -1 });

    let newReview = await Review.findOne({ userId, targetId: dbTarget._id });
    
    if (!newReview) {
      newReview = new Review({
        userId,
        targetType: normalizedType,
        targetId: dbTarget._id,
        text: reviewText || "",
        ratingIndex: ratingIndex || 0,
        rating: 0
      });
    } else {
        newReview.text = reviewText;
        newReview.ratingIndex = ratingIndex;
    }

    reviews = reviews.filter(r => r.targetId.toString() !== dbTarget._id.toString());
    
    const safeIndex = Math.min(rankIndex, reviews.length);
    reviews.splice(safeIndex, 0, newReview);

    const totalItems = reviews.length;
    
    const updatePromises = reviews.map((review, index) => {
      let newScore;
      if (totalItems === 1) {
        newScore = 10.0;
      } else {
        const step = 10 / (totalItems - 1 || 1); 
        newScore = 10 - (index * step);
      }

      review.rating = parseFloat(newScore.toFixed(2));
      return review.save();
    });

    await Promise.all(updatePromises);

    res.json({ 
      msg: "Ranking updated", 
      rank: safeIndex + 1, 
      score: newReview.rating,
      type: normalizedType
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;