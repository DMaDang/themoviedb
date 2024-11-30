import express from 'express';
import exphbs from 'express-handlebars';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session'
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';
import MovieRoute from './app/routers/movieRoute.js';
import UserRoute from './app/routers/userRoute.js';
import TvRoute from './app/routers/tvRoute.js';
import HomepageRoute from './app/routers/homepageRoute.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(express.json()); 
app.use(session({
    secret: process.env.SECRET_KEY_SESSION,  
    resave: false,             
    saveUninitialized: true,    
    cookie: { secure: false }   
  }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'app/views'));   

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs', 
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'app/views/layouts'), 
  runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
  },
  helpers: {
      ifEquals: function (a, b, options) {
          if (a === b) {
              return options.fn(this); 
          } else {
              return options.inverse(this);
          }
      },
      eq: function(a, b) {
          return a === b;
      },
      gt: function(a, b) {
          return a > b;
      },
      lt: function(a, b) {
          return a < b;
      },
      subtract: function(a, b) {
          return a - b;
      },
      add: function(a, b) {
          return a + b;
      },
      range: function(start, end) {
          const range = [];
          for (let i = start; i <= end; i++) {
              range.push(i);
          }
          return range;
      },
      json: function(context) {
        return JSON.stringify(context);
      }    
  }
}));


app.set('view engine', '.hbs');
app.use((req, res, next) => {
    if (req.session && req.session.account) {
      res.locals.account = req.session.account;
    } else {
      res.locals.account = null;
    }
    next();
  });
  
app.use("/movie", MovieRoute);
app.use("/person", UserRoute);
app.use("/tv", TvRoute);
app.use("/", HomepageRoute);


const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
})


