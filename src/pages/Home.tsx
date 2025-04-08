import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="background-container">
        <div className="overlay"></div>
        <div className="content">
          <div className="mx-auto max-w-2xl py-4 sm:py-6 lg:py-8">
            <div className="text-center">
              {isAuthenticated && user?.name && (
                <p className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">
                  Welcome, {user.name}
                </p>
              )}
              <img className="logo-big" src="/images/whitelogobig.png" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Discover and Rate Your Favorite Movies
              </h1>
              <p className="mt-6 text-lg leading-8">
                Join our community of movie enthusiasts. Browse through a
                curated collection of films, share your thoughts, and discover
                new favorites based on community ratings.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/login"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-gray-100 dark:bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Create an account <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
