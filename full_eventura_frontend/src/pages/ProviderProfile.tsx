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
import { portfolioService } from "@/services/portfolioService";
import { PortfolioResponse } from "@/types/portfolio";

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProviderProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

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

  useEffect(() => {
    const checkProfileAndFetchPortfolio = async () => {
      if (!authState.user?.id) return;
      try {
        // Check if profile exists
        await providerService.getProfile();
        setProfileExists(true);
        // Get providerId
        const id = await portfolioService.getProviderIdByUserId(authState.user.id);
        setProviderId(id);
        // Fetch portfolio
        setPortfolioLoading(true);
        const page = await portfolioService.getProviderPortfolios(id, 0, 10);
        setPortfolio(page.content);
      } catch (err) {
        if (err instanceof Error && err.message.includes("Provider not found")) {
          setProfileExists(false);
        } else {
          setProfileExists(null);
        }
      } finally {
        setPortfolioLoading(false);
      }
    };
    if (authState.isAuthenticated && authState.user?.role === "PROVIDER") {
      checkProfileAndFetchPortfolio();
    }
  }, [authState.isAuthenticated, authState.user?.id, authState.user?.role]);

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
        {profileExists && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">My Portfolio</h2>
            {portfolioLoading ? (
              <div>Loading portfolio...</div>
            ) : portfolio.length === 0 ? (
              <div className="text-gray-500">No portfolio items found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>
                        {item.projectDate} • {item.eventType}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button className="mt-6" onClick={() => navigate("/provider/portfolio")}>Manage Portfolio</Button>
          </section>
        )}
        {!profileExists && (
          <div className="text-center text-gray-500 mt-10">
            Set up your provider profile to view and manage your portfolio.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile; 