import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { UserRole } from "@/types/auth";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authState } = useAuth();
  const { isAuthenticated } = authState;
  
  // Get role from URL query param
  const roleParam = searchParams.get("role");
  const preSelectedRole = (roleParam === "CLIENT" || roleParam === "PROVIDER") 
    ? roleParam as UserRole 
    : null;

  useEffect(() => {
    document.title = preSelectedRole === "PROVIDER" 
      ? "Sign up to find work | Eventura" 
      : "Sign up to hire talent | Eventura";
  }, [preSelectedRole]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // If no role selected, redirect to role selection page
  useEffect(() => {
    if (!preSelectedRole) {
      navigate("/join");
    }
  }, [preSelectedRole, navigate]);

  const handleSuccess = () => {
    navigate("/login");
  };

  const roleTitle = preSelectedRole === "PROVIDER" 
    ? "Sign up to find work" 
    : "Sign up to hire talent";

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="relative flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Left Section */}
          <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#5A67D8] to-[#4A55A2] p-10 text-white lg:flex">
            {/* Abstract video loop background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            >
            </video>
            <div className="z-10 text-center space-y-4">
              <p className="text-lg font-semibold">You can easily</p>
              <h2 className="text-4xl font-bold leading-tight">Speed up your work<br />with our Web App</h2>
            </div>
          </div>

          {/* Right Section (Register Form) */}
          <div className="w-full lg:w-1/2 p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {roleTitle}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Create your Eventura account
              </p>
            </div>

            <AuthForm type="register" onSuccess={handleSuccess} preSelectedRole={preSelectedRole} />
            
            <p className="text-center text-sm text-gray-600">
              Not {preSelectedRole === "PROVIDER" ? "a provider" : "a client"}?{" "}
              <Link to="/join" className="text-eventura-600 hover:text-eventura-700 font-medium">
                Change role
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

