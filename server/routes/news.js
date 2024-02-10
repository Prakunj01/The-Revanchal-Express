
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
// const express = require('express')//
const axios = require('axios')
const newsr=express.Router()
const moment = require('moment')
const math = require('math')
const adminLayout = '../views/apinews';


// const API_KEY = "12a46a6621974f289fedbbf8ee234654";
// const url = "https://newsapi.org/v2/everything?q=";

router.get('/news',async(req,res)=>{
    try {
        var url = 'https://newsapi.org/v2/everything?q=' +
          'country=in&' +
          'apiKey=12a46a6621974f289fedbbf8ee234654';

        const news_get =await axios.get(url)
        const currentRoute = '/apinews/news'; 
        res.render('apinews/news',{articles:news_get.data.articles,currentRoute})
    } catch (error) {
        if(error.response){
            console.log(error)
        }     
    }
})

router.post('/search',async(req,res)=>{
    const search=req.body.search
    console.log(req.body.search)
    try {
        var url = `http://newsapi.org/v2/everything?q=${search}&apiKey=12a46a6621974f289fedbbf8ee234654`

        const news_get =await axios.get(url)
        res.render('news',{articles:news_get.data.articles,currentRoute})
    } catch (error) {
        if(error.response){
            console.log(error)
        }
        
    }
})


module.exports = router;