import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Create axios instance with base URL
// pulls from .env file (for development) or uses an Azure environment variable (for production)
const environment = process.env.NODE_ENV;
const baseUrl =
  environment === "development"
    ? "http://localhost:5232/api"
    : "https://intexbackend-a6fvcvg6cha4hwcx.centralus-01.azurewebsites.net/api";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Redirect to login page
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;

    // Store token and user info
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { token, user };
  },

  getUserInfo: async () => {
    try {
      const response = await api.get("/auth/user-info");
      return response.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  },

  register: async (registerData: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName?: string;
    phone?: string;
    username?: string;
    age?: string;
    gender?: string;
    city?: string;
    state?: string;
    zip?: string;
    services?: string[];
  }) => {
    const response = await api.post("/auth/register", registerData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.roles && user.roles.includes("Admin");
  },
};

// Movie services (using the new MovieTitle table)
export const movieService = {
  getMovies: async (
    page = 1,
    pageSize = 10,
    genre?: string,
    search?: string
  ) => {
    let url = `/movietitle?page=${page}&pageSize=${pageSize}`;
    if (genre) url += `&genre=${genre}`;
    if (search) url += `&search=${search}`;

    const response = await api.get(url);

    // Transform the response to match the expected format
    const {
      movies,
      totalCount,
      totalPages,
      currentPage,
      pageSize: size,
    } = response.data;

    // Fetch ratings for each movie and store them in the global store
    const transformedMovies = await Promise.all(
      movies.map(async (movie: any) => {
        try {
          // Fetch ratings for this movie
          const ratingsResponse = await api.get(
            `/movierating/movie/${movie.showId}`
          );
          const ratings = ratingsResponse.data;

          // Store ratings in the global store
          window.movieRatings[movie.showId] = ratings;

          // Calculate average rating
          let avgRating = 0;
          if (ratings.length > 0) {
            const sum = ratings.reduce(
              (total: number, rating: MovieRatingItem) => total + rating.rating,
              0
            );
            avgRating = sum / ratings.length;
          } else {
            // If no ratings, set to 0
            avgRating = 0;
          }

          return {
            movieId: movie.showId,
            title: movie.title,
            genre: movie.genre,
            description: movie.description,
            imageUrl: movie.imageUrl
              ? encodeURI(movie.imageUrl)
              : `/images/${movie.showId}.jpg`, // Use imageUrl from DB if available, ensuring it's properly encoded
            year: movie.releaseYear,
            director: movie.director,
            averageRating: avgRating,
          };
        } catch (error) {
          console.error(
            `Error fetching ratings for movie ${movie.showId}:`,
            error
          );
          return {
            movieId: movie.showId,
            title: movie.title,
            genre: movie.genre,
            description: movie.description,
            imageUrl: `/images/${movie.showId}.jpg`,
            year: movie.releaseYear,
            director: movie.director,
            averageRating: 0,
          };
        }
      })
    );

    return {
      movies: transformedMovies,
      totalCount,
      totalPages,
      currentPage,
      pageSize: size,
    };
  },

  getMovie: async (id: string) => {
    const response = await api.get(`/movietitle/${id}`);
    const movie = response.data;

    try {
      // Fetch ratings for this movie
      const ratingsResponse = await api.get(
        `/movierating/movie/${movie.showId}`
      );
      const ratings = ratingsResponse.data;

      // Store ratings in the global store
      window.movieRatings[movie.showId] = ratings;

      // Calculate average rating
      let avgRating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce(
          (total: number, rating: MovieRatingItem) => total + rating.rating,
          0
        );
        avgRating = sum / ratings.length;
      } else {
        // If no ratings, set to 0
        avgRating = 0;
      }

      // Transform MovieTitle to match the expected Movie format
      return {
        movieId: movie.showId,
        title: movie.title,
        genre: movie.genre,
        description: movie.description,
        imageUrl: movie.imageUrl
          ? encodeURI(movie.imageUrl)
          : `/images/${movie.showId}.jpg`,
        year: movie.releaseYear,
        director: movie.director,
        averageRating: avgRating,
      };
    } catch (error) {
      console.error(`Error fetching ratings for movie ${movie.showId}:`, error);

      // Transform MovieTitle to match the expected Movie format without ratings
      return {
        movieId: movie.showId,
        title: movie.title,
        genre: movie.genre,
        description: movie.description,
        imageUrl: movie.imageUrl
          ? encodeURI(movie.imageUrl)
          : `/images/${movie.showId}.jpg`,
        year: movie.releaseYear,
        director: movie.director,
        averageRating: 0,
      };
    }
  },

  getGenres: async () => {
    const response = await api.get("/movietitle/genres");
    return response.data;
  },

  createMovie: async (movie: any) => {
    // Generate a unique ID for the movie if not provided
    const showId = movie.movieId ? movie.movieId.toString() : `m${Date.now()}`;

    // Transform Movie to MovieTitle format
    const movieTitle = {
      showId: showId,
      type: "Movie",
      title: movie.title,
      director: movie.director || "",
      cast: "",
      country: "",
      releaseYear: movie.year,
      rating: "",
      duration: "",
      description: movie.description || "",
      // Set the appropriate genre field to 1
      Action: movie.genre === "Action" ? 1 : 0,
      Adventure: movie.genre === "Adventure" ? 1 : 0,
      Comedies: movie.genre === "Comedy" ? 1 : 0,
      Dramas: movie.genre === "Drama" ? 1 : 0,
      HorrorMovies: movie.genre === "Horror" ? 1 : 0,
      Thrillers: movie.genre === "Thriller" ? 1 : 0,
    };

    const response = await api.post("/movietitle", movieTitle);
    return response.data;
  },

  updateMovie: async (id: string, movie: any) => {
    // Get the existing movie to preserve genre values
    const existingMovie = await api.get(`/movietitle/${id}`);
    const existingData = existingMovie.data;

    // Update only the fields that are provided
    const updatedMovie = {
      ...existingData,
      title: movie.title || existingData.title,
      director: movie.director || existingData.director,
      releaseYear: movie.year || existingData.releaseYear,
      description: movie.description || existingData.description,
    };

    // Update genre if provided
    if (movie.genre) {
      // Reset all genre fields
      updatedMovie.Action = 0;
      updatedMovie.Adventure = 0;
      updatedMovie.Comedies = 0;
      updatedMovie.Dramas = 0;
      updatedMovie.HorrorMovies = 0;
      updatedMovie.Thrillers = 0;

      // Set the appropriate genre field
      switch (movie.genre) {
        case "Action":
          updatedMovie.Action = 1;
          break;
        case "Adventure":
          updatedMovie.Adventure = 1;
          break;
        case "Comedy":
          updatedMovie.Comedies = 1;
          break;
        case "Drama":
          updatedMovie.Dramas = 1;
          break;
        case "Horror":
          updatedMovie.HorrorMovies = 1;
          break;
        case "Thriller":
          updatedMovie.Thrillers = 1;
          break;
      }
    }

    const response = await api.put(`/movietitle/${id}`, updatedMovie);
    return response.data;
  },

  deleteMovie: async (id: string) => {
    const response = await api.delete(`/movietitle/${id}`);
    return response.data;
  },
};

