import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Movie } from "../types/movies";
import { movieService } from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const TrendingNow: React.FC = () => {
  const { kidsMode, kidsModeTimestamp } = useAuth();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setIsLoading(true);
        
        // Hardcoded data from the CSV
        const csvData = [
          { UserBasicRecs: "s1004", UserLocRecs: "s1004", UserStreamRecs: "s1004", TitleBasicRecs: "s7796", MostReviewed: "s2179" },
          { UserBasicRecs: "s1006", UserLocRecs: "s1006", UserStreamRecs: "s1006", TitleBasicRecs: "s4412", MostReviewed: "s3282" },
          { UserBasicRecs: "s1018", UserLocRecs: "s1018", UserStreamRecs: "s1018", TitleBasicRecs: "s30", MostReviewed: "s540" },
          { UserBasicRecs: "s1040", UserLocRecs: "s1040", UserStreamRecs: "s1040", TitleBasicRecs: "s4564", MostReviewed: "s6508" },
          { UserBasicRecs: "s1060", UserLocRecs: "s1060", UserStreamRecs: "s1060", TitleBasicRecs: "s6446", MostReviewed: "s7748" },
          { UserBasicRecs: "s1061", UserLocRecs: "s1061", UserStreamRecs: "s1061", TitleBasicRecs: "s7895", MostReviewed: "s8804" },
          { UserBasicRecs: "s1087", UserLocRecs: "s1080", UserStreamRecs: "s1138", TitleBasicRecs: "s7868", MostReviewed: "s3921" },
          { UserBasicRecs: "s1138", UserLocRecs: "s1119", UserStreamRecs: "s12", TitleBasicRecs: "s5059", MostReviewed: "s322" },
          { UserBasicRecs: "s119", UserLocRecs: "s119", UserStreamRecs: "s1231", TitleBasicRecs: "s827", MostReviewed: "s2932" }
        ];

        // Create a set of unique movie IDs from the CSV data
        const uniqueMovieIds = new Set<string>();
        csvData.forEach(row => {
          uniqueMovieIds.add(row.TitleBasicRecs);
          uniqueMovieIds.add(row.MostReviewed);
        });

        // Fetch actual movie data for each unique ID
        const moviePromises = Array.from(uniqueMovieIds).map(id => 
          movieService.getMovie(id, kidsMode).catch(error => {
            console.error(`Error fetching movie ${id}:`, error);
            return null;
          })
        );

        const movies = await Promise.all(moviePromises);
        
        // Filter out any null results (failed fetches)
        const validMovies = movies.filter(movie => movie !== null) as Movie[];
        
        setTrendingMovies(validMovies);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        toast.error("Failed to load trending movies. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchTrendingMovies();
  }, [kidsModeTimestamp]);

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={
              i < fullStars
                ? "currentColor"
                : i === fullStars && hasHalfStar
                ? "url(#half-star)"
                : "none"
            }
            stroke="currentColor"
            className="w-5 h-5 text-yellow-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={
                i < fullStars || (i === fullStars && hasHalfStar) ? 0 : 1.5
              }
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
            {i === fullStars && hasHalfStar && (
              <defs>
                <linearGradient
                  id="half-star"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            )}
          </svg>
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🔥 HOTTEST 18 Titles In The World 🔥</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">What's Hot Right Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trendingMovies.map((movie) => (
                <Link
                  key={movie.showId}
                  to={`/movies/${movie.showId}?from=trending`}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 relative">
                    {movie.imageUrl ? (
                      <img
                        src={movie.imageUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12 text-gray-500 dark:text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {movie.releaseYear}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 truncate">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {movie.genre}
                    </p>
                    {renderRatingStars(movie.averageRating)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrendingNow;
