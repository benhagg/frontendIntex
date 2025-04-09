import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import "./layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    // Get dark mode preference from cookie
    return Cookies.get("darkMode") === "true";
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    // Store preference in a browser-accessible cookie (not httpOnly)
    Cookies.set("darkMode", String(newMode), { expires: 365 });
  };

  // Apply dark mode class to body
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navigation = [
    { name: "Movies", href: "/movies", current: false },
    { name: "Privacy", href: "/privacy", current: false },
  ];

  if (isAdmin) {
    navigation.push({ name: "Admin", href: "/admin", current: false });
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Disclosure
        as="nav"
        className={`${darkMode ? "bg-gray-800" : "bg-blue-600"}`}
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link
                      to={isAuthenticated ? "/movies" : "/"}
                      className="logo"
                    >
                      <img src="/images/whitelogo.png" alt="logo" />
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-opacity-75`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <button
                      type="button"
                      onClick={toggleDarkMode}
                      className="rounded-full p-1 text-white hover:bg-opacity-75 focus:outline-none"
                    >
                      {darkMode ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                          />
                        </svg>
                      )}
                    </button>

                    {isAuthenticated ? (
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full text-sm focus:outline-none">
                            <span className="sr-only">Open user menu</span>
                            <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                              {user?.email.charAt(0).toUpperCase()}
                            </div>
                          </Menu.Button>
                        </div>
                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items
                            className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                              darkMode ? "bg-gray-700" : "bg-white"
                            }`}
                          >
                            {/* My Reviews Link */}
                            {/* <Menu.Item>
                              {() => (
                                <Link
                                  to={`/reviews/${user?.userId}`} // adjust key name if needed
                                  className={`block px-4 py-2 text-sm ${
                                    darkMode
                                      ? "text-white hover:bg-gray-600"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  My Reviews
                                </Link>
                              )}
                            </Menu.Item> */}
                            <Menu.Item>
                              {() => (
                                <button
                                  onClick={handleLogout}
                                  className={`block px-4 py-2 text-sm w-full text-left ${
                                    darkMode
                                      ? "text-white hover:bg-gray-600"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    ) : (
                      <div className="flex space-x-4">
                        <Link
                          to="/login"
                          className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-opacity-75"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-opacity-75"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-opacity-75 focus:outline-none">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-700 pb-3 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                          {user?.email.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">
                          {user?.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className="ml-auto rounded-full p-1 text-white hover:bg-opacity-75 focus:outline-none"
                      >
                        {darkMode ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      <button
                        onClick={handleLogout}
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75 w-full text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 space-y-1 px-2">
                    <Link
                      to="/login"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="flex-grow mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer
        className={`py-6 ${
          darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 Movie Ratings. All rights reserved.</p>
            </div>
            <div>
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
