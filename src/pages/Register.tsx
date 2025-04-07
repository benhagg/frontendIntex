// Updated Register component with white input backgrounds
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Layout from "../components/Layout";

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

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

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
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10 bg-gray-200 rounded-lg">
        <h2 className="text-4xl font-bold mb-8 text-center">Create Account</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label>Full Name:</label>
            <input
              {...register("fullName")}
              className="w-full border rounded p-2 bg-white"
            />
            <label>Phone Number:</label>
            <input
              {...register("phone")}
              className="w-full border rounded p-2 bg-white"
            />
            <label>Email:</label>
            <input
              {...register("email")}
              className="w-full border rounded p-2 bg-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Age:</label>
                <input
                  {...register("age")}
                  className="w-full border rounded p-2 bg-white"
                />
              </div>
              <div>
                <label>Gender:</label>
                <input
                  {...register("gender")}
                  className="w-full border rounded p-2 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>City:</label>
                <input
                  {...register("city")}
                  className="w-full border rounded p-2 bg-white"
                />
              </div>
              <div>
                <label>State:</label>
                <input
                  {...register("state")}
                  className="w-full border rounded p-2 bg-white"
                />
              </div>
            </div>
            <label>Zip Code:</label>
            <input
              {...register("zip")}
              className="w-full border rounded p-2 bg-white"
            />
          </div>

          <div>
            <label>Username:</label>
            <input
              {...register("username")}
              className="w-full border rounded p-2 bg-white"
            />
            <label>Password:</label>
            <input
              type="password"
              {...register("password")}
              className="w-full border rounded p-2 bg-white"
            />
            <label>Confirm Password:</label>
            <input
              type="password"
              {...register("confirmPassword", {
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="w-full border rounded p-2 bg-white"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}

            <label className="mt-4 block">
              What streaming services do you already have?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {streamingServices.map((service) => (
                <label key={service} className="flex items-center">
                  <input
                    type="checkbox"
                    value={service}
                    {...register("services")}
                    className="mr-2"
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
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Register;
