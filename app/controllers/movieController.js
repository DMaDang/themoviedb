import { tmdbApi } from '../config/movieConfig.js';


export const getPopularMovies = async (req, res) => {
  const page = req.query.page || 1;
  try {
    const response = await tmdbApi.get('/movie/popular', { params: { page } });
    const popular = response.data.results;

    if (req.xhr) {
      res.json({ popular });
    } else {
      res.render('movie/movies', {
        movies: popular,
        title: 'Phim phổ biến',
        apiLink: "popular-movie",
        apiData: "popular"
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopRatedMovies = async (req, res) => {
  const page = req.query.page || 1;
  try {
    const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
    const topRated = response.data.results;

    if (req.xhr) {
      res.json({ topRated });
    } else {
      res.render('movie/movies', {
        movies: topRated,
        title: 'Phim được đánh cao',
        apiLink: "popular-movie",
        apiData: "popular"
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUpcomingMovies = async (req, res) => {
  const page = req.query.page || 1;
  try {
    const response = await tmdbApi.get('/movie/upcoming', { params: { page } });
    const upcoming = response.data.results;

    if (req.xhr) {
      res.json({ upcoming });
    } else {
      res.render('movie/movies', {
        movies: upcoming,
        title: 'Phim sắp ra mắt',
        apiLink: "upcoming-movie",
        apiData: "upcoming"
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNowPlayingMovies = async (req, res) => {
  const page = req.query.page || 1;
  try {
    const response = await tmdbApi.get('/movie/now_playing', { params: { page } });
    const nowPlaying = response.data.results;

    if (req.xhr) {
      res.json({ nowPlaying });
    } else {
      res.render('movie/movies', {
        movies: nowPlaying, 
        title: 'Phim đang công chiếu', 
        apiLink: "now-playing",
        apiData: "nowPlaying"
      });
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
    const releaseDatesResponse = await tmdbApi.get(`/movie/${movieId}/release_dates`);

    const movie = movieResponse.data;
    const videos = videoResponse.data.results;
    const cast = creditsResponse.data.cast;
    const crew = creditsResponse.data.crew;
    const reviews = reviewResponse.data.results;

    const releaseDates = releaseDatesResponse.data.results;
    const vietnamRelease = releaseDates.find(item => item.iso_3166_1 === 'US');
    const certification = vietnamRelease?.release_dates[0]?.certification || 'N/A';

    movie.videos = videos;
    movie.cast = cast;
    movie.crew = crew;
    movie.reviews = reviews;
    movie.certification = certification;

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


export const getMovieGenres = async (req, res) => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    res.json(response.data.genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  
