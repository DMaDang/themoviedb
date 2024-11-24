import express from 'express';
import * as userController from "../controllers/userController.js";


const router = express.Router();

router.get('/login', userController.getRequestToken);
router.get('/create-session', userController.createSession);

router.get('/watch-list', userController.getWatchlist);
router.get('/favorite-list', userController.getFavorite);
router.post('/favorite', userController.addToFavorite);
router.post('/add-watchlist', userController.addToWatchlist);
router.post('/favorite', userController.removeFavorite);
router.post('/watchlist', userController.removeWatchlist);
router.post('/create-list', userController.createList);
router.post('/add-list', userController.addToList);


router.get('/popular-people', userController.getPopularPeople); 
router.get('/detail/:id', userController.getPersonDetails); 

router.get('/detail-account', userController.getAccountDetails);


router.get('/logout', (req, res) => {
    res.clearSession('tmdb_session_id');
    res.redirect('/');
});

export default router;