const mongoose = require("mongoose");

const Post = require('../models/post');


module.exports.createPost = (req, res) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save()
    .then(createdPost => {
      res.status(201).json({
        message: 'post added successfully...',
        post: {
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath
        }
      });
    })
    .catch(() => {
      res.status(500).json({
        message: 'Creating a post failed!'
      })
    });
}

module.exports.editPost = (req, res) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({message: 'Update successful!'});
      } else {
        res.status(401).json({ message: 'Not authorized!'});
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'Couldn\'t update a post!'
      })
    });
};

module.exports.deletePost = (req, res) => {
  const postId = mongoose.Types.ObjectId(req.params.id);
  Post.deleteOne({_id: postId, creator: req.userData.userId})
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({message: 'Delete successful!'});
      } else {
        res.status(401).json({ message: 'Not authorized!'});
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'Couldn\'t delete a post!'
      })
    });
};

module.exports.getSinglePost = (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post not found!'});
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'Fetching a post failed!'
      })
    });
};

module.exports.getMultiplePost = (req, res) => {
  const pageSize = + req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(() => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      })
    });
};
