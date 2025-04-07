import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, ratingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useForm, useWatch } from 'react-hook-form';
import Layout from '../components/Layout';

interface Movie {
  movieId: string;
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  year: number;
  director: string;
  averageRating: number;
}

interface Rating {
  userId: number;
  showId: string;
  rating: number;
}

interface RatingFormData {
  score: number;
  comment: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  
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
        setMovie(movieData);
        
        const ratingsData = await ratingService.getRatingsByMovie(id);
        setRatings(ratingsData);
        
        // Store ratings in the global store for average calculation
        window.movieRatings[id] = ratingsData;
        
        // Check if user has already rated this movie
        if (isAuthenticated && user) {
          const userRating = ratingsData.find((rating: Rating) => rating.userId === parseInt(user.id));
          if (userRating) {
            setUserRating(userRating);
            setValue('score', userRating.rating);
            // Note: The new MovieRating model doesn't have a comment field
            setValue('comment', '');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        toast.error('Failed to load movie details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchMovieAndRatings();
  }, [id, isAuthenticated, user, setValue]);

  const onSubmitRating = async (data: RatingFormData) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to rate movies.');
      navigate('/login');
      return;
    }
    
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      // Use the new API service
      await ratingService.rateMovie(id, data.score);
      
      // Refresh ratings
      const ratingsData = await ratingService.getRatingsByMovie(id);
      setRatings(ratingsData);
      
      // Update the global store with the new ratings
      window.movieRatings[id] = ratingsData;
      
      // Update movie to get new average rating
      const movieData = await movieService.getMovie(id);
      setMovie(movieData);
      
      // Find user's new rating
      if (user) {
        const newUserRating = ratingsData.find((rating: Rating) => rating.userId === parseInt(user.id));
        if (newUserRating) {
          setUserRating(newUserRating);
        }
      }
      
      toast.success(userRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again later.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!userRating || !user) return;
    
    try {
      // Use the new API service
      if (!id) return;
      await ratingService.deleteRating(parseInt(user.id), id);
      
      // Refresh ratings
      if (!id) return;
      const ratingsData = await ratingService.getRatingsByMovie(id);
      setRatings(ratingsData);
      
      // Update the global store with the new ratings
      window.movieRatings[id] = ratingsData;
      
      // Update movie to get new average rating
      const movieData = await movieService.getMovie(id);
      setMovie(movieData);
      
      setUserRating(null);
      reset({ score: 0, comment: '' });
      
      toast.success('Rating deleted successfully!');
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to delete rating. Please try again later.');
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
            onClick={() => interactive && setValue('score', star)}
            className={`${
              interactive ? 'cursor-pointer' : 'cursor-default'
            } text-yellow-500 focus:outline-none`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={star <= rating ? 'currentColor' : 'none'}
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
        {!interactive && <span className="ml-1 text-sm">{rating.toFixed(1)}</span>}
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie Image */}
          <div className="w-full md:w-1/3">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              {movie.imageUrl ? (
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-500 dark:text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
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
            
            {movie.director && (
              <p className="mb-4">
                <span className="font-semibold">Director:</span> {movie.director}
              </p>
            )}
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">{movie.description}</p>
            </div>
            
            {/* Rating Form */}
            {isAuthenticated && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {userRating ? 'Update Your Rating' : 'Rate This Movie'}
                </h2>
                <form onSubmit={handleSubmit(onSubmitRating)}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <input
                      type="hidden"
                      {...register('score', { required: 'Rating is required' })}
                    />
                    {renderRatingStars(
                      errors.score ? 0 : (watch('score') ? Number(watch('score')) : 0),
                      true
                    )}
                    {errors.score && (
                      <p className="mt-2 text-sm text-red-600">{errors.score.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      {...register('comment')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? 'Submitting...'
                        : userRating
                        ? 'Update Rating'
                        : 'Submit Rating'}
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
                <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div
                      key={`${rating.userId}-${rating.showId}`}
                      className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {renderRatingStars(rating.rating)}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          User ID: {rating.userId}
                        </span>
                      </div>
                      {/* Note: The new MovieRating model doesn't have a comment field */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MovieDetail;
