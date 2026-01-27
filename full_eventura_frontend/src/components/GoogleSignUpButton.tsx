import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';

interface GoogleSignUpButtonProps {
  role: UserRole;
}

const GoogleSignUpButton = ({ role }: GoogleSignUpButtonProps) => {
  const { googleSignUp } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleSignUp(credentialResponse.credential, role);
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          // Error handled by parent component
        }}
        size="large"
        width={300}
        text="continue_with"
      />
    </div>
  );
};

export default GoogleSignUpButton;
