import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProviderProfileResponse } from "@/types/provider";
import { providerService } from "@/services/providerService";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProviderDetails = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState<ProviderProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Provider Details | Eventura";
    loadProvider();
  }, [providerId]);

  const loadProvider = async () => {
    if (!providerId) return;

    try {
      const data = await providerService.getProviderById(parseInt(providerId));
      setProvider(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load provider details",
        variant: "destructive",
      });
      navigate("/providers");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">Loading provider details...</div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Provider Not Found</h2>
            <p className="mt-2 text-gray-600">The provider you're looking for doesn't exist.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/providers")}
            >
              Back to Providers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/providers")}
            >
              ← Back to Providers
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{provider.companyName}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{provider.serviceType}</Badge>
              {provider.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Verified Provider
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with this provider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{provider.address}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Phone Number</h3>
                  <p className="text-gray-600">{provider.mobileNumber}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Information about their services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Service Type</h3>
                  <p className="text-gray-600">{provider.serviceType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Verification Status</h3>
                  <p className="text-gray-600">
                    {provider.isVerified ? "Verified Provider" : "Pending Verification"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="default"
              className="w-full max-w-md"
              onClick={() => {
                // TODO: Implement contact or booking functionality
                toast({
                  title: "Coming Soon",
                  description: "Contact and booking features will be available soon!",
                });
              }}
            >
              Contact Provider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails; 