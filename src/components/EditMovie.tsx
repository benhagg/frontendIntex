import { useForm } from "react-hook-form";
import { Movie } from "../types/movies";
import { movieService } from "../services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

interface EditMovieFormProps {
  movie: Movie;
  onSuccess: () => void;
  onCancel: () => void;
}

type MovieFormData = {
  showId: string;
  title: string;
  type: string;
  genre: string;
  description: string;
  imageUrl: string;
  releaseYear: number;
  director: string;
  cast: string;
  duration: string;
  country: string; // Added country field
  rating: string; // Added rating field
};

const EditMovieForm = ({ movie, onSuccess, onCancel }: EditMovieFormProps) => {
  const [genres, setGenres] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormData>();

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresResponse, typesResponse, countriesResponse] = await Promise.all([
          movieService.getGenres(),
          movieService.getTypes(),
          movieService.getCountries()
        ]);
        
        setGenres(genresResponse);
        setTypes(typesResponse);
        setCountries(countriesResponse);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  // Set form values when component mounts and when movie data changes
  useEffect(() => {
    // Handle both showId and movieId properties (API returns movieId but our type expects showId)
    const id = movie.showId || (movie as any).movieId || "";
    
    // Wait for types to be loaded before setting values
    if (types.length > 0) {
      // Set initial values immediately
      setValue("showId", id);
      setValue("title", movie.title || "");
      setValue("type", movie.type || "Movie");
      
      // Log the movie data for debugging
      console.log("Movie data:", movie);
      console.log("Movie genre:", movie.genre);
      console.log("Movie rating:", movie.rating); // Debug log for rating
      
      // Set the genre value directly from the movie object
      setValue("genre", movie.genre || "");
      
      setValue("releaseYear", movie.releaseYear || 2000);
      setValue("director", movie.director || "");
      setValue("imageUrl", movie.imageUrl || "");
      setValue("description", movie.description || "");
      setValue("cast", movie.cast || "");
      setValue("duration", movie.duration || "");
      setValue("country", movie.country || "");
      
      // Set the rating value and ensure it's a string
      const ratingValue = movie.rating || "";
      console.log("Setting rating value:", ratingValue); // Debug log for rating value
      setValue("rating", ratingValue);
      
      // Log the values for debugging
      console.log("Setting form values:", {
        showId: id,
        title: movie.title,
        type: movie.type,
        genre: movie.genre,
        releaseYear: movie.releaseYear,
        director: movie.director,
        imageUrl: movie.imageUrl,
        description: movie.description,
        cast: movie.cast,
        duration: movie.duration,
        country: movie.country,
        rating: ratingValue,
      });
    }
  }, [movie, setValue, types]);

  const onSubmit = async (data: MovieFormData) => {
    // Handle both showId and movieId properties
    const id = data.showId || "";
    
    if (!id) {
      console.error("Missing ID:", data);
      toast.error("Missing Movie ID. Cannot update movie.");
      return;
    }
    
    const updatedMovie: Movie = {
      ...movie,
      ...data,
      showId: id, // Ensure showId is set
      releaseYear: Number(data.releaseYear), // convert string to number
      cast: data.cast || "", // ensure empty string instead of undefined
      duration: data.duration || "",
      director: data.director || "",
      type: data.type || "Movie", // ensure type is set
    };

    // Log the data you're sending
    console.log("Submitting update:", {
      id,
      updatedMovie,
    });

    try {
      // Use the movieService.updateMovie method
      const result = await movieService.updateMovie(id, updatedMovie);
      console.log("Update result:", result);
      toast.success("Movie updated successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update:", error);
      const errorMessage = error.response?.data?.message || "Failed to update movie.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* Movie Form */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4"></h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" {...register("showId")} />
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register("title", { required: "Title is required" })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <select
                id="type"
                {...register("type", { required: "Type is required" })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a type</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium mb-1">
                Genre
              </label>
              <select
                id="genre"
                {...register("genre", { required: "Genre is required" })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              {errors.genre && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.genre.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="releaseYear"
                className="block text-sm font-medium mb-1"
              >
                Release Year
              </label>
              <input
                id="releaseYear"
                type="number"
                {...register("releaseYear", {
                  required: "Year is required",
                  min: {
                    value: 1888,
                    message: "Year must be 1888 or later",
                  },
                  max: {
                    value: new Date().getFullYear() + 5,
                    message: `Year must be ${
                      new Date().getFullYear() + 5
                    } or earlier`,
                  },
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.releaseYear && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.releaseYear.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="director"
                className="block text-sm font-medium mb-1"
              >
                Director
              </label>
              <input
                id="director"
                type="text"
                {...register("director")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="cast" className="block text-sm font-medium mb-1">
                Cast
              </label>
              <input
                id="cast"
                type="text"
                {...register("cast")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium mb-1"
              >
                Duration
              </label>
              <input
                id="duration"
                type="text"
                {...register("duration")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium mb-1"
              >
                Country
              </label>
              <input
                id="country"
                type="text"
                {...register("country")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium mb-1"
              >
                Rating (PG, PG-13, R, etc.)
              </label>
              <select
                id="rating"
                {...register("rating")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a rating</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
                <option value="TV-Y">TV-Y</option>
                <option value="TV-Y7">TV-Y7</option>
                <option value="TV-G">TV-G</option>
                <option value="TV-PG">TV-PG</option>
                <option value="TV-14">TV-14</option>
                <option value="TV-MA">TV-MA</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium mb-1"
              >
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                {...register("imageUrl")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Update Movie"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditMovieForm;
