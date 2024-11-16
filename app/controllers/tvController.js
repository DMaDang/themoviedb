import { tmdbApi } from "../config/movieConfig.js";

export const getTopRatedTVShows = async (req, res) => {
    const page = req.query.page || 1;
    try {
        const response = await tmdbApi.get("/tv/top_rated", { params: { page } });
        const topRatedTV = response.data.results;
        if (req.xhr) {
            res.json({ topRatedTV });
        } else {
            res.render("movie/tv", {
                movies: topRatedTV,
                title: "Chương trình truyền hình được đánh giá cao",
                apiLink: "top-rated",
                apiData: "topRatedTV"
            });
        }
    } catch (err) {
        res.status(400).json({ err: err });
    }
};
export const getPopularTVShows = async (req, res) => {
    const page = req.query.page || 1;
    try {
        const response = await tmdbApi.get("/tv/popular", { params: { page } });
        const popularTV = response.data.results;
        if (req.xhr) {
            res.json({ popularTV });
        } else {
            res.render("movie/tv", {
                movies: popularTV,
                title: "Chương trình truyền hình phổ biến",
                apiLink: "popular",
                apiData: "popularTV"
            });
        }
    } catch (err) {
        res.status(400).json({ err: err });
    }
};
export const getAiringTodayTVShows = async (req, res) => {
    const page = req.query.page || 1;
    try {
        const response = await tmdbApi.get('/tv/airing_today', { params: { page } });
        const airingToday = response.data.results;

        if (req.xhr) {
            res.json({ airingToday });
        } else {
            res.render('movie/tv', { 
                movies: airingToday, 
                title: 'Phim truyền hình đang phát sóng hôm nay',
                apiLink: "airing-today",
                apiData: "airingToday" 
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOnTV = async (req, res) => {
    const page = req.query.page || 1;
    try {
        const response = await tmdbApi.get("/tv/on_the_air", { params: { page } });
        const onTV = response.data.results;
        if (req.xhr) {
            res.json({ onTV });
        } else {
            res.render("movie/tv", {
                movies: onTV,
                title: "Chương trình đang phát sóng",
                apiLink: "on-tv",
                apiData: "onTV"
            });
        }
    } catch (err) {
        res.status(400).json({ err: err });
    }
};