
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const Register = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { isAuthenticated } = authState;

  useEffect(() => {
    document.title = "Register | Eventura";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Eventura to connect with event professionals
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <AuthForm type="register" onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default Register;
