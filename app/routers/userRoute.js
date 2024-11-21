import express from 'express';
import * as userController from "../controllers/userController.js";


const router = express.Router();

router.get('/login', userController.getRequestToken);
router.get('/create-session', userController.createSession);
router.post('/favorite', userController.addFavorite);
router.get("/detail-account", userController.getAccountDetails);


router.get('/popular-people', userController.getPopularPeople); 
router.get('/:id', userController.getPersonDetails); 



router.get('/logout', (req, res) => {
    res.clearSession('tmdb_session_id');
    res.redirect('/');
});

export default router;