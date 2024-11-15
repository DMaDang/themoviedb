import * as tvRoute from '../controllers/tvController.js';
import express from 'express';

const router = express.Router();

router.get('/top-rated', tvRoute.getTopRatedTVShows)
router.get('/popular', tvRoute.getPopularTVShows)
router.get('/airing-today', tvRoute.getAiringTodayTVShows)
// router.get('/popular', tvRoute.getPopularTVShows)



export default router;
