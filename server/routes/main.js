const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
// const newsr = require('../newsr');

/**
 * GET /
 * HOME
*/
router.get('', async (req, res) => {
  try {
    const locals = {
      title: "मध्य प्रदेश ताज़ा ख़बरें",
      description: ""
    }

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
  }

});


// ---------------------------------------category route

// router.get('/category/college', async (req, res) => {
//   try {
//     let perPage = 10;
//     let page = req.query.page || 1;

//     // Fetch posts where the category is "college" from the database with pagination
//     const posts = await Post.find({ category: 'college' })
//       .sort({ createdAt: -1 }) // Sort by createdAt in descending order
//       .skip(perPage * page - perPage)
//       .limit(perPage)
//       .exec();

//     console.log(posts); // Log the fetched data to the console

//     res.render('collegeCategory', { posts });

//   } catch (error) {
//     // Handle any errors that occur during the database query
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });




// router.get('', async (req, res) => {
//   const locals = {
//     title: "NodeJs Blog",
//     description: "Simple Blog created with NodeJs, Express & MongoDb."
//   }

//   try {
//     const data = await Post.find();
//     res.render('index', { locals, data });
//   } catch (error) {
//     console.log(error);
//   }

// });


/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const imageUrl = `/uploads/${data.image}`;

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
      imageUrl: imageUrl,
    }

    res.render('post', {
      locals,
      data,
      imageUrl,
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.log(error);
  }

});


/**
 * POST /
 * Post - searchTerm
*/
// router.post('/search', async (req, res) => {
//   try {
//     const locals = {
//       title: "Seach",
//       description: "Simple Blog created with NodeJs, Express & MongoDb."
//     }

//     let searchTerm = req.body.searchTerm;
//     const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

//     const data = await Post.find({
//       $or: [
//         { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
//         { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
//       ]
//     });

//     res.render("search", {
//       data,
//       locals,
//       currentRoute: '/'
//     });

//   } catch (error) {
//     console.log(error);
//   }

// });

router.post('/search', async (req, res) => {
  const search = req.body.search
  console.log(req.body.search)
  try {
    var url = `http://newsapi.org/v2/everything?q=${search}&apiKey=12a46a6621974f289fedbbf8ee234654`

    const news_get = await axios.get(url)
    res.render('apinews/news', { articles: news_get.data.articles, currentRoute })
  } catch (error) {
    if (error.response) {
      console.log(error)
    }

  }
})


/**
 * GET /
 * About
*/
// routes/articleRoutes.js
// ----------------------------------------------------------------------------------------
// router.get('/category', async (req, res) => {
//   const data = await Post.find({category: req.query.category});

//   try {
//     // Fetch articles for the selected category from the database
//     const articles = await Article.find({ category: selectedCategory });

//     // Render the article page with the fetched articles
//     res.render('category', { 
//       category: selectedCategory, 
//       articles, 
//       currentRoute: `/category/${selectedCategory}` 
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });
// ----------------------------------------------------------------------------------------



/**
 * GET /
 * category/Dynamic
*/
router.get('/category/:category', async (req, res) => {
  
  try {
    let perPage = 10;
    let page = req.query.page || 1;
    const category = req.params.category;
    console.log(category);
    // Fetch posts where the category is "college" from the database with pagination
    // const posts = await Post.find({ category: 'college' })
      const posts = await Post.find({categorys: category})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

      const currentRoute = '/category'; 

    console.log(posts); // Log the fetched data to the console

    // Render the 'collegeCategory' view with the fetched posts
    res.render('category', {
      posts,
      length: posts.length,
      currentRoute
    });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//  contact routes-----------------------------------------
router.get('/contact', (req, res) => {

  res.render('contact', {
    currentRoute: '/contact'
  });
});
//  contact routes-----------------------------------------



module.exports = router;
