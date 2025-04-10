import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { movieService, ratingService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import { sanitizeInput } from "../utils/securityUtils";

interface Movie {
  movieId: string;
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  year: number;
  director: string;
  averageRating: number;
  country?: string;
  type?: string;
  cast?: string;
  duration?: string;
  rating?: string;
}

interface Rating {
  ratingId: number;
  userId: number;
  showId: string;
  rating: number;
  review?: string;
  userName?: string;
  createdAt?: string;
}

interface RatingFormData {
  score: number;
  comment: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, kidsMode, kidsModeTimestamp } = useAuth();
  const location = window.location;
  const fromTrending = new URLSearchParams(location.search).get('from') === 'trending';
  const [movie, setMovie] = useState<Movie | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reviewsPerPage] = useState<number>(5);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RatingFormData>();

  useEffect(() => {
    const fetchMovieAndRatings = async () => {
      try {
        if (!id) return;

        // Use the new API service
        const movieData = await movieService.getMovie(id);
        console.log("Movie data from API:", movieData); // Debug log to see if rating is present
        console.log("Movie rating:", movieData.rating); // Debug log specifically for rating
        setMovie(movieData);

        const ratingsData = await ratingService.getRatingsByMovie(id);
        console.log("Fetched ratings data:", ratingsData); // Debug log
        setRatings(ratingsData);

        // Store ratings in the global store for average calculation
        window.movieRatings[id] = ratingsData;

        // Check if user has already rated this movie
        if (isAuthenticated && user) {
          const userRating = ratingsData.find(
            (rating: Rating) => rating.userId === parseInt(user.id)
          );
          if (userRating) {
            setUserRating(userRating);
            setValue("score", userRating.rating);
            // Set the review comment if it exists
            setValue("comment", userRating.review || "");
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        toast.error("Failed to load movie details. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchMovieAndRatings();
  }, [id, isAuthenticated, user, setValue]);

  // Fetch movie recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (!id) return;

        setIsLoadingRecommendations(true);
        const recommendedMovies = await movieService.getRecommendations(id, kidsMode);
        setRecommendations(recommendedMovies);
        setIsLoadingRecommendations(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setIsLoadingRecommendations(false);
      }
    };

    if (!isLoading && movie) {
      fetchRecommendations();
    }
  }, [id, isLoading, movie, kidsModeTimestamp]);

  const onSubmitRating = async (data: RatingFormData) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to rate movies.");
      navigate("/login");
      return;
    }

    if (!id || !movie) return;

    setIsSubmitting(true);
    try {
      // Always send the comment as is, don't sanitize it on the client side
      // The backend will handle sanitization
      console.log("Original comment:", data.comment); // Debug log

      // Use the new API service to create a new rating
      await ratingService.rateMovie(movie.movieId, data.score, data.comment);

      // Refresh ratings - force a new fetch from the server
      const ratingsData = await ratingService.getRatingsByMovie(movie.movieId);
      console.log("Updated ratings after submission:", ratingsData); // Debug log

      // Ensure we're setting the state with the new data
      setRatings([...ratingsData]);

      // Update the global store with the new ratings
      if (id) {
        window.movieRatings[id] = ratingsData;
      }

      // Update movie to get new average rating
      if (id) {
        const movieData = await movieService.getMovie(id);
        setMovie(movieData);
      }

      // Clear the review form for a new rating
      reset({ score: 0, comment: "" });

      // Don't update userRating here, as we want to allow multiple ratings

      toast.success("Rating submitted successfully!");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!userRating || !user || !movie) return;

    try {
      // Use the new API service
      await ratingService.deleteRating(parseInt(user.id), movie.movieId);

      // Refresh ratings
      const ratingsData = await ratingService.getRatingsByMovie(movie.movieId);
      console.log("Updated ratings after deletion:", ratingsData); // Debug log

      // Ensure we're setting the state with the new data
      setRatings([...ratingsData]);

      // Update the global store with the new ratings
      if (id) {
        window.movieRatings[id] = ratingsData;
      }

      // Update movie to get new average rating
      if (id) {
        const movieData = await movieService.getMovie(id);
        setMovie(movieData);
      }

      setUserRating(null);
      reset({ score: 0, comment: "" });

      toast.success("Rating deleted successfully!");
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Failed to delete rating. Please try again later.");
    }
  };

  const renderRatingStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setValue("score", star)}
            className={`${
              interactive ? "cursor-pointer" : "cursor-default"
            } text-yellow-500 focus:outline-none`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={star <= rating ? "currentColor" : "none"}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={star <= rating ? 0 : 1.5}
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
        {!interactive && (
          <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!movie) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
          <p>The movie you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(fromTrending ? "/trending" : "/movies")}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          {fromTrending ? "Back to Trending Now" : "Back to Movies"}
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie Image */}
          <div className="w-full md:w-1/3">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              {movie.imageUrl ? (
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    // If the image fails to load, replace with a placeholder
                    e.currentTarget.src = "/images/movie-collage.png";
                  }}
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 text-gray-500 dark:text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Movie Details */}
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded mr-2">
                {movie.year}
              </span>
              <span className="bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded">
                {movie.genre}
              </span>
              <div className="ml-auto">
                {renderRatingStars(movie.averageRating)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="mb-2">
                  <span className="font-semibold">Type:</span>{" "}
                  {movie.type || "Movie"}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Genre:</span>{" "}
                  {movie.genre}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Release Year:</span>{" "}
                  {movie.year}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Director:</span>{" "}
                  {movie.director || "Unknown"}
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="font-semibold">Cast:</span>{" "}
                  {movie.cast || "Unknown"}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Duration:</span>{" "}
                  {movie.duration || "Unknown"}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Country:</span>{" "}
                  {movie.country || "Unknown"}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Rating:</span>{" "}
                  {movie.rating ? movie.rating : "Not Rated"}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {movie.description}
              </p>
            </div>

            {/* Rating Form */}
            {isAuthenticated && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {userRating ? "Update Your Rating" : "Rate This Movie"}
                </h2>
                <form onSubmit={handleSubmit(onSubmitRating)}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Your Rating
                    </label>
                    <input
                      type="hidden"
                      {...register("score", { required: "Rating is required" })}
                    />
                    {renderRatingStars(
                      errors.score
                        ? 0
                        : watch("score")
                        ? Number(watch("score"))
                        : 0,
                      true
                    )}
                    {errors.score && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.score.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium mb-2"
                    >
                      Your Review (Optional)
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      {...register("comment")}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : userRating
                        ? "Update Rating"
                        : "Submit Rating"}
                    </button>

                    {userRating && (
                      <button
                        type="button"
                        onClick={handleDeleteRating}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Delete Rating
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* User Ratings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">User Reviews</h2>
              {ratings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <>
                  <div className="space-y-6">
                    {/* Calculate pagination */}
                    {ratings
                      .slice(
                        (currentPage - 1) * reviewsPerPage,
                        currentPage * reviewsPerPage
                      )
                      .map((rating) => (
                        <div
                          key={rating.ratingId}
                          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              {renderRatingStars(rating.rating)}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {rating.userName || `User ID: ${rating.userId}`}
                              </div>
                              {rating.createdAt && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    rating.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          {rating.review ? (
                            <p className="text-gray-700 dark:text-gray-300 mt-2 border-t pt-2 border-gray-200 dark:border-gray-700">
                              {rating.review}
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 mt-2 italic border-t pt-2 border-gray-200 dark:border-gray-700">
                              No written review provided.
                            </p>
                          )}

                          {/* Delete button for user's own reviews or admin */}
                          {user &&
                            (parseInt(user.id) === rating.userId ||
                              user.roles?.includes("Admin")) && (
                              <div className="mt-2 text-right">
                                <button
                                  onClick={async () => {
                                    try {
                                      await ratingService.deleteSingleRating(
                                        rating.ratingId
                                      );

                                      // Refresh ratings
                                      const ratingsData =
                                        await ratingService.getRatingsByMovie(
                                          movie.movieId
                                        );
                                      console.log(
                                        "Updated ratings after single deletion:",
                                        ratingsData
                                      ); // Debug log
                                      setRatings([...ratingsData]);

                                      // Update the global store with the new ratings
                                      if (id) {
                                        window.movieRatings[id] = ratingsData;
                                      }

                                      // Update movie to get new average rating
                                      if (id) {
                                        const movieData =
                                          await movieService.getMovie(id);
                                        setMovie(movieData);
                                      }

                                      toast.success(
                                        "Review deleted successfully!"
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error deleting review:",
                                        error
                                      );
                                      toast.error(
                                        "Failed to delete review. Please try again later."
                                      );
                                    }
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                        </div>
                      ))}
                  </div>

                  {/* Pagination controls */}
                  {ratings.length > reviewsPerPage && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded-md mr-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <div className="flex space-x-1">
                          {Array.from(
                            {
                              length: Math.ceil(
                                ratings.length / reviewsPerPage
                              ),
                            },
                            (_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                  currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {i + 1}
                              </button>
                            )
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(ratings.length / reviewsPerPage)
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(ratings.length / reviewsPerPage)
                          }
                          className="px-3 py-1 rounded-md ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}

                  {/* Rating summary */}
                  <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      Rating Summary
                    </h3>
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Average Rating:</span>
                      {renderRatingStars(movie.averageRating)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Based on {ratings.length}{" "}
                      {ratings.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Movie Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommendations.map((rec) => (
                <Link
                  key={rec.movieId}
                  to={`/movies/${rec.movieId}${fromTrending ? '?from=trending' : ''}`}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    {rec.imageUrl ? (
                      <img
                        src={rec.imageUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If the image fails to load, replace with a placeholder
                          e.currentTarget.src = "/images/movie-collage.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-10 h-10 text-gray-500 dark:text-gray-400"
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
                      {rec.year}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-md font-semibold mb-1 truncate">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {rec.genre}
                    </p>
                    {renderRatingStars(rec.averageRating)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Loading state for recommendations */}
        {isLoadingRecommendations && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MovieDetail;
