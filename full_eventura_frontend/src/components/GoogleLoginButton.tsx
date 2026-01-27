import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const { googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
      try {
          if (credentialResponse.credential) {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard'); 
          }
      } catch (error) {
        // Error is handled in AuthContext
      }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          toast({ title: "Google Login Failed", description: "Please try again.", variant: "destructive" });
        }}
        width={300}
        theme="outline"
        size="large"
      />
    </div>
  );
};

export default GoogleLoginButton;
