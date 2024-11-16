import { tmdbApi } from "../config/movieConfig.js";


export const getPopularPeople = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1; 
    const response = await tmdbApi.get('/person/popular', {
      params: { page: currentPage },
    });
    const popularPeople = response.data.results;
    const totalPages = response.data.total_pages; 

    const maxPagesToShow = 5; 
    const half = Math.floor(maxPagesToShow / 2);
    let paginationStart = Math.max(1, currentPage - half); 
    let paginationEnd = Math.min(totalPages, paginationStart + maxPagesToShow - 1); 

    if (paginationEnd - paginationStart < maxPagesToShow - 1) {
      paginationStart = Math.max(1, paginationEnd - maxPagesToShow + 1);
    }

    res.render('person/popular-people', {
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
  const { person_id } = req.params;
  try {
    const response = await tmdbApi.get(`/person/${person_id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRequestToken = async (req, res) => {
  try {
    const response = await tmdbApi.get("/authentication/token/new");
    const requestToken = response.data.request_token;

    const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=http://localhost:3000/user/auth/callback`;
    console.log(requestToken);
    res.render("authRequest", { authUrl });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    ); 
    res.status(500).json({ message: "Lỗi khi tạo request token" });
  }
};

// Xử lý callback sau khi người dùng xác thực trên TMDB
export const createSession = async (req, res) => {
  const requestToken = req.query.request_token;

  if (!requestToken) {
    return res.status(400).json({ message: "Request token không hợp lệ" });
  }

  try {
    // Gửi yêu cầu tạo session mới với request_token
    const response = await tmdbApi.post("/authentication/session/new", {
      request_token: requestToken,
    });

    console.log("Response from TMDB:", response.data); // In response data để kiểm tra

    // Kiểm tra nếu session_id có trong response
    const sessionId = response.data.session_id;
    if (sessionId) {
      req.session.sessionId = sessionId;
      console.log("Session ID:", sessionId);
      res.render("user/sessionSuccess", { sessionId });
    } else {
      // Nếu không có session_id trong response
      console.error("Không có session_id trong response:", response.data);
      res.status(500).json({ message: "Không thể tạo session ID từ TMDB" });
    }
  } catch (error) {
    // In chi tiết lỗi khi gọi API TMDB
    console.error(
      "Error from TMDB API:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ message: "Lỗi khi tạo session ID", error: error.message });
  }
};

export const accountDetail = async (req, res) => {
  const sessionId = req.session.sessionId; // Lấy sessionId từ session đã lưu
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID không hợp lệ" });
  }

  try {
    const response = await tmdbApi.get(`/account`, {
      params: { session_id: sessionId }, 
    });
    res.render('user/account-detail', { account: response.data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Tạo API thêm vào danh sách yêu thích
export const addFavorite = async (req, res) => {
    const sessionId = req.session.sessionId;  // Lấy sessionId từ session đã lưu
    const { mediaType, mediaId, favorite } = req.body; // Lấy thông tin mediaType, mediaId và favorite từ body của request
  
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID không hợp lệ" });
    }
    try {
      const response = await tmdbApi.post(`/account/{account_id}/favorite`, {
        session_id: sessionId,
        media_id: mediaId,      // ID của đối tượng (bộ phim hoặc chương trình TV)
        favorite: favorite,     // true nếu muốn thêm, false nếu muốn xóa
      });
      res.json({ message: "Đã thêm vào danh sách yêu thích", data: response.data });
    } catch (error) {
      console.error('Error adding favorite:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'Lỗi khi thêm vào danh sách yêu thích', error: error.message });
    }
  };
  
