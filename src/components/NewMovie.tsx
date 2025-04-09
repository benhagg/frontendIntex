import { useForm } from "react-hook-form";
import { Movie } from "../types/movies";
import { movieService } from "../services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

interface NewMovieFormProps {
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
  country: string;
};

const NewMovieForm = ({ onSuccess, onCancel }: NewMovieFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormData>();

  const [genres, setGenres] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const genresResponse = await movieService.getGenres();
        setGenres(genresResponse);
        
        const typesResponse = await movieService.getTypes();
        setTypes(typesResponse);
        
        const countriesResponse = await movieService.getCountries();
        setCountries(countriesResponse);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: MovieFormData) => {
    try {
      const newMovie: Movie = {
        ...data,
        averageRating: 0,
      };

      await movieService.createMovie(newMovie);
      toast.success("Movie created successfully!");
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating movie:", error);
      toast.error("Failed to create movie. Please try again.");
    }
  };

  const [genres, setGenres] = useState<string[]>([]);

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

  return (
    <>
      {/* Movie Form */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4"></h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {isSubmitting ? "Saving..." : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
export default NewMovieForm;
function setGenres(response: any) {
  response;
  throw new Error("Function not implemented.");
}
