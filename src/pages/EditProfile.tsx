import { useEffect, useState } from "react";
import { authService } from "../services/api";
import Layout from "../components/Layout";
import { UserInfo } from "../types/userInfo";
import { toast, ToastContainer } from "react-toastify";
import { sanitizeInput } from "../utils/securityUtils";

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
      setFormData({ ...formData, [name]: sanitizeInput(value) });
      console.log("Value", value);
      console.log("Sanitized Value", sanitizeInput(value));
    }
  };

  const handleSave = async () => {
    try {
      const response = await authService.updateUser(formData!);
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
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">My Profile</h2>
        {isEditing ? (
          <div className="space-y-6 max-w-3xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div className="mt-6">
              <label className="block mb-3 text-lg font-medium">Streaming Services:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                      className="mr-2 h-4 w-4"
                    />
                    {serviceDisplayNames[service]}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-8">
              <button
                onClick={handleSave}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Email</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Name</p>
                <p className="font-medium">
                  {userInfo.firstName && userInfo.lastName
                    ? `${userInfo.firstName} ${userInfo.lastName}`
                    : userInfo.firstName || userInfo.lastName || "—"}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Phone</p>
                <p className="font-medium">{userInfo.phone || "—"}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Location</p>
                <p className="font-medium">
                  {userInfo.city && userInfo.state
                    ? `${userInfo.city}, ${userInfo.state} ${userInfo.zip || ""}`
                    : "—"}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Age</p>
                <p className="font-medium">{userInfo.age || "—"}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">Gender</p>
                <p className="font-medium">{userInfo.gender || "—"}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-300 text-sm mb-3">Streaming Services</p>
              {userInfo.services && userInfo.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userInfo.services.map((service) => (
                    <span 
                      key={service} 
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {serviceDisplayNames[service] || service}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
