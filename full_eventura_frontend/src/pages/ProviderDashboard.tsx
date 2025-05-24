import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { serviceRequestService } from "@/services/serviceRequestService";
import { ServiceRequestResponse } from "@/types/serviceRequest";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { paymentService } from "@/services/paymentService";
import { PaymentResponse } from "@/types/common";
import { useQuery } from "@tanstack/react-query";
import { providerService } from "@/services/providerService";
import ProviderProfileForm from "@/components/ProviderProfileForm";
import { ProviderProfileRequest } from "@/types/provider";
import { Loader2 } from "lucide-react";

const ProviderDashboard = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceType, setServiceType] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestResponse | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [showWelcomeStep, setShowWelcomeStep] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["providerPayments"],
    queryFn: () => paymentService.getProviderPayments(0, 100),
    enabled: authState.isAuthenticated && user?.role === "PROVIDER",
  });

  const totalEarnings = paymentsData?.content
    ?.filter((p: PaymentResponse) => p.paymentStatus === "COMPLETED")
    .reduce((sum: number, p: PaymentResponse) => sum + p.amount, 0) || 0;

  const fetchRequests = async () => {
    try {
      const response = await serviceRequestService.getAllRequests(0, 2, serviceType === "ALL" ? undefined : serviceType);
      setRequests(response.content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [serviceType]);

  const handleProfileSubmit = async (data: ProviderProfileRequest) => {
    setProfileError(null);
    setIsSubmitting(true);
    try {
      await providerService.createProfile(data);
      setShowProfileModal(false); // Close setup modal
      setShowSuccessModal(true); // Show success modal
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkProfile = async () => {
      try {
        await providerService.getProfile();
      } catch (err) {
        if (err instanceof Error && err.message.includes("Provider not found")) {
          setShowProfileModal(true);
        }
      } finally {
        setProfileChecked(true);
      }
    };
    if (authState.isAuthenticated && authState.user?.role === "PROVIDER") {
      checkProfile();
    }
  }, [authState.isAuthenticated, authState.user?.id, authState.user?.role]);

  const handleViewAllRequests = async () => {
    try {
      setIsLoading(true);
      const response = await serviceRequestService.getAllRequests(0, 10, serviceType === "ALL" ? undefined : serviceType);
      navigate("/all-requests", { 
        state: { 
          initialRequests: response.content,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          currentPage: 0,
          serviceType: serviceType
        } 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch all requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequestDetails = async (requestId: number) => {
    try {
      setIsDetailsLoading(true);
      const requestDetails = await serviceRequestService.getRequestById(requestId);
      setSelectedRequest(requestDetails);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch request details",
        variant: "destructive",
      });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  if (!profileChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <>
      {/* Modal for provider profile setup with welcome step */}
      <Dialog open={showProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
             
            </DialogDescription>
          </DialogHeader>
          {showWelcomeStep ? (
            <>
              <div className="flex flex-col items-center justify-center py-6">
                <h2 className="text-2xl font-bold mb-2">Welcome to Eventura!</h2>
                <p className="text-gray-600 mb-6 text-center max-w-xs">
                  Let's set up your provider profile so you can start receiving bookings and showcase your services. This only takes a minute!
                </p>
                <Button size="lg" onClick={() => setShowWelcomeStep(false)}>
                  Get Started
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Set Up Your Provider Profile</DialogTitle>
                <DialogDescription>
                  Please complete your provider profile to access the dashboard.
                </DialogDescription>
              </DialogHeader>
              {profileError && (
                <div className="flex flex-col items-center justify-center mb-4 animate-fade-in">
                  <svg className="w-12 h-12 text-red-500 mb-2 animate-shake" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
                  </svg>
                  <span className="text-red-600 font-semibold text-center">{profileError}</span>
                </div>
              )}
              <ProviderProfileForm
                onSubmit={handleProfileSubmit}
                submitLabel="Create Profile"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Success Modal with animation */}
      <Dialog open={showSuccessModal}>
        <DialogContent className="animate-fade-in">
          <DialogHeader>
            <DialogTitle>Profile setup successful!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <svg className="w-16 h-16 text-black mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
            </svg>
            <p className="text-lg font-semibold text-black mb-4">Your provider profile has been created successfully!</p>
            <Button onClick={() => setShowSuccessModal(false)}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dashboard UI (blocked by modal if needed) */}
      <div className={showProfileModal || showSuccessModal ? 'pointer-events-none opacity-50' : ''}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your services and find new opportunities
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Provider Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Provider Profile</CardTitle>
                  <CardDescription>Manage your public provider profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate("/provider/profile")}>{profileChecked ? "View/Edit Profile" : "Set Up Profile"}</Button>
                </CardContent>
              </Card>
              {/* Earnings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings</CardTitle>
                  <CardDescription>Total earnings from completed payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">
                      {isPaymentsLoading ? "..." : `$${totalEarnings.toLocaleString()}`}
                    </span>
                    <Button className="mt-4 w-full" onClick={() => navigate("/earnings")}>View Earnings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Available Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Requests</CardTitle>
                  <CardDescription>Service requests you can pitch for</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-4">Loading requests...</div>
                    ) : requests.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No available requests found
                      </div>
                    ) : (
                      requests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-md bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{request.title}</h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(request.eventDate), "MMMM d, yyyy")}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Budget: ${request.budget.toLocaleString()}</p>
                            <p className="mt-1">Location: {request.location}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full"
                            onClick={() => handleViewRequestDetails(request.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={handleViewAllRequests}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Browse All Requests"}
                  </Button>
                </CardContent>
              </Card>

              {/* Your Pitches */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Pitches</CardTitle>
                  <CardDescription>Track your submitted proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Birthday Party Photography</h3>
                          <p className="text-sm text-gray-500">June 8, 2025</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Your Quote: $750</p>
                        <p className="mt-1">Submitted: May 1, 2025</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Product Launch Event</h3>
                          <p className="text-sm text-gray-500">July 3, 2025</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Declined
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Your Quote: $1,800</p>
                        <p className="mt-1">Submitted: April 28, 2025</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => navigate("/all-pitches")}
                  >
                    View All Pitches
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>Your confirmed events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Johnson Wedding</h3>
                          <p className="text-sm text-gray-500">June 22, 2025</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          In 30 days
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Location: Grand Hotel, Seattle</p>
                        <p className="mt-1">Client: Sarah Johnson</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full">View Details</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">View Calendar</Button>
                </CardContent>
              </Card>

              {/* Provider Portfolio Card */}
              <Card>
                <CardHeader>
                  <CardTitle>My Portfolio</CardTitle>
                  <CardDescription>Manage your past projects and showcase your work</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/provider/portfolio")}>Manage Portfolio</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Request Details Dialog */}
          <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the service request
                </DialogDescription>
              </DialogHeader>
              {isDetailsLoading ? (
                <div className="text-center py-4">Loading details...</div>
              ) : selectedRequest && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="mt-1">{selectedRequest.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Event Name</p>
                      <p className="mt-1">{selectedRequest.eventName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Event Date</p>
                      <p className="mt-1">{format(new Date(selectedRequest.eventDate), "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="mt-1">{selectedRequest.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Service Type</p>
                      <p className="mt-1">{selectedRequest.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Budget</p>
                      <p className="mt-1">${selectedRequest.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedRequest.status === "OPEN" ? "bg-green-100 text-green-800" :
                          selectedRequest.status === "ASSIGNED" ? "bg-blue-100 text-blue-800" :
                          selectedRequest.status === "COMPLETED" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {selectedRequest.status}
                        </span>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1">{selectedRequest.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/requests/${selectedRequest.id}`)}
                    >
                      View Full Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Animation styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
      `}</style>
    </>
  );
};

export default ProviderDashboard;
