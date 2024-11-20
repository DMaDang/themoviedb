import express from 'express';
import * as homepageController from '../controllers/homepageController.js'
const router = express.Router();

router.get('/', homepageController.homePage);
router.get('/search/:type', homepageController.searchContent); 
router.get('/trending/:timeframe', homepageController.getTrendingMovies);
router.get('/trailers', homepageController.getTrailers);
export default router;