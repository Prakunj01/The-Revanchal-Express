const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
// const mainControllers = require('../controllers/mainControllers');
const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const fs = require("fs");

// 
const mongoose = require("mongoose");
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// for program ------------------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
  },
});

const upload = multer({ storage }).single("image");
// for image


/**
 * 
 * If diect Login ------------------------------------------------------------------------------------
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}


/**
 * GET /
 * Admin - Login Page -------------------------------------------------------------------------------------
*/
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


/**
 * POST /
 * Admin - Check Login -----------------------------------------------------------------------------------
*/
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /
 * Admin Dashboard -----------------------------------------------------------------------------------
*/
router.get('/dashboard', upload, authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

// ========================================================================
// ===========================================================================




/**
 * GET /
 * Admin - Add New Post ---------------------------------------------------------------------------------------
*/
router.get('/add-post', authMiddleware, upload, async (req, res) => {
  try {
    const categories = ['Policies', 'College', 'Article-Ayurvedic', 'Article-MBBS','Article-Agriculture','Article-Engineering', 'Technology','Governance','Laws','Art&Culture','Tourism','Jobs', 'Other'];

    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      categories ,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * POST /
 * Admin - Add New Post 
*/
router.post('/add-post', authMiddleware, upload, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        categorys: req.body.category,
        title: req.body.title,
        body: req.body.body,
        autherName: req.body.autherName,
        image: req.file.filename,
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});
// * Admin - Add New Post ---------------------------------------------------------------------------------------


/**
 * GET /
 * Admin - Edit Post-------------------------------------------------------------------------------------------
*/
router.get('/edit-post/:id', authMiddleware, upload, async (req, res) => {
  try {

    const categorys = ['Policies', 'College', 'Article-Ayurvedic', 'Article-MBBS','Article-Agriculture','Article-Engineering', 'Technology','Governance','Laws','Art&Culture','Tourism','Jobs', 'Other'];

    const locals = {
      title: 'Edit Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', {
      locals,
      data,
      categorys ,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

// 2 ============================================================================

router.post('/edit-post/:id', authMiddleware, upload, async (req, res) => {
  try {
    let id = req.params.id;
    let new_image = '';
    // let oldImagePath = '';
  const oldImagePath = req.body.old_image;


    if (req.file) {
      // If a new image is uploaded, replace the old image
      new_image = req.file.filename;
      // Delete the old image file
      try {
        fs.unlinkSync('./public/uploads/'+ oldImagePath);
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    } else {
      new_image = req.body.old_image;

    }

    const updatedPost = await Post.findByIdAndUpdate(id, {
      categorys: req.body.category,
      title: req.body.title,
      body: req.body.body,
      autherName: req.body.autherName,
      image: new_image,
      updatedAt: Date.now()
    }, { new: true });

    if (updatedPost) {
      req.session.message = {
        type: 'success',
        message: "Data Updated"
      };
      res.redirect('/dashboard'); // Redirect after successful update
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin - Edit Post-------------------------------------------------------------------------------------------   

// Admin - Edit Post-------------------------------------------------------------------------------------------




/**
 * POST /
 * Admin - Register -----------------------------------------------------------------------------------
*/
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }

  } catch (error) {
    console.log(error);
  }
});


/**
 * DELETE /
 * Admin - Delete Post-----------------------------------------------------------------------------
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  const post = await Post.findById(req.params.id);
  // req.body.old_image
  const imagePath = req.body.post.image;
  // const imagePath =  './public/uploads/', imagePath;


  try {
    if (post.image != "") {
      
    try{
        // fs.unlinkSync(imagePath);
        fs.unlinkSync('./public/uploads/'+ imagePath);

    }catch(err){
      console.log(err);
      console.log("Image not deteted");
    }
    }

    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * GET /
 * Admin Logout-----------------------------------------------------------------------------------------
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/admin');
});


module.exports = router;