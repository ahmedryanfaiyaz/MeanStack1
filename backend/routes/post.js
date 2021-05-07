const express = require('express');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const postController = require('../controllers/post');

const router = express.Router();



// GET
router.get('/', postController.getMultiplePost);
router.get('/:id', postController.getSinglePost);
// POST
router.post('/', checkAuth, extractFile, postController.createPost);
// PUT
router.put('/:id', checkAuth, extractFile, postController.editPost);
// DELETE
router.delete('/:id', checkAuth, postController.deletePost);


module.exports = router;
