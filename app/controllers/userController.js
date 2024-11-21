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
      gender: person.gender === 2 ? "Male" : person.gender === 1 ? "Female" : "Other",
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
  try {
      const response = await tmdbApi.get(`/authentication/token/new`, {
          params: { api_key: process.env.TMDB_API_KEY },
      });

      if (response.data.success) {
          const requestToken = response.data.request_token;
          const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=http://localhost:3000/person/create-session`;

          res.render('person/login', { authUrl });
      } else {
          res.status(400).json({ message: 'Failed to get request token.' });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


export const createSession = async (req, res) => {
  const { request_token: requestToken, approved } = req.query;

  if (!requestToken || approved !== 'true') {
    return res.status(400).render('session-error', { message: "Request token is missing or approval failed." });
  }

  try {
    // Tạo session từ request token
    const response = await tmdbApi.post(`/authentication/session/new`, {
      request_token: requestToken,
    }, {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    if (response.data.success) {
      const sessionId = response.data.session_id;

      // Lưu sessionId vào session
      req.session.tmdb_session_id = sessionId;

      // Sử dụng sessionId để lấy thông tin tài khoản
      const accountResponse = await tmdbApi.get(`/account`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          session_id: sessionId,
        },
      });

      // Lưu thông tin tài khoản vào session
      req.session.account = accountResponse.data;

      // Chuyển hướng về trang chủ sau khi đăng nhập thành công
      return res.redirect('/');
    } else {
      return res.status(400).render('session-error', { message: "Failed to create session." });
    }
  } catch (error) {
    return res.status(500).render('session-error', { message: error.message });
  }
};
  


export const getAccountDetails = async (req, res) => {
  const sessionId = req.session.tmdb_session_id;  // Lấy sessionId từ session

  // if (!sessionId) {
  //   return res.status(400).render('account-error', { message: "Session ID is required." });
  // }

  try {
    const response = await tmdbApi.get(`/account`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        session_id: sessionId,
      },
    });

    // Render thông tin tài khoản
    res.render('person/detail-account', { account: response.data });
  } catch (error) {
    res.status(500).render('account-error', { message: error.message });
  }
};


// Tạo API thêm vào danh sách yêu thích
export const addFavorite = async (req, res) => {
  const sessionId = req.session.sessionId; // Lấy sessionId từ session đã lưu
  const { mediaType, mediaId, favorite } = req.body; // Lấy thông tin mediaType, mediaId và favorite từ body của request

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID không hợp lệ" });
  }
  try {
    const response = await tmdbApi.post(`/account/{account_id}/favorite`, {
      session_id: sessionId,
      media_id: mediaId, // ID của đối tượng (bộ phim hoặc chương trình TV)
      favorite: favorite, // true nếu muốn thêm, false nếu muốn xóa
    });
    res.json({
      message: "Đã thêm vào danh sách yêu thích",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error adding favorite:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      message: "Lỗi khi thêm vào danh sách yêu thích",
      error: error.message,
    });
  }
};
