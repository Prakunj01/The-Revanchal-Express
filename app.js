// require('dotenv').config();
const { config } = require('dotenv');
config(); // This will load the environment variables from the .env file
const path = require('path');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

// for new api
const bodyParser = require('body-parser');//
const moment = require('moment')//

const app = express();
const PORT = process.env.PORT || 5000;
  
// Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.locals.moment = moment;//


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));

app.use(express.static('public'));
// app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// app.use(express.static("uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
// app.set('layout', './layouts/news');
app.set('view engine', 'ejs');
app.set('views','./views')

app.locals.isActiveRoute = isActiveRoute; 


app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));
app.use('/', require('./server/routes/news'));

app.listen(PORT, ()=> {
  console.log(`App listening on port ${PORT}`);
});
