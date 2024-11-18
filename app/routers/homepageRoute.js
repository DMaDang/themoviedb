import express from 'express';
import * as homepageController from '../controllers/homepageController.js'
const router = express.Router();

router.get('/', homepageController.homePage);

export default router;