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


export const getTVDetails = async (req, res) => {
    const tvId = req.params.id;
    try {
      const tvResponse = await tmdbApi.get(`/tv/${tvId}`);
      const videoResponse = await tmdbApi.get(`/tv/${tvId}/videos`);
      const creditsResponse = await tmdbApi.get(`/tv/${tvId}/credits`);
      const reviewResponse = await tmdbApi.get(`/tv/${tvId}/reviews`);
      const contentRatingsResponse = await tmdbApi.get(`/tv/${tvId}/content_ratings`);
  
      const tv = tvResponse.data;
      const videos = videoResponse.data.results;
      const cast = creditsResponse.data.cast;
      const crew = creditsResponse.data.crew;
      const reviews = reviewResponse.data.results;
  
      // Tìm certification (dựa trên mã quốc gia VN hoặc US nếu cần)
      const contentRatings = contentRatingsResponse.data.results;
      const vietnamRating = contentRatings.find(item => item.iso_3166_1 === 'US');
      const certification = vietnamRating?.rating || 'N/A';
  
      tv.videos = videos;
      tv.cast = cast;
      tv.crew = crew;
      tv.reviews = reviews;
      tv.certification = certification;
  
      res.render('movie/detail-tv', { tv });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  