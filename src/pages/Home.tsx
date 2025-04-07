import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Discover and Rate Your Favorite Movies
            </h1>
            <p className="mt-6 text-lg leading-8">
              Join our community of movie enthusiasts. Browse through a curated collection of films, 
              share your thoughts, and discover new favorites based on community ratings.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/movies"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Browse Movies
              </Link>
              <Link to="/register" className="text-sm font-semibold leading-6">
                Create an account <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
