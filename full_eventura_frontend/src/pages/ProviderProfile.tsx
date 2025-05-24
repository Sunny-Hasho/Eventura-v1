import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProviderProfileRequest, ProviderProfileResponse } from "@/types/provider";
import { providerService } from "@/services/providerService";
import ProviderProfileForm from "@/components/ProviderProfileForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProviderProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    document.title = "Provider Profile | Eventura";
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await providerService.getProfile();
        setProfile(data);
      } catch (error) {
        // If profile doesn't exist, that's okay - we'll show the create form
        if (error instanceof Error && error.message === "Provider not found") {
          setProfile(null);
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.isAuthenticated) {
      loadProfile();
    } else {
      navigate("/login");
    }
  }, [authState.isAuthenticated, navigate, toast]);

  const handleSubmit = async (data: ProviderProfileRequest) => {
    try {
      if (profile) {
        const updatedProfile = await providerService.updateProfile(data);
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        const newProfile = await providerService.createProfile(data);
        setProfile(newProfile);
      }
    } catch (error) {
      throw error; // Let the form handle the error display
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              {profile ? (isEditing ? "Edit Profile" : "View Profile") : "Create Provider Profile"}
            </h1>
            <p className="mt-2 text-gray-600">
              {profile
                ? isEditing
                  ? "Update your provider profile information"
                  : "View your provider profile details"
                : "Set up your provider profile to start receiving service requests"}
            </p>
          </div>

          {profile && !isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>{profile.companyName}</CardTitle>
                <CardDescription>
                  {profile.isVerified ? "Verified Provider" : "Pending Verification"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Service Type</h3>
                  <p className="text-gray-600">{profile.serviceType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-gray-600">{profile.address}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Mobile Number</h3>
                  <p className="text-gray-600">{profile.mobileNumber}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow">
              <ProviderProfileForm
                initialData={profile || undefined}
                onSubmit={handleSubmit}
                submitLabel={profile ? "Update Profile" : "Create Profile"}
              />
              {profile && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile; 