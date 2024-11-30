import express from 'express';
import * as movieController from "../controllers/movieController.js";

const router = express.Router();


router.get("/popular-movie", movieController.getPopularMovies);
router.get("/top-rated", movieController.getTopRatedMovies);
router.get("/upcoming-movie", movieController.getUpcomingMovies);
router.get("/now-playing", movieController.getNowPlayingMovies);

router.get("/:id", movieController.getMovieDetails);
router.get("/trailer/:id", movieController.getMovieTrailer);
router.get("/movie", movieController.searchMovies);
router.get('/movie-genres/genres', movieController.getMovieGenres);
router.get('/genre/:id', movieController.getGenrePage);


export default router;