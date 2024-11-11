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

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(session({
    secret: 'your-secret-key',  // Chìa khóa bí mật dùng để mã hóa session
    resave: false,              // Không lưu lại session nếu không thay đổi
    saveUninitialized: true,    // Lưu session ngay cả khi chưa có thay đổi
    cookie: { secure: false }   // Thiết lập secure cookie, false cho môi trường phát triển
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
            return options.fn(this); // Nếu a == b, render phần thân của block
          } else {
            return options.inverse(this); // Nếu không, render phần ngược lại
          }
        },
        eq: function(a, b) {
          return a === b;
        }
      }
}))

app.set('view engine', '.hbs');

app.use("/", MovieRoute);
app.use("/user", UserRoute);

const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
})


