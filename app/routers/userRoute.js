import express from 'express';
import * as userController from "../controllers/userController.js";

const router = express.Router();


router.get('/login', userController.createRequestToken);
router.get('/auth/callback', userController.createSession);
router.post('/favorite', userController.addFavorite);
router.get("/account", userController.accountDetail);


router.get('/popular-people', userController.getPopularPeople); 
router.get('/:id', userController.getPersonDetails); 

export default router;