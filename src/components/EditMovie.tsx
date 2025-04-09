import { useForm } from "react-hook-form";
import { Movie } from "../types/movies";
import { movieService, updateMovie } from "../services/api";
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
};

const EditMovieForm = ({ movie, onSuccess, onCancel }: EditMovieFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormData>();

  const [genres, setGenres] = useState<string[]>([]);

  // fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movieService.getGenres();
        setGenres(response);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // reset form after genres are loaded
  useEffect(() => {
    if (genres.length > 0) {
      reset({
        showId: movie.showId,
        title: movie.title,
        type: movie.type,
        genre: movie.genre,
        releaseYear: movie.releaseYear,
        director: movie.director,
        imageUrl: movie.imageUrl,
        description: movie.description,
        cast: movie.cast,
        duration: movie.duration,
      });
    }
  }, [genres, movie, reset]);

  const onSubmit = async (data: MovieFormData) => {
    const updatedMovie: Movie = {
      ...movie,
      ...data,
      releaseYear: Number(data.releaseYear), // convert string to number
      cast: data.cast || "", // ensure empty string instead of undefined
      duration: data.duration || "",
      director: data.director || "",
    };

    const id = updatedMovie.showId?.toString();

    if (!id) {
      console.error("Missing showId:", updatedMovie);
      toast.error("Missing Show ID. Cannot update movie.");
      return;
    }

    // Log the data you're sending
    console.log("Submitting update:", {
      id,
      updatedMovie,
    });

    try {
      await updateMovie(id, updatedMovie);
      toast.success("Movie updated!");
      onSuccess();
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update movie.");
    }
  };

  return (
    <>
      {/* Movie Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4"></h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={movie.showId} type="hidden" {...register("showId")} />
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register("title", { required: "Title is required" })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select a type</option>
                <option value="Movie">Movie</option>
                <option value="TV Show">TV Show</option>
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="block w-full rounded-md border-gray-300 shadow-sm ..."
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
                className="block w-full rounded-md border-gray-300 shadow-sm ..."
              />
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
