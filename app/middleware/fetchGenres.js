import { tmdbApi } from '../config/movieConfig.js';

export const fetchGenres = async (req, res, next) => {
  try {
    // Fetch danh sách thể loại từ TMDB
    const response = await tmdbApi.get('/genre/movie/list');
    res.locals.genres = response.data.genres;
    next();
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.locals.genres = []; // Gán giá trị mặc định nếu có lỗi
    next();
  }
};
