const express = require('express');
const communityPostController = require('../controllers/CommunityPost.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────────
// Anyone can browse the community feed
router.get('/', communityPostController.getAllPosts);
router.get('/:id', communityPostController.getPost);

// ─── PROTECTED ROUTES ───────────────────────────────────────────────────────────
// Creating, updating, and deleting posts requires authentication
router.use(protect);

router.post('/', communityPostController.createPost);
router.patch('/:id', communityPostController.updatePost);
router.delete('/:id', communityPostController.deletePost);

module.exports = router;
