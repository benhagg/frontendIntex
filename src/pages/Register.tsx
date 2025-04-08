// Updated Register component with enhanced features and dark mode support
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import NotLoggedInLayout from "../components/notloggedinLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface RegisterFormData {
  fullName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: string;
  city: string;
  state: string;
  zip: string;
  services: string[];
}

// US States array for dropdown
const usStates = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    mode: "onChange", // Enable validation as fields change
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(", ")
          : "Registration failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const streamingServices = [
    "Netflix",
    "Disney+",
    "Amazon Prime",
    "Paramount+",
    "Max",
    "Hulu",
    "Apple TV+",
    "Peacock",
  ];

  return (
    <NotLoggedInLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 bg-gray-200 dark:bg-gray-800 rounded-lg">
        <h2 className="text-4xl font-bold mb-8 text-center dark:text-white">
          Create Account
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">
              Full Name:
            </label>
            <input
              {...register("fullName", { required: "Full name is required" })}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.fullName.message}
              </p>
            )}

            <label className="block text-sm font-medium mb-1 mt-4 dark:text-white">
              Phone Number:
            </label>
            <input
              {...register("phone", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              })}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="1234567890"
              maxLength={10}
              type="tel"
              inputMode="numeric"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.phone.message}
              </p>
            )}

            <label className="block text-sm font-medium mb-1 mt-4 dark:text-white">
              Email:
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Age:
                </label>
                <input
                  type="number"
                  {...register("age", {
                    min: {
                      value: 13,
                      message: "Must be at least 13 years old",
                    },
                    max: { value: 120, message: "Age cannot exceed 120" },
                  })}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {errors.age && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Gender:
                </label>
                <select
                  {...register("gender")}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  City:
                </label>
                <input
                  {...register("city", { required: "City is required" })}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {errors.city && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  State:
                </label>
                <select
                  {...register("state", { required: "State is required" })}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Select state...</option>
                  {usStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <label className="block text-sm font-medium mb-1 mt-4 dark:text-white">
              Zip Code:
            </label>
            <input
              {...register("zip", {
                required: "Zip code is required",
                pattern: {
                  value: /^\d{5}$/,
                  message: "Please enter a valid 5-digit zip code",
                },
              })}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              maxLength={5}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.zip && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.zip.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">
              Username:
            </label>
            <input
              {...register("username", { required: "Username is required" })}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.username && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.username.message}
              </p>
            )}

            <label className="block text-sm font-medium mb-1 mt-4 dark:text-white">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 10,
                    message: "Password must be at least 10 characters",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
                    message:
                      "Password must include uppercase, lowercase, number and special character",
                  },
                })}
                className="w-full border rounded p-2 pr-10 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <FaEye className="text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}

            <label className="block text-sm font-medium mb-1 mt-4 dark:text-white">
              Confirm Password:
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className="w-full border rounded p-2 pr-10 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <FaEye className="text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}

            <label className="mt-4 block text-sm font-medium dark:text-white">
              What streaming services do you already have?
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {streamingServices.map((service) => (
                <label
                  key={service}
                  className="flex items-center dark:text-white"
                >
                  <input
                    type="checkbox"
                    value={service}
                    {...register("services")}
                    className="mr-2 accent-blue-600"
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm dark:text-white">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold leading-6 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </NotLoggedInLayout>
  );
};

export default Register;
