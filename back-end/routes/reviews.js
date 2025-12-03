const express = require('express');
const router = express.Router();
const { Review, Song, Album, User } = require('../models'); 
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
    imageUrl,
    spotifyId
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
        coverUrl: imageUrl 
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

    // Remove from want list if present (handle different ID formats)
    try {
      const user = await User.findById(userId);
      if (user && Array.isArray(user.wantList) && user.wantList.length > 0) {
        const originalLength = user.wantList.length;
        
        // Normalize the targetId for comparison
        const normalizedTargetId = targetId.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Also look up Songs/Albums to find matching spotifyIds
        // (Song and Album are already imported at the top)
        const [songs, albums] = await Promise.all([
          Song.find({ spotifyId: { $in: user.wantList } }).select('spotifyId title artist').lean().exec(),
          Album.find({ spotifyId: { $in: user.wantList } }).select('spotifyId title artist').lean().exec(),
        ]);
        
        const slugify = (type, artistName, titleName) =>
          `${type}-${artistName}-${titleName}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');
        
        // Remove items that match:
        // 1. Exact match with targetId
        // 2. Exact match with spotifyId (if provided)
        // 3. Normalized match (handles different formatting)
        // 4. Match via Song/Album lookup (generate targetId from stored metadata)
        user.wantList = user.wantList.filter((id) => {
          // Exact match with targetId
          if (id === targetId) return false;
          
          // Exact match with spotifyId (if provided)
          if (spotifyId && id === spotifyId) return false;
          
          // Normalized match (handles different formatting)
          const normalizedId = (id || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
          if (normalizedId === normalizedTargetId) return false;
          
          // Check if this spotifyId corresponds to the same song/album via metadata
          const song = songs.find((s) => s.spotifyId === id);
          if (song) {
            const songTargetId = slugify('Song', song.artist || '', song.title || '');
            if (songTargetId === targetId || songTargetId === normalizedTargetId) return false;
          }
          
          const album = albums.find((a) => a.spotifyId === id);
          if (album) {
            const albumTargetId = slugify('Album', album.artist || '', album.title || '');
            if (albumTargetId === targetId || albumTargetId === normalizedTargetId) return false;
          }
          
          return true; // Keep this item
        });
        
        // Only save if something was actually removed
        if (user.wantList.length < originalLength) {
          await user.save();
        }
      }
    } catch (wantListError) {
      // Don't fail the review creation if want list removal fails
      console.error('Error removing from want list:', wantListError);
    }

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

// PATCH update a review's text (only by owner)
router.patch('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    const review = await Review.findOne({ _id: req.params.id, userId });
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    review.text = text || '';
    await review.save();

    res.json({ ok: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE a review (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const review = await Review.findOne({ _id: req.params.id, userId });

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    await Review.deleteOne({ _id: review._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;