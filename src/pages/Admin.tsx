import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import { Movie } from "../types/movies";
import NewMovieForm from "../components/NewMovie";
import EditMovie from "../components/EditMovie";


const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast.error("You do not have permission to access this page.");
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const data = await movieService.getMovies(
        currentPage,
        pageSize,
        searchTerm
      );
      setMovies(data.movies || data.movies);
      setTotalPages(
        Math.ceil((data.totalPages || data.totalPages || 0) / pageSize)
      );
    } catch (error) {
      toast.error("Failed to load movies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadMovies();
    }
  }, [isAuthenticated, isAdmin, currentPage, pageSize, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      setCurrentPage(1);
    }, 500);
  };

  const handleCreate = async (
    data: Omit<Movie, "showId" | "averageRating" | "type">
  ) => {
    setIsSubmitting(true);
    try {
      await movieService.createMovie({
        ...data,
        showId: 0,
        type: "Movie",
        averageRating: 0,
      });
      toast.success("Movie created!");
      setShowForm(false);
      loadMovies();
    } catch {
      toast.error("Failed to create movie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Movie) => {
    setIsSubmitting(true);
    try {
      await movieService.updateMovie(data.showId.toString(), data);
      toast.success("Movie updated!");
      setEditingMovie(null);
      loadMovies();
    } catch {
      toast.error("Failed to update movie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (movie: Movie) => {
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      await movieService.deleteMovie(movieToDelete.showId.toString());
      toast.success("Movie deleted!");
      setMovieToDelete(null);
      setShowDeleteModal(false);
      loadMovies();
    } catch {
      toast.error("Failed to delete movie.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {!showForm && !editingMovie && (
          <button
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={() => setShowForm(true)}
          >
            Add Movie
          </button>
        )}
        <br />

        {showForm && (
          <NewMovieForm onSuccess={loadMovies} onCancel={handleCancel} />
        )}

        {editingMovie && (
          <EditMovie
            movie={editingMovie}
            onSuccess={loadMovies}
            onCancel={handleCancel}
          />
        )}

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
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-1"
              >
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
            <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6"
                  >
                    Genre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/12"
                  >
                    Year
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/12"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6"
                  >
                    Director
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6"
                  >
                    Country
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider w-1/12"
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

                    <tr key={movie.showId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {movie.title}
                      </td>
                      <td className="px-6 py-4 truncate text-sm">
                        {movie.genre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {movie.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {movie.averageRating.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 truncate text-sm">
                        {movie.director || "-"}
                      </td>
                      <td className="px-6 py-4 truncate text-sm">
                        {movie.country || "-"}
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
                    Showing page{" "}
                    <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
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
                      for (
                        let i = 1;
                        i <= Math.min(boundaryCount, totalPages);
                        i++
                      ) {
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
                        range.push("ellipsis1");
                      }

                      // Add pages around current page
                      for (let i = startPage; i <= endPage; i++) {
                        if (!range.includes(i)) {
                          range.push(i);
                        }
                      }

                      // Add ellipsis if there's a gap before last page(s)
                      if (endPage < totalPages - boundaryCount) {
                        range.push("ellipsis2");
                      }

                      // Always include last page(s)
                      for (
                        let i = Math.max(
                          totalPages - boundaryCount + 1,
                          boundaryCount + 1
                        );
                        i <= totalPages;
                        i++
                      ) {
                        if (!range.includes(i)) {
                          range.push(i);
                        }
                      }

                      // Render the pagination items
                      return range.map((page) => {
                        if (page === "ellipsis1" || page === "ellipsis2") {
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
                                ? "z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200"
                                : "bg-white dark:bg-gray-700 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
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
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-red-600 dark:text-red-200"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium">
                      Delete Movie
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm">
                        Are you sure you want to delete "{movieToDelete?.title}
                        "? This action cannot be undone.
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
