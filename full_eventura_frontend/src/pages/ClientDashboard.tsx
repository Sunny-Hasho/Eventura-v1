import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { serviceRequestService } from "@/services/serviceRequestService";
import { ServiceRequestResponse } from "@/types/serviceRequest";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ClientDashboard = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestToDelete, setRequestToDelete] = useState<ServiceRequestResponse | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await serviceRequestService.getMyRequests(0, 10);
      setRequests(response.content);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
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
  }, []);

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      await serviceRequestService.deleteRequest(requestToDelete.id);
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete request",
        variant: "destructive",
      });
    } finally {
      setRequestToDelete(null);
    }
  };

  const handleBrowseProviders = () => {
    navigate("/providers");
  };

  const handleCreateRequest = () => {
    navigate("/create-request");
  };

  const handleViewMyRequests = () => {
    navigate("/requests");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const assignedRequests = requests.filter(request => request.status === "ASSIGNED");
  const activeRequests = requests.filter(request => request.status === "OPEN");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your event planning and service providers
          </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/ongoing-requests")}
              >
                View Ongoing Requests
              </Button>
              <Button
                onClick={handleCreateRequest}
              >
                Create Request
              </Button>
            </div>
          </div>
        </header>

        {/* Welcome Card */}
        <Card className="mb-6 bg-gradient-to-r from-eventura-700 to-eventura-900 text-white">
          <CardHeader>
            <CardTitle>Welcome, {user?.firstName}!</CardTitle>
            <CardDescription className="text-eventura-100">
              Manage your event services and connect with professionals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-eventura-100">
                  Get started by creating a service request or browsing providers.
                </p>
              </div>
              <Button 
                variant="secondary" 
                className="whitespace-nowrap"
                onClick={handleCreateRequest}
              >
                Create Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Assigned Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Requests</CardTitle>
              <CardDescription>Requests with assigned providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">Loading requests...</div>
                ) : assignedRequests.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No assigned requests found
                  </div>
                ) : (
                  assignedRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(request.eventDate), "MMMM d, yyyy")}
                          </p>
                    </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                    </span>
                        </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                        <p>{request.serviceType}</p>
                        {request.assignedProviderId && (
                          <p className="text-blue-600">Provider assigned</p>
                        )}
                  </div>
                </div>
                  ))
                )}
              </div>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={handleViewMyRequests}
              >
                View All Requests
              </Button>
            </CardContent>
          </Card>

          {/* Active Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Active Requests</CardTitle>
              <CardDescription>Your open service requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">Loading requests...</div>
                ) : activeRequests.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No active requests found
                  </div>
                ) : (
                  activeRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(request.eventDate), "MMMM d, yyyy")}
                          </p>
                    </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                    </span>
                          <button
                            onClick={() => setRequestToDelete(request)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            title="Delete request"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                        <p>{request.serviceType}</p>
                  </div>
                </div>
                  ))
                )}
              </div>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={handleViewMyRequests}
              >
                View All Requests
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Providers</CardTitle>
              <CardDescription>Top-rated professionals for your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-eventura-100 flex items-center justify-center text-eventura-700 mr-3">
                      LP
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Luxury Photography</h3>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-eventura-100 flex items-center justify-center text-eventura-700 mr-3">
                      DP
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Divine Planners</h3>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-4 w-4 text-yellow-400" fill={i < 4 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500">(18 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={handleBrowseProviders}
              >
                Browse All Providers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!requestToDelete} onOpenChange={() => setRequestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service request
              "{requestToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientDashboard;
