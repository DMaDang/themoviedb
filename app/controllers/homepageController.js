import { tmdbApi } from "../config/movieConfig.js";

export const homePage = async (req, res) => {
  try {
    const [trendingResponse, popularResponse, trailersResponse] =
      await Promise.all([
        tmdbApi.get("/trending/movie/day"),
        tmdbApi.get("/movie/popular"),
        tmdbApi.get("/movie/now_playing"),
      ]);

    const trendingMovies = trendingResponse.data.results;
    const popularMovies = popularResponse.data.results;
    const nowPlayingMovies = trailersResponse.data.results;

    const trailers = await Promise.all(
      nowPlayingMovies.slice(0, 5).map(async (movie) => {
        const videoResponse = await tmdbApi.get(`/movie/${movie.id}/videos`);
        const trailer = videoResponse.data.results.find(
          (video) => video.type === "Trailer"
        );
        return {
          title: movie.title,
          release_date: movie.release_date,
          trailer_url: trailer
            ? `https://www.youtube.com/embed/${trailer.key}`
            : null,
          name: trailer ? trailer.name : "No trailer name available",
        };
      })
    );

    res.render("index/homepage", {
      trendingMovies,
      popularMovies,
      trailers: trailers.filter((trailer) => trailer.trailer_url !== null),
      title: "Trending, Popular & Latest Trailers",
      apiData: "homepage",
    });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.status(500).send("Error loading homepage");
  }
};

export const searchContent = async (req, res) => {
  const { query } = req.query;
  const { type } = req.params;

  const validTypes = ["movie", "tv", "person", "company", "collection"];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid search type" });
  }

  try {
    const promises = validTypes.map((searchType) =>
      tmdbApi.get(`/search/${searchType}`, {
        params: {
          query,
          language: "VN",
        },
      })
    );

    const results = await Promise.all(promises);

    const [moviesRes, tvShowsRes, peopleRes, companiesRes, collectionsRes] =
      results;

    res.render("index/search", {
      query,
      movies: moviesRes.data.results || [],
      tvShows: tvShowsRes.data.results || [],
      people: peopleRes.data.results || [],
      companies: companiesRes.data.results || [],
      collections: collectionsRes.data.results || [],
      type,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Failed to fetch search results" });
  }
};

export const getTrendingMovies = async (req, res) => {
  const timeframe = req.params.timeframe || "day";
  const page = req.query.page || 1;

  try {
    const response = await tmdbApi.get(`/trending/movie/${timeframe}`, {
      params: { page },
    });
    const trendingMovies = response.data.results;

    res.json({ movies: trendingMovies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrailers = async (req, res) => {
  try {
    const type = req.query.type || "popular";
    const apiEndpoint =
      type === "theater" ? "/movie/now_playing" : "/movie/popular";

    const response = await tmdbApi.get(apiEndpoint);
    const movies = response.data.results;

    const trailers = await Promise.all(
      movies.slice(0, 5).map(async (movie) => {
        const videoResponse = await tmdbApi.get(`/movie/${movie.id}/videos`);
        const trailer = videoResponse.data.results.find(
          (video) => video.type === "Trailer"
        );
        return {
          title: movie.title,
          release_date: movie.release_date,
          trailer_url: trailer
            ? `https://www.youtube.com/embed/${trailer.key}`
            : null,
          name: trailer ? trailer.name : "No trailer name available",
        };
      })
    );

    res.json({
      trailers: trailers.filter((trailer) => trailer.trailer_url !== null),
    });
  } catch (error) {
    console.error("Error fetching trailers:", error);
    res.status(500).json({ message: "Error fetching trailers" });
  }
};

export const filterMoviesOrTVShows = async (req, res) => {
    const {
      sortBy = "popularity.desc", 
      status = "all_movies",
      releaseFrom,
      releaseTo,
      type = "movie",
      page = 1,
    } = req.query;
  
    const sessionId = req.session?.tmdb_session_id;
    const accountId = req.session?.account?.id;
  
    try {
      const isValidDate = (date) => !isNaN(new Date(date).getTime());
  
      const params = {
        sort_by: sortBy,
        "release_date.gte": isValidDate(releaseFrom) ? releaseFrom : undefined,
        "release_date.lte": isValidDate(releaseTo) ? releaseTo : undefined,
        page,
      };
  
      const response = await tmdbApi.get(`/discover/${type}`, { params });
      let results = response.data.results;
  
      if ((status === "unwatched_movies" || status === "watched_movies") && sessionId && accountId) {
        const watchedMovies = await tmdbApi.get(
          `/account/${accountId}/rated/${type}s`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              session_id: sessionId,
            },
          }
        );
        const watchedIds = watchedMovies.data.results.map((item) => item.id);
  
        if (status === "unwatched_movies") {
          results = results.filter((movie) => !watchedIds.includes(movie.id));
        } else if (status === "watched_movies") {
          results = results.filter((movie) => watchedIds.includes(movie.id));
        }
      }
  
      const titlesMap = {
        "popularity.desc": "Phổ biến nhất",
        "popularity.asc": "Ít phổ biến",
        "vote_average.desc": "Được đánh giá cao nhất",
        "vote_average.asc": "Được đánh giá thấp nhất",
        "release_date.desc": "Ngày phát hành gần nhất",
        "release_date.asc": "Ngày phát hành xa nhất",
        "original_title.asc": "Tiêu đề (A-Z)",
        "original_title.desc": "Tiêu đề (Z-A)",
      };
  
      const title = titlesMap[sortBy] || "Danh sách phim";
  
      if (req.xhr || req.headers.accept.indexOf("application/json") > -1) {
        return res.json({
          results,
          page: response.data.page,
          totalPages: response.data.total_pages,
        });
      } else {
        res.render("movie/movies", {
          title,
          movies: results,
          sortBy,
          releaseFrom,
          releaseTo,
          status,
          type,
          page: response.data.page,
          totalPages: response.data.total_pages,
        });
      }
    } catch (error) {
      console.error("Error filtering movies/TV shows:", error.response?.data || error.message);
      res.status(500).json({ message: "Lỗi khi tải dữ liệu." });
    }
  };
  