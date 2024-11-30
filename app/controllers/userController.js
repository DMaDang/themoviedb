import { tmdbApi } from "../config/movieConfig.js";

export const getPopularPeople = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const response = await tmdbApi.get("/person/popular", {
      params: { page: currentPage },
    });
    const popularPeople = response.data.results;
    const totalPages = response.data.total_pages;

    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let paginationStart = Math.max(1, currentPage - half);
    let paginationEnd = Math.min(
      totalPages,
      paginationStart + maxPagesToShow - 1
    );

    if (paginationEnd - paginationStart < maxPagesToShow - 1) {
      paginationStart = Math.max(1, paginationEnd - maxPagesToShow + 1);
    }

    res.render("person/popular-people", {
      title: "Người nổi tiếng",
      popularPeople,
      currentPage,
      totalPages,
      paginationStart,
      paginationEnd,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPersonDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const personResponse = await tmdbApi.get(`/person/${id}`);
    const person = personResponse.data;

    const creditsResponse = await tmdbApi.get(`/person/${id}/combined_credits`);
    const knownFor = creditsResponse.data.cast || [];

    const movieCount = knownFor.filter(
      (item) => item.media_type === "movie"
    ).length;
    const tvCount = knownFor.filter((item) => item.media_type === "tv").length;
    const sortedKnownFor = knownFor
      .filter((item) => item.release_date || item.first_air_date)
      .sort(
        (a, b) =>
          new Date(b.release_date || b.first_air_date) -
          new Date(a.release_date || a.first_air_date)
      );
    const updatedKnownFor = sortedKnownFor.map((item) => ({
      ...item,
      movieId: item.id,
      media_type: item.media_type,
      department: item.department,
    }));

    const departmentCounts = {
      Acting: 0,
      Production: 0,
      Crew: 0,
      Sound: 0,
      Directing: 0,
      Writing: 0,
    };

    creditsResponse.data.cast.forEach((item) => {
      departmentCounts.Acting++;
    });

    creditsResponse.data.crew.forEach((item) => {
      const department = item.department;
      if (departmentCounts[department] !== undefined) {
        departmentCounts[department]++;
      }
    });
    const personDetails = {
      knownFor: person.known_for_department || "N/A",
      knownCredits: knownFor.length + creditsResponse.data.crew.length,
      gender:
        person.gender === 2 ? "Male" : person.gender === 1 ? "Female" : "Other",
      birthday: person.birthday || "Unknown",
      placeOfBirth: person.place_of_birth || "Unknown",
      alsoKnownAs: person.also_known_as?.join(", ") || "None",
      profilePath: person.profile_path || "",
    };
    res.render("person/detail-person", {
      person,
      personDetails,
      knownFor: updatedKnownFor,
      movieCount,
      tvCount,
      departmentCounts,
    });
  } catch (error) {
    console.error("Error fetching person details:", error.message);
    res.status(500).json({ message: "Unable to fetch person details" });
  }
};

export const getRequestToken = async (req, res) => {
  const redirectUrl = req.query.redirectUrl || req.headers.referer || "/"; 
  req.session.redirectUrl = redirectUrl;
  try {
    const response = await tmdbApi.get(`/authentication/token/new`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    if (response.data.success) {
      const requestToken = response.data.request_token;
      const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=http://localhost:3000/person/create-session`;
      
      res.render("person/login", { authUrl });
    } else {
      res.status(400).json({ message: "Failed to get request token." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSession = async (req, res) => {
  const { request_token: requestToken, approved } = req.query;

  if (!requestToken || approved !== "true") {
    return res.status(400).render("session-error", {
      message: "Request token is missing or approval failed.",
    });
  }

  try {
    const response = await tmdbApi.post(
      `/authentication/session/new`,
      {
        request_token: requestToken,
      },
      {
        params: { api_key: process.env.TMDB_API_KEY },
      }
    );

    if (response.data.success) {
      const sessionId = response.data.session_id;

      req.session.tmdb_session_id = sessionId;

      const accountResponse = await tmdbApi.get(`/account`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      });

      req.session.account = accountResponse.data;
      const redirectUrl = req.session.redirectUrl || "/";
      delete req.session.redirectUrl;
      return res.redirect(redirectUrl);
    } else {
      return res
        .status(400)
        .render("session-error", { message: "Failed to create session." });
    }
  } catch (error) {
    return res.status(500).render("session-error", { message: error.message });
  }
};

export const getAccountDetails = async (req, res) => {
  const sessionId = req.session.tmdb_session_id;
  if (!sessionId) {
    return res
      .status(400)
      .render("account-error", { message: "Session ID is required." });
  }

  try {
    const response = await tmdbApi.get(`/account`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        session_id: sessionId,
      },
    });
    // console.log(response.data);
    res.render("person/detail-account", { account: response.data });
  } catch (error) {
    res.status(500).render("account-error", { message: error.message });
  }
};

export const addToFavorite = async (req, res) => {
  try {
    const accountId = req.session.account?.id;
    const { mediaId, mediaType, favorite } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!accountId || !mediaId || !mediaType) {
      // console.error("Missing required fields");
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    const response = await tmdbApi.post(
      `/account/${accountId}/favorite`,
      {
        media_type: mediaType,
        media_id: mediaId,
        favorite: favorite,
      },
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: req.session.tmdb_session_id,
        },
      }
    );

    if (response.data.success) {
      return res
        .status(200)
        .json({ message: "Thêm vào danh sách yêu thích thành công!" });
    } else {
      console.error("TMDB API Error:", response.data);
      return res
        .status(500)
        .json({ message: "Lỗi khi thêm vào danh sách yêu thích." });
    }
  } catch (error) {
    console.error("Error in addToFavorite:", error);
    return res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};

export const addToWatchlist = async (req, res) => {
  const { accountId, mediaId, mediaType, watchlist = true } = req.body;
  const sessionId = req.session.sessionId;

  try {
    const response = await tmdbApi.post(
      `/account/${accountId}/watchlist`,
      {
        media_type: mediaType, // 'movie' hoặc 'tv'
        media_id: mediaId,
        watchlist,
      },
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      }
    );

    if (response.data.success) {
      res.json({ message: "Thêm vào danh sách xem sau thành công" });
    } else {
      res.status(400).json({ message: "Failed to add to watchlist." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createList = async (req, res) => {
  const { name, description = "", language = "en" } = req.body;
  const sessionId = req.session.sessionId;

  try {
    const response = await tmdbApi.post(
      `/list`,
      {
        name,
        description,
        language,
      },
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      }
    );

    if (response.data.success) {
      res.json({
        message: "List created successfully.",
        listId: response.data.list_id,
      });
    } else {
      res.status(400).json({ message: "Failed to create list." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const addToList = async (req, res) => {
  const { listId, mediaId } = req.body;
  const sessionId = req.session.sessionId;

  try {
    const response = await tmdbApi.post(
      `/list/${listId}/add_item`,
      {
        media_id: mediaId,
      },
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      }
    );

    if (response.data.success) {
      res.json({ message: "Added to list successfully." });
    } else {
      res.status(400).json({ message: "Failed to add to list." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWatchlist = async (req, res) => {
  const sessionId = req.session.tmdb_session_id;
  const accountId = req.session.account?.id;

  if (!sessionId || !accountId) {
    return res
      .status(400)
      .render("account-error", {
        message: "Session ID or Account ID is missing.",
      });
  }

  const type = req.query.type || "movies"; 

  try {
    const endpoint = type === "tv" ? "watchlist/tv" : "watchlist/movies";
    
    const watchlistResponse = await tmdbApi.get(`/account/${accountId}/${endpoint}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        session_id: sessionId,
      },
    });

    const favoriteResponse = await tmdbApi.get(`/account/${accountId}/favorite/${type}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        session_id: sessionId,
      },
    });

    const favoriteIds = favoriteResponse.data.results.map(item => item.id);

    // Xử lý watchlist items và gán trạng thái isFavorite và isInWatchlist
    const watchlistItems = watchlistResponse.data.results.map((item) => ({
      ...item,
      isFavorite: favoriteIds.includes(item.id), 
      isInWatchlist: true,
    }));

    res.render("person/watch-list", { 
      watchlistItems, 
      type, 
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error.message);
    res
      .status(500)
      .render("account-error", { message: "Unable to fetch watchlist" });
  }
};

export const getFavorite = async (req, res) => {
  const sessionId = req.session.tmdb_session_id;
  const accountId = req.session.account?.id;

  if (!sessionId || !accountId) {
    return res
      .status(400)
      .render("account-error", {
        message: "Session ID or Account ID is missing.",
      });
  }

  const type = req.query.type || "movies"; 

  try {
    const endpoint = type === "tv" ? "favorite/tv" : "favorite/movies";
    
    const favoriteResponse = await tmdbApi.get(`/account/${accountId}/${endpoint}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        session_id: sessionId,
      },
    });

    const watchlistResponse = await tmdbApi.get(`/account/${accountId}/watchlist/${type}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        session_id: sessionId,
      },
    });

    const watchlistIds = watchlistResponse.data.results.map(item => item.id);

    const favoriteItems = favoriteResponse.data.results.map((item) => ({
      ...item,
      isFavorite: true, 
      isInWatchlist: watchlistIds.includes(item.id),
    }));

    res.render("person/favorite-list", { 
      favoriteItems, 
      type, 
    });
  } catch (error) {
    console.error("Error fetching favorite list:", error.message);
    res
      .status(500)
      .render("account-error", { message: "Unable to fetch favorite list" });
  }
};


export const removeFavorite = async (req, res) => {
  const { mediaId, mediaType, favorite } = req.body;
  const sessionId = req.session.tmdb_session_id;
  const accountId = req.session.account?.id;

  // Kiểm tra dữ liệu đầu vào
  if (!mediaId || !mediaType || typeof favorite === "undefined") {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
  }

  // Kiểm tra sessionId và accountId
  if (!sessionId || !accountId) {
    return res.status(400).json({ message: "Session hoặc Account không hợp lệ." });
  }

  try {
    // Gửi yêu cầu đến TMDB API
    const response = await tmdbApi.post(
      `/account/${accountId}/favorite`,
      {
        media_type: mediaType,
        media_id: mediaId,
        favorite, // true hoặc false
      },
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      }
    );

    if (response.status === 200) {
      res.status(200).json({ message: "Favorite status updated successfully." });
    } else {
      res.status(response.status).json({ message: response.statusText });
    }
  } catch (error) {
    console.error("Error toggling favorite status:", error.message);
    res.status(500).json({ message: "Unable to toggle favorite status." });
  }
};

export const removeWatchlist = async (req, res) => {
  const { mediaId, mediaType, watchlist } = req.body;
  const sessionId = req.session.tmdb_session_id;
  const accountId = req.session.account?.id;

  try {
    await tmdbApi.post(
      `/account/${accountId}/watchlist`,
      {
        media_type: mediaType, 
        media_id: mediaId,
        watchlist, 
      },
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      }
    );

    res.status(200).json({ message: "Favorite status updated successfully." });
  } catch (error) {
    console.error("Error toggling favorite status:", error.message);
    res.status(500).json({ message: "Unable to toggle favorite status." });
  }
};

