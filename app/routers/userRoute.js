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