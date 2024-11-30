import express from 'express';
import * as homepageController from '../controllers/homepageController.js'
const router = express.Router();

router.get('/', homepageController.homePage);
router.get('/filter', homepageController.filterMoviesOrTVShows);
router.get('/search/:type', homepageController.searchContent); 
router.get('/trending/:timeframe', homepageController.getTrendingMovies);
router.get('/trailers', homepageController.getTrailers);
router.get('/please-login', homepageController.pleaseLogin);

export default router;