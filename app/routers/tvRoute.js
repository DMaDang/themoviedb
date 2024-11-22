import * as tvRoute from '../controllers/tvController.js';
import express from 'express';

const router = express.Router();

router.get('/top-rated', tvRoute.getTopRatedTVShows)
router.get('/popular', tvRoute.getPopularTVShows)
router.get('/airing-today', tvRoute.getAiringTodayTVShows)
router.get('/on-tv', tvRoute.getOnTV)
router.get('/:id', tvRoute.getTVDetails)



export default router;
