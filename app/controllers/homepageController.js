import { tmdbApi } from '../config/movieConfig.js';

export const homePage = async(req, res) => {
    res.render('index/homepage')
}