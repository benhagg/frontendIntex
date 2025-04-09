import { useEffect, useState } from "react";
import { authService } from "../services/api";
import Layout from "../components/Layout";
import { UserInfo } from "../types/userInfo";
import { toast, ToastContainer } from "react-toastify";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handlePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );
      toast.success("Password updated successfully!");
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update failed:", error);
      toast.error("Failed to update password.");
    }
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
                value={formData?.phone || ""}
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
                name="city"
                value={formData?.state || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
            <label className="block">
              Zip:
              <input
                type="text"
                name="city"
                value={formData?.zip || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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
        <button
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          style={{ marginTop: "8px" }}
        >
          {showChangePassword ? "Cancel Password Change" : "Change Password"}
        </button>

        {showChangePassword && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full border rounded px-2 py-1"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full border rounded px-2 py-1"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full border rounded px-2 py-1"
            />
            <button
              onClick={handlePasswordSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
