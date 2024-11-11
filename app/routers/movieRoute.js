import express from 'express';
import * as movieController from "../controllers/movieController.js";

const router = express.Router();

router.get("/popular-movie", movieController.getPopularMovies);
router.get("/movie/:id", movieController.getMovieDetails);
router.get("/trailer/:id", movieController.getMovieTrailer);
router.get("/movie", movieController.searchMovies);
router.get('/genres', movieController.getMovieGenres);


export default router;