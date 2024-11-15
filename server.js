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

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true })); 
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
        }
      }
}))

app.set('view engine', '.hbs');

app.use("/movie", MovieRoute);
app.use("/user", UserRoute);
app.use("/tv", TvRoute);


const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
})


