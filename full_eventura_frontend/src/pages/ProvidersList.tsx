import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProviderProfileResponse, ServiceType } from "@/types/provider";
import { providerService } from "@/services/providerService";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const ProvidersList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [providers, setProviders] = useState<ProviderProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "ALL">("ALL");
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    document.title = "Browse Providers | Eventura";
    if (!authState.isAuthenticated) {
      navigate("/login", { state: { from: "/providers" } });
      return;
    }
    loadProviders();
  }, [currentPage, authState.isAuthenticated]);

  const loadProviders = async () => {
    try {
      const response = await providerService.getAllProviders(currentPage, pageSize);
      setProviders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Not authenticated" || error.message === "Not authorized to view providers") {
          toast({
            title: "Authentication Required",
            description: "Please log in to view providers",
            variant: "destructive",
          });
          navigate("/login", { state: { from: "/providers" } });
          return;
        }
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load providers",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderClick = (providerId: number) => {
    navigate(`/providers/${providerId}`);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesServiceType = serviceType === "ALL" || provider.serviceType === serviceType;
    return matchesSearch && matchesServiceType;
  });

  if (!authState.isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">Loading providers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Providers</h1>
          <p className="mt-2 text-gray-600">
            Find and connect with verified service providers
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by company name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType | "ALL")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Services</SelectItem>
              <SelectItem value="CATERING">Catering</SelectItem>
              <SelectItem value="WEDDING_PLANNING">Wedding Planning</SelectItem>
              <SelectItem value="VENUE">Venue</SelectItem>
              <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
              <SelectItem value="MUSIC">Music</SelectItem>
              <SelectItem value="DECORATION">Decoration</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredProviders.length} of {totalElements} providers
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{provider.companyName}</CardTitle>
                    <CardDescription>{provider.serviceType}</CardDescription>
                  </div>
                  {provider.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {provider.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contact:</span> {provider.mobileNumber}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => handleProviderClick(provider.id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <div className="flex items-center px-4">
              Page {currentPage + 1} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No providers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersList; 