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
} from "@/components/ui/dialog";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your services and find new opportunities
          </p>
        </header>

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
  );
};

export default ProviderDashboard;
