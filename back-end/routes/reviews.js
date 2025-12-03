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
      .sort({ rating: -1 });

    const targetIds = reviews.map(r => r.targetId);
    let metadataList = [];

    if (normalizedType === 'Song') {
        metadataList = await Song.find({ spotifyId: { $in: targetIds } });
    } else {
        metadataList = await Album.find({ spotifyId: { $in: targetIds } });
    }

    const populatedReviews = reviews.map(review => {
        const meta = metadataList.find(m => m.spotifyId === review.targetId);
        
        return {
            ...review.toObject(),
            targetId: meta || { title: "Unknown", artist: "Unknown" } 
        };
    });

    res.json(populatedReviews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/rate-ranked', auth, async (req, res) => {
  const { 
    targetType,    
    rankIndex,     
    reviewText, 
    ratingIndex,
    title,
    artist,
    imageUrl
  } = req.body; 
  
  const targetId = `${targetType}-${artist}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

  try {
    const userId = req.user.id;
    
    const normalizedType = targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase();
    
    const targetData = { 
        spotifyId: targetId, 
        title, 
        artist, 
        imageUrl 
    };

    if (normalizedType === 'Song') {
        await Song.findOneAndUpdate(
            { spotifyId: targetId }, 
            targetData, 
            { new: true, upsert: true }
        );
    } else {
        await Album.findOneAndUpdate(
            { spotifyId: targetId }, 
            targetData, 
            { new: true, upsert: true }
        );
    }

    let reviews = await Review.find({ userId, targetType: normalizedType })
      .sort({ rating: -1 });

    let newReview = await Review.findOne({ userId, targetId: targetId });
    
    if (!newReview) {
      newReview = new Review({
        userId,
        targetType: normalizedType,
        targetId: targetId, 
        text: reviewText || "",
        ratingIndex: ratingIndex || 0,
        rating: 0,
      });
    } else {
        newReview.text = reviewText;
        newReview.ratingIndex = ratingIndex;
    }

    reviews = reviews.filter(r => r.targetId.toString() !== targetId);
    
    const safeIndex = Math.min(rankIndex, reviews.length);
    reviews.splice(safeIndex, 0, newReview);

    const totalItems = reviews.length;
    
    const updatePromises = reviews.map((review, index) => {
      let newScore;
      if (totalItems === 1) {
        newScore = 10.0;
      } else {
        const step = 9.9 / (totalItems - 1 || 1); 
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