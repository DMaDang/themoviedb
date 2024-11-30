import { tmdbApi } from '../config/movieConfig.js';

export const fetchGenres = async (req, res, next) => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    res.locals.genres = response.data.genres;
    next();
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.locals.genres = []; 
    next();
  }
};


// middleware/checkSession.js
export const checkSession = (req, res, next) => {
  if (req.session && req.session.account) {
    res.locals.account = req.session.account; 
    next(); 
  } else {
    res.redirect('/please-login'); 
  }
};