const genreMap: Record<string, string> = {
  action: "Action",
  adventure: "Adventure",
  animeSeriesInternationalTvShows: "Anime Series International TV Shows",
  britishTvShowsDocuseriesInternationalTvShows:
    "British TV Shows Docuseries International TV Shows",
  children: "Children",
  comedy: "Comedy",
  comedyDramasInternationalMovies: "Comedy Dramas International Movies",
  comedyRomanticMovies: "Comedy Romantic Movies",
  crimeTvShowsDocuseries: "Crime TV Shows Docuseries",
  dcoumentaries: "Dcoumentaries",
  documentariesInternationalMoves: "Documentaries International Moves",
  docuseries: "Docuseries",
  drama: "Drama",
  dramaInternationalMovies: "Drama International Movies",
  dramaRomanticMovies: "Drama Romantic Movies",
  familyMovies: "Family Movies",
  fantasy: "Fantasy",
  horror: "Horror",
  internationalMoviesThrillers: "International Movies Thrillers",
  internationalTvShowsRomanticTvShowsTvDramas:
    "International TV Shows Romantic TV Shows TV Dramas",
  kidsTv: "Kids' TV",
  languageTvShows: "Language TV Shows",
  musicals: "Musicals",
  natureTv: "Nature TV",
  realityTv: "Reality TV",
  spirituality: "Spirituality",
  tvAction: "TV Action",
  tvComedies: "TV Comedies",
  tvDramas: "TV Dramas",
  talkShowsTvComedies: "Talk Shows TV Comedies",
  thriller: "Thriller",
};

// Define the interface for the rating object
interface MovieRatingItem {
  userId: number;
  showId: string;
  rating: number;
  review?: string;
  userName?: string;
}

// Extend the Window interface to include our global store
declare global {
  interface Window {
    movieRatings: Record<string, MovieRatingItem[]>;
  }
}

// Initialize the global store if it doesn't exist
if (!window.movieRatings) {
  window.movieRatings = {};
}

// No need for a separate helper function as we calculate the average rating inline

// Rating services (using the new MovieRating table)
export const ratingService = {
  getRatingsByMovie: async (showId: string) => {
    const response = await api.get(`/movierating/movie/${showId}`);
    return response.data;
  },

  getUserRatings: async (userId: number) => {
    const response = await api.get(`/movierating/user/${userId}`);
    return response.data;
  },

  rateMovie: async (showId: string, rating: number, review?: string) => {
    // Make sure we're sending the correct property name (ShowId) expected by the backend
    console.log("Sending review:", review); // Add logging to debug
    const response = await api.post("/movierating", {
      showId: showId,
      rating: rating,
      review: review,
    });
    return response.data;
  },

  deleteRating: async (userId: number, showId: string) => {
    const response = await api.delete(`/movierating/${userId}/${showId}`);
    return response.data;
  },

  deleteSingleRating: async (ratingId: number) => {
    const response = await api.delete(`/movierating/single/${ratingId}`);
    return response.data;
  },
};

// Privacy policy service
export const privacyService = {
  getPrivacyPolicy: async () => {
    const response = await api.get("/privacy");
    return response.data;
  },
};

export default api;
