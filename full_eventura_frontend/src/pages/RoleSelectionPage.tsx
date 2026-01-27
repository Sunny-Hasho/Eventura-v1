import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { UserRole } from "@/types/auth";

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { isAuthenticated } = authState;
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    document.title = "Join Eventura";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/register?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Join as a client or event provider
          </h1>

          {/* Role Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Client Card */}
            <button
              onClick={() => setSelectedRole("CLIENT")}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:border-gray-400 ${
                selectedRole === "CLIENT"
                  ? "border-eventura-600 bg-eventura-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Radio indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === "CLIENT"
                      ? "border-eventura-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedRole === "CLIENT" && (
                    <div className="w-3 h-3 rounded-full bg-eventura-600" />
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              {/* Text */}
              <p className="text-left font-medium text-gray-900">
                I'm a client, looking to hire for an event
              </p>
            </button>

            {/* Provider Card */}
            <button
              onClick={() => setSelectedRole("PROVIDER")}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:border-gray-400 ${
                selectedRole === "PROVIDER"
                  ? "border-eventura-600 bg-eventura-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Radio indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === "PROVIDER"
                      ? "border-eventura-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedRole === "PROVIDER" && (
                    <div className="w-3 h-3 rounded-full bg-eventura-600" />
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>

              {/* Text */}
              <p className="text-left font-medium text-gray-900">
                I'm an event provider, looking for work
              </p>
            </button>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              selectedRole
                ? "bg-eventura-600 text-white hover:bg-eventura-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Create Account
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-eventura-600 hover:text-eventura-700 font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
