import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';

interface Movie {
  movieId: number;
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  year: number;
  director: string;
  averageRating: number;
}

interface MovieFormData {
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  year: number;
  director: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchTimeoutRef = React.useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MovieFormData>();

  // Check if user is admin, if not redirect to home
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast.error('You do not have permission to access this page.');
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieService.getMovies(currentPage, pageSize, undefined, searchTerm);
        setMovies(response.movies);
        setTotalPages(response.totalPages);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies. Please try again later.');
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchMovies();
    }
  }, [isAuthenticated, isAdmin, currentPage, pageSize, searchTerm]);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout to update search after typing stops
    searchTimeoutRef.current = window.setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce
  };

  const onSubmit = async (data: MovieFormData) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('You do not have permission to perform this action.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMovie) {
        // Update existing movie
        await movieService.updateMovie(editingMovie.movieId.toString(), data);
        toast.success('Movie updated successfully!');
      } else {
        // Create new movie
        await movieService.createMovie(data);
        toast.success('Movie created successfully!');
      }

      // Refresh movies list
      const response = await movieService.getMovies(currentPage, pageSize);
      setMovies(response.movies);
      setTotalPages(response.totalPages);

      // Reset form
      reset();
      setEditingMovie(null);
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error('Failed to save movie. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setValue('title', movie.title);
    setValue('genre', movie.genre);
    setValue('description', movie.description || '');
    setValue('imageUrl', movie.imageUrl || '');
    setValue('year', movie.year);
    setValue('director', movie.director || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (movie: Movie) => {
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete || !isAuthenticated || !isAdmin) return;

    try {
      await movieService.deleteMovie(movieToDelete.movieId.toString());
      
      // Refresh movies list
      const response = await movieService.getMovies(currentPage, pageSize);
      setMovies(response.movies);
      setTotalPages(response.totalPages);
      
      toast.success('Movie deleted successfully!');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Failed to delete movie. Please try again later.');
    } finally {
      setShowDeleteModal(false);
      setMovieToDelete(null);
    }
  };

  const handleCancel = () => {
    setEditingMovie(null);
    reset();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Movie Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium mb-1">
                  Genre *
                </label>
                <input
                  id="genre"
                  type="text"
                  {...register('genre', { required: 'Genre is required' })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  Year *
                </label>
                <input
                  id="year"
                  type="number"
                  {...register('year', {
                    required: 'Year is required',
                    min: {
                      value: 1888,
                      message: 'Year must be 1888 or later',
                    },
                    max: {
                      value: new Date().getFullYear() + 5,
                      message: `Year must be ${new Date().getFullYear() + 5} or earlier`,
                    },
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="director" className="block text-sm font-medium mb-1">
                  Director
                </label>
                <input
                  id="director"
                  type="text"
                  {...register('director')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  {...register('imageUrl')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              {editingMovie && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingMovie
                  ? 'Update Movie'
                  : 'Add Movie'}
              </button>
            </div>
          </form>
        </div>

        {/* Movies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Movies</h2>
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="w-full">
              <label htmlFor="search" className="block text-sm font-medium mb-1">
                Search Movies
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by title..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Genre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Year
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {movies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm">
                      No movies found.
                    </td>
                  </tr>
                ) : (
                  movies.map((movie) => (
                    <tr key={movie.movieId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {movie.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {movie.genre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {movie.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {movie.averageRating.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(movie)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(movie)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    
                    {/* Page numbers with limited display */}
                    {(() => {
                      // Define how many page numbers to show around the current page
                      const siblingCount = 1;
                      const boundaryCount = 1;
                      
                      // Calculate range to display
                      const range = [];
                      
                      // Always include first page(s)
                      for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
                        range.push(i);
                      }
                      
                      // Calculate start and end of current page range
                      const startPage = Math.max(
                        boundaryCount + 1,
                        currentPage - siblingCount
                      );
                      const endPage = Math.min(
                        totalPages - boundaryCount,
                        currentPage + siblingCount
                      );
                      
                      // Add ellipsis if there's a gap after first page(s)
                      if (startPage > boundaryCount + 1) {
                        range.push('ellipsis1');
                      }
                      
                      // Add pages around current page
                      for (let i = startPage; i <= endPage; i++) {
                        if (!range.includes(i)) {
                          range.push(i);
                        }
                      }
                      
                      // Add ellipsis if there's a gap before last page(s)
                      if (endPage < totalPages - boundaryCount) {
                        range.push('ellipsis2');
                      }
                      
                      // Always include last page(s)
                      for (let i = Math.max(totalPages - boundaryCount + 1, boundaryCount + 1); i <= totalPages; i++) {
                        if (!range.includes(i)) {
                          range.push(i);
                        }
                      }
                      
                      // Render the pagination items
                      return range.map((page) => {
                        if (page === 'ellipsis1' || page === 'ellipsis2') {
                          return (
                            <span
                              key={`ellipsis-${page}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium"
                            >
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={`page-${page}`}
                            onClick={() => handlePageChange(Number(page))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                                : 'bg-white dark:bg-gray-700 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-200">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium">
                      Delete Movie
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm">
                        Are you sure you want to delete "{movieToDelete?.title}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Admin;
