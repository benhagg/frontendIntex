import { useEffect, useState } from "react";
import { authService } from "../services/api";
import Layout from "../components/Layout";
import { UserInfo } from "../types/userInfo";
import { toast, ToastContainer } from "react-toastify";
import { USStateAbbreviation } from "../types/locations";

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await authService.getUserInfo();
      setUserInfo(data);
      setFormData(data); // for editing
    };
    fetchUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;

    const { name, value } = e.target;

    if (name === "age") {
      const numericValue = parseInt(value);
      if (isNaN(numericValue) || numericValue < 0 || numericValue > 120) {
        toast.error("Please enter a valid age between 0 and 120.");
        return;
      }
      setFormData({ ...formData, age: numericValue.toString() });
    } else if (name === "phone") {
      const rawDigits = value.replace(/\D/g, ""); // just numbers
      setFormData({ ...formData, phone: rawDigits });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const response = await authService.updateUser(formData!); // You’ll define this in the next step
      setUserInfo(response);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

    if (digitsOnly.length === 0) return ""; // Don't show anything if no digits

    const part1 = digitsOnly.slice(0, 3);
    const part2 = digitsOnly.slice(3, 6);
    const part3 = digitsOnly.slice(6, 10);

    if (digitsOnly.length < 4) return `(${part1}`;
    if (digitsOnly.length < 7) return `(${part1}) ${part2}`;
    return `(${part1}) ${part2} - ${part3}`;
  };

  if (!userInfo) return <div>Loading...</div>;

  const availableServices = [
    "Netflix",
    "AmazonPrime",
    "DisneyPlus",
    "Hulu",
    "Max",
    "AppleTVPlus",
    "ParamountPlus",
    "Peacock",
  ];

  const serviceDisplayNames: Record<string, string> = {
    Netflix: "Netflix",
    AmazonPrime: "Amazon Prime",
    DisneyPlus: "Disney+",
    Hulu: "Hulu",
    Max: "Max",
    AppleTVPlus: "Apple TV+",
    ParamountPlus: "Paramount+",
    Peacock: "Peacock",
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 w-[600px]">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        {isEditing ? (
          <div className="space-y-4">
            <label className="block">
              First Name:
              <input
                type="text"
                name="firstName"
                value={formData?.firstName || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              Last Name:
              <input
                type="text"
                name="lastName"
                value={formData?.lastName || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              Phone:
              <input
                type="text"
                name="phone"
                value={formatPhoneNumber(formData?.phone || "")}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              City:
              <input
                type="text"
                name="city"
                value={formData?.city || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              State:
              <input
                type="text"
                name="state"
                value={formData?.state || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              Zip:
              <input
                type="text"
                name="zip"
                value={formData?.zip || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              Age:
              <input
                type="number"
                name="age"
                value={formData?.age || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              Gender:
              <select
                name="gender"
                value={formData?.gender || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1"
              >
                <option value="">Select an option</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
            <label className="block mb-2">Services:</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {availableServices.map((service) => (
                <label key={service} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="services"
                    value={service}
                    checked={formData?.services?.includes(service) || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const value = e.target.value;
                      const currentServices = formData?.services || [];

                      const updatedServices = checked
                        ? [...currentServices, value]
                        : currentServices.filter((s) => s !== value);

                      setFormData((prev) => ({
                        ...prev!,
                        services: updatedServices,
                      }));
                    }}
                    className="mr-2"
                  />
                  {serviceDisplayNames[service]}
                </label>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> {userInfo.email}
            </p>
            <p>
              <strong>First Name:</strong> {userInfo.firstName || "—"}
            </p>
            <p>
              <strong>Last Name:</strong> {userInfo.lastName || "—"}
            </p>
            <p>
              <strong>Phone:</strong> {userInfo.phone || "—"}
            </p>
            <p>
              <strong>City:</strong> {userInfo.city || "—"}
            </p>
            <p>
              <strong>State:</strong> {userInfo.state || "—"}
            </p>
            <p>
              <strong>Zip:</strong> {userInfo.zip || "—"}
            </p>
            <p>
              <strong>Age:</strong> {userInfo.age || "—"}
            </p>
            <p>
              <strong>Gender:</strong> {userInfo.gender || "—"}
            </p>
            <p>
              <strong>Services:</strong> {userInfo.services || "—"}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
