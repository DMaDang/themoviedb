import { tmdbApi } from '../config/movieConfig.js';

export const homePage = async (req, res) => {
    try {
        const [trendingResponse, popularResponse, trailersResponse] = await Promise.all([
            tmdbApi.get('/trending/movie/day'),
            tmdbApi.get('/movie/popular'),
            tmdbApi.get('/movie/now_playing'), 
        ]);

        const trendingMovies = trendingResponse.data.results;
        const popularMovies = popularResponse.data.results;
        const nowPlayingMovies = trailersResponse.data.results;

        const trailers = await Promise.all(
            nowPlayingMovies.slice(0, 5).map(async (movie) => {
                const videoResponse = await tmdbApi.get(`/movie/${movie.id}/videos`);
                const trailer = videoResponse.data.results.find((video) => video.type === 'Trailer');
                return {
                    title: movie.title,
                    release_date: movie.release_date,
                    trailer_url: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
                    name: trailer ? trailer.name : 'No trailer name available', 
                };
            })
        );

        res.render('index/homepage', {
            trendingMovies,
            popularMovies,
            trailers: trailers.filter((trailer) => trailer.trailer_url !== null),
            title: 'Trending, Popular & Latest Trailers',
            apiData: 'homepage',
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        res.status(500).send('Error loading homepage');
    }
};


export const searchContent = async (req, res) => {
    const { query } = req.query; // Lấy query từ tham số search
    const { type } = req.params; // Lấy loại tìm kiếm (movie, tv, etc.)

    // Danh sách các loại tìm kiếm được hỗ trợ
    const validTypes = ['movie', 'tv', 'person', 'company', 'collection'];

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    if (!type || !validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid search type' });
    }

    try {
        // Tạo các request song song để lấy dữ liệu
        const promises = validTypes.map((searchType) =>
            tmdbApi.get(`/search/${searchType}`, {
                params: {
                    query,
                    language: 'en-US',
                },
            })
        );

        // Chờ tất cả các request hoàn thành
        const results = await Promise.all(promises);

        // Gán kết quả tương ứng với từng loại tìm kiếm
        const [moviesRes, tvShowsRes, peopleRes, companiesRes, collectionsRes] = results;

        // Render trang với tất cả dữ liệu
        res.render('index/search', {
            query,
            movies: moviesRes.data.results || [],
            tvShows: tvShowsRes.data.results || [],
            people: peopleRes.data.results || [],
            companies: companiesRes.data.results || [],
            collections: collectionsRes.data.results || [],
            type, // Truyền type để đánh dấu mục đang active
        });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ message: 'Failed to fetch search results' });
    }
};



export const getTrendingMovies = async (req, res) => {
    const timeframe = req.params.timeframe || 'day';
    const page = req.query.page || 1;

    try {
        const response = await tmdbApi.get(`/trending/movie/${timeframe}`, { params: { page } });
        const trendingMovies = response.data.results;

        res.json({ movies: trendingMovies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getTrailers = async (req, res) => {
    try {
        const type = req.query.type || 'popular';
        const apiEndpoint = type === 'theater' ? '/movie/now_playing' : '/movie/popular';

        const response = await tmdbApi.get(apiEndpoint);
        const movies = response.data.results;

        const trailers = await Promise.all(
            movies.slice(0, 5).map(async (movie) => {
                const videoResponse = await tmdbApi.get(`/movie/${movie.id}/videos`);
                const trailer = videoResponse.data.results.find((video) => video.type === 'Trailer');
                return {
                    title: movie.title,
                    release_date: movie.release_date,
                    trailer_url: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
                    name: trailer ? trailer.name : 'No trailer name available',
                };
            })
        );

        res.json({ trailers: trailers.filter((trailer) => trailer.trailer_url !== null) });
    } catch (error) {
        console.error('Error fetching trailers:', error);
        res.status(500).json({ message: 'Error fetching trailers' });
    }
};
