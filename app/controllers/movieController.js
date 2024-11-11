import { tmdbApi } from '../config/movieConfig.js';


// export const getPopularMovies = async (req, res) => {
//   try {
//     const response = await tmdbApi.get('/movie/popular', { params: { page: 1 } });
//     const popular = response.data.results;
//     res.render('movie/popular-movie', { popular });
//   } catch (error) { 
//     res.status(500).json({ message: error.message });
//   }
// };
export const getPopularMovies = async (req, res) => {
  const page = req.query.page || 1; // Lấy page từ query params, mặc định là 1
  try {
    const response = await tmdbApi.get('/movie/popular', { params: { page } });
    const popular = response.data.results;

    if (req.xhr) {  // Kiểm tra nếu là yêu cầu AJAX
      res.json({ popular }); // Trả về JSON cho AJAX
    } else {
      res.render('movie/popular-movie', { popular });
    }
  } catch (error) { 
    res.status(500).json({ message: error.message });
  }
};

export const getMovieDetails = async (req, res) => {
  const movieId = req.params.id;  
  try {
    const movieResponse = await tmdbApi.get(`/movie/${movieId}`);
    const videoResponse = await tmdbApi.get(`/movie/${movieId}/videos`);
    const creditsResponse = await tmdbApi.get(`/movie/${movieId}/credits`); 
    const reviewResponse = await tmdbApi.get(`/movie/${movieId}/reviews`);

    const movie = movieResponse.data;
    const videos = videoResponse.data.results;
    const cast = creditsResponse.data.cast;  
    const crew = creditsResponse.data.crew;  
    const reviews = reviewResponse.data.results;
    const backdrops = movieResponse.data.backdrops;  
    const posters = movieResponse.data.posters; 

    movie.videos = videos;
    movie.cast = cast;
    movie.crew = crew;
    movie.reviews = reviews;
    movie.backdrops = backdrops;
    movie.posters = posters;
    res.render('movie/detail-movie', { movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMovieTrailer = async (req, res) => {
  const movieId = req.params.id;
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    const trailers = response.data.results.filter(video => video.type === 'Trailer');
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi gọi API' });
  }
};

export const searchMovies = async (req, res) => {
  const query = req.query.q;
  try {
    const response = await tmdbApi.get('/search/movie', { params: { query, page: 1 } });
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi gọi API' });
  }
};


export const getMovieGenres =  async (req, res) => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    res.json(response.data.genres); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

