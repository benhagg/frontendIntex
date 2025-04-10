import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Movie } from "../types/movies";
// Helper to transform a raw movie object into the Movie type
import { toMovie } from "../utils/toMovie";
import { UserInfo } from "../types/userInfo";

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

  updateUser: async (updatedUser: Partial<UserInfo>) => {
    const response = await api.put("/auth/update", updatedUser);
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

// Movie services (using the new MovieTitle table)
export const movieService = {
  getUserRecommendations: async (userId: string, kidsMode: boolean = false) => {
    try {
      const response = await api.get(`/movies/user-recommendations/${userId}?kidsMode=${kidsMode}`);

      // Fetch ratings for each movie in each recommendation category
      const fetchRatingsForMovies = async (movies: any[]) => {
        return await Promise.all(
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
              }

              // Return the movie with the average rating
              return {
                ...movie,
                averageRating: avgRating
              };
            } catch (error) {
              console.error(
                `Error fetching ratings for recommended movie ${movie.showId}:`,
                error
              );
              return movie; // Return the original movie if ratings fetch fails
            }
          })
        );
      };

      // Process each recommendation category
      const locationRecommendations = await fetchRatingsForMovies(
        response.data.locationRecommendations || []
      );
      const basicRecommendations = await fetchRatingsForMovies(
        response.data.basicRecommendations || []
      );
      const streamingRecommendations = await fetchRatingsForMovies(
        response.data.streamingRecommendations || []
      );

      // Transform each recommendation category to match the expected Movie format
      const transformRecommendations = (movies: any[]) => movies.map(toMovie);

      return {
        locationRecommendations: transformRecommendations(locationRecommendations),
        basicRecommendations: transformRecommendations(basicRecommendations),
        streamingRecommendations: transformRecommendations(streamingRecommendations),
      };
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      return {
        locationRecommendations: [],
        basicRecommendations: [],
        streamingRecommendations: [],
      };
    }
  },

  getRecommendations: async (movieId: string, kidsMode: boolean = false) => {
    const response = await api.get(`/movies/${movieId}/recommendations?kidsMode=${kidsMode}`);

    // Transform the response to match the expected Movie format and fetch ratings
    const recommendedMovies = await Promise.all(
      response.data.map(async (movie: any) => {
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
          }

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
            country: movie.country,
            type: movie.type || "Movie",
            cast: movie.cast || "",
            duration: movie.duration || "",
            rating: movie.rating || "",
          };
        } catch (error) {
          console.error(
            `Error fetching ratings for recommended movie ${movie.showId}:`,
            error
          );
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
            averageRating: 0, // Default to 0 if ratings fetch fails
            country: movie.country,
            type: movie.type || "Movie",
            cast: movie.cast || "",
            duration: movie.duration || "",
            rating: movie.rating || "",
          };
        }
      })
    );

    return recommendedMovies;
  },
  getMovies: async (
    page = 1,
    pageSize = 10,
    genre?: string,
    search?: string,
    kidsMode?: boolean
  ) => {
    let url = `/movietitle?page=${page}&pageSize=${pageSize}`;
    if (genre) url += `&genre=${genre}`;
    if (search) url += `&search=${search}`;
    if (kidsMode !== undefined) url += `&kidsMode=${kidsMode}`;

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
            showId: movie.showId,
            title: movie.title,
            genre: movie.genre,
            description: movie.description,
            imageUrl: movie.imageUrl
              ? encodeURI(movie.imageUrl)
              : `/images/${movie.showId}.jpg`, // Use imageUrl from DB if available, ensuring it's properly encoded
            releaseYear: movie.releaseYear,
            director: movie.director,
            averageRating: avgRating,
            country: movie.country,
            type: movie.type || "Movie",
            cast: movie.cast || "",
            duration: movie.duration || "",
            rating: movie.rating || "",
          };
        } catch (error) {
          console.error(
            `Error fetching ratings for movie ${movie.showId}:`,
            error
          );
          return {
            showId: movie.showId,
            title: movie.title,
            genre: movie.genre,
            description: movie.description,
            imageUrl: `/images/${movie.showId}.jpg`,
            releaseYear: movie.releaseYear,
            director: movie.director,
            averageRating: 0,
            type: movie.type || "Movie",
            cast: movie.cast || "",
            duration: movie.duration || "",
            country: movie.country || "",
            rating: movie.rating || "",
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

  getMovie: async (id: string, kidsMode?: boolean) => {
    let url = `/movietitle/${id}`;
    if (kidsMode !== undefined) url += `?kidsMode=${kidsMode}`;
    const response = await api.get(url);
    const movie = response.data;
    console.log("Raw response from backend:", response.data); // Debug log for raw response

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

      // Determine the genre based on the genre flags
      let genre = movie.Genre || movie.genre || "";
      
      // If genre is not directly available, determine it from the genre flags
      if (!genre) {
        // Check each genre flag and use the first one that is set to 1 or true
        if (movie.Action === 1 || movie.Action === true) genre = "Action";
        else if (movie.Adventure === 1 || movie.Adventure === true) genre = "Adventure";
        else if (movie.Comedies === 1 || movie.Comedies === true) genre = "Comedy";
        else if (movie.Dramas === 1 || movie.Dramas === true) genre = "Drama";
        else if (movie.HorrorMovies === 1 || movie.HorrorMovies === true) genre = "Horror";
        else if (movie.Thrillers === 1 || movie.Thrillers === true) genre = "Thriller";
        // Add more genre mappings as needed
      }
      
      console.log("Movie data from backend:", movie);
      console.log("Determined genre value:", genre);
     
      return {
        movieId: movie.showId,
        showId: movie.showId,
        title: movie.title,
        genre: genre, // Use the determined genre
        description: movie.description,
        imageUrl: movie.imageUrl
          ? encodeURI(movie.imageUrl)
          : `/images/${movie.showId}.jpg`,
        year: movie.releaseYear,
        releaseYear: movie.releaseYear,
        director: movie.director,
        averageRating: avgRating,
        type: movie.type || "Movie",
        cast: movie.cast || "",
        duration: movie.duration || "",
        country: movie.country || "",
        rating: movie.rating || "",
      };
    } catch (error) {
      console.error(`Error fetching ratings for movie ${movie.showId}:`, error);

      // Transform MovieTitle to match the expected Movie format without ratings
      // Check if genre is available with capital G (from C# backend) or lowercase g
      const genre = movie.Genre || movie.genre || "";
      console.log("Movie data from backend (error case):", movie);
      console.log("Genre value (error case):", genre);

      return {
        movieId: movie.showId,
        showId: movie.showId,
        title: movie.title,
        genre: genre, // Use the genre value we extracted
        description: movie.description,
        imageUrl: movie.imageUrl
          ? encodeURI(movie.imageUrl)
          : `/images/${movie.showId}.jpg`,
        year: movie.releaseYear,
        releaseYear: movie.releaseYear,
        director: movie.director,
        averageRating: 0,
        type: movie.type || "Movie",
        cast: movie.cast || "",
        duration: movie.duration || "",
        country: movie.country || "",
        rating: movie.rating || "",
      };
    }
  },

  getGenres: async () => {
    const response = await api.get("/movietitle/genres");
    return response.data;
  },

  getTypes: async () => {
    // Return only "Movie" and "TV Show" as options
    return ["Movie", "TV Show"];
  },

  getCountries: async () => {
    // Return an empty array since we're not using this anymore
    return [];
  },

  createMovie: async (movie: any) => {
    // Generate a unique ID for the movie if not provided
    const showId = movie.showId ? movie.showId.toString() : `m${Date.now()}`;

    // Transform Movie to MovieTitle format with genre fields
    const movieTitle: Record<string, any> = {
      showId: showId,
      type: movie.type || "Movie",
      title: movie.title,
      director: movie.director || "",
      cast: movie.cast || "",
      country: movie.country || "",
      releaseYear: movie.releaseYear,
      rating: movie.rating || "",
      duration: movie.duration || "",
      description: movie.description || "",
      // Initialize all genre fields to 0
      Action: 0,
      Adventure: 0,
      Comedies: 0,
      Dramas: 0,
      HorrorMovies: 0,
      Thrillers: 0,
    };

    // Set the appropriate genre field to 1 based on the genre
    switch (movie.genre) {
      case "Action":
        movieTitle.Action = 1;
        break;
      case "Adventure":
        movieTitle.Adventure = 1;
        break;
      case "Comedy":
        movieTitle.Comedies = 1;
        break;
      case "Drama":
        movieTitle.Dramas = 1;
        break;
      case "Horror":
        movieTitle.HorrorMovies = 1;
        break;
      case "Thriller":
        movieTitle.Thrillers = 1;
        break;
    }

    try {
      const response = await api.post("/movietitle", movieTitle);
      return response.data;
    } catch (error) {
      console.error("Error creating movie:", error);
      throw error;
    }
  },

  updateMovie: async (id: string, movie: any) => {
    try {
      // Get the existing movie to preserve genre values
      const existingMovie = await api.get(`/movietitle/${id}`);
      const existingData = existingMovie.data;

      // Update only the fields that are provided
      const updatedMovie = {
        ...existingData,
        title: movie.title || existingData.title,
        director: movie.director || existingData.director,
        releaseYear: movie.releaseYear || existingData.releaseYear,
        description: movie.description || existingData.description,
        cast: movie.cast || existingData.cast,
        duration: movie.duration || existingData.duration,
        country: movie.country || existingData.country,
        imageUrl: movie.imageUrl || existingData.imageUrl,
        type: movie.type || existingData.type,
        rating: movie.rating || existingData.rating,
      };

      // Update genre if provided
      if (movie.genre) {
        // Reset all genre fields
        // Get all genre fields from the existingData
        const genreFields = Object.keys(existingData).filter(
          (key) =>
            typeof existingData[key] === "number" &&
            key !== "releaseYear" &&
            key !== "showId"
        );

        // Reset all genre fields to 0
        genreFields.forEach((field) => {
          updatedMovie[field] = 0;
        });

        // Set the appropriate genre field based on the genre map
        const genreMap: Record<string, string> = {
          Action: "Action",
          Adventure: "Adventure",
          Comedy: "Comedies",
          Drama: "Dramas",
          Horror: "HorrorMovies",
          Thriller: "Thrillers",
          "Anime Series International TV Shows":
            "AnimeSeriesInternationalTVShows",
          "British TV Shows Docuseries International TV Shows":
            "BritishTVShowsDocuseriesInternationalTVShows",
          Children: "Children",
          "Comedy Dramas International Movies":
            "ComediesDramasInternationalMovies",
          "Comedy Romantic Movies": "ComediesRomanticMovies",
          "Crime TV Shows Docuseries": "CrimeTVShowsDocuseries",
          Documentaries: "Documentaries",
          "Documentaries International Movies":
            "DocumentariesInternationalMovies",
          Docuseries: "Docuseries",
          "Drama International Movies": "DramasInternationalMovies",
          "Drama Romantic Movies": "DramasRomanticMovies",
          "Family Movies": "FamilyMovies",
          Fantasy: "Fantasy",
          "International Movies Thrillers": "InternationalMoviesThrillers",
          "International TV Shows Romantic TV Shows TV Dramas":
            "InternationalTVShowsRomanticTVShowsTVDramas",
          "Kids' TV": "KidsTV",
          "Language TV Shows": "LanguageTVShows",
          Musicals: "Musicals",
          "Nature TV": "NatureTV",
          "Reality TV": "RealityTV",
          Spirituality: "Spirituality",
          "TV Action": "TVAction",
          "TV Comedies": "TVComedies",
          "TV Dramas": "TVDramas",
          "Talk Shows TV Comedies": "TalkShowsTVComedies",
        };

        // Try to find the genre in the map (case-insensitive)
        let dbField = genreMap[movie.genre];

        // If not found directly, try case-insensitive search
        if (!dbField) {
          const lowerCaseGenre = movie.genre.toLowerCase();
          for (const [key, value] of Object.entries(genreMap)) {
            if (key.toLowerCase() === lowerCaseGenre) {
              dbField = value;
              break;
            }
          }
        }

        if (dbField) {
          console.log(
            `Setting genre field ${dbField} to 1 for genre ${movie.genre}`
          );
          updatedMovie[dbField] = 1;
        } else {
          console.warn(`Unknown genre: ${movie.genre}`);
          // Default to Action if genre not found
          updatedMovie.Action = 1;
        }
      }

      console.log("Sending updated movie to server:", updatedMovie);
      const response = await api.put(`/movietitle/${id}`, updatedMovie);
      return response.data;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
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

interface FetchMoviesResponse {
  movieList: Movie[];
  totalNumMovies: number;
}

export const fetchMovies = async (
  pageSize: number,
  pageNum: number
): Promise<FetchMoviesResponse> => {
  try {
    const response = await fetch(
      `${baseUrl}/MovieTitles?pageSize=${pageSize}&pageNum=${pageNum}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects: ", error);
    throw error;
  }
};

// adding an new movie
export const addMovie = async (newMovie: Movie): Promise<Movie> => {
  try {
    const response = await fetch(`${baseUrl}/MovieTitle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMovie),
    });
    if (!response.ok) {
      throw new Error("Failed to add Movie");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding Movie,", error);
    throw error;
  }
};

// updating a movie
export const updateMovie = async (
  showId: string,
  updateMovie: Movie
): Promise<Movie> => {
  try {
    const response = await fetch(`${baseUrl}/movietitle/${showId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateMovie),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating movie:", error);
    throw error;
  }
};
