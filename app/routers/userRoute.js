import express from 'express';
import * as userController from "../controllers/userController.js";
import { checkSession } from '../middleware/mdwAPI.js';


const router = express.Router();

router.get('/login', userController.getRequestToken);
router.get('/create-session', userController.createSession);

router.get('/watch-list', checkSession, userController.getWatchlist);
router.get('/favorite-list', checkSession, userController.getFavorite);
router.post('/favorite', checkSession, userController.addToFavorite);
router.post('/add-watchlist', checkSession, userController.addToWatchlist);
router.post('/favorite', checkSession, userController.removeFavorite);
router.post('/watchlist', checkSession, userController.removeWatchlist);
router.post('/create-list', checkSession, userController.createList);
router.post('/add-list', checkSession, userController.addToList);


router.get('/popular-people', userController.getPopularPeople); 
router.get('/detail/:id', userController.getPersonDetails); 

router.get('/detail-account', checkSession, userController.getAccountDetails);


router.get('/logout', (req, res) => {
    const redirectUrl = req.headers.referer || '/'; 
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error clearing session");
        }
        res.clearCookie('connect.sid'); 
        res.redirect(redirectUrl); 
    });
});

export default router;