import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { serviceRequestService } from "@/services/serviceRequestService";
import { userService } from "@/services/userService";
import { ServiceRequestResponse } from "@/types/serviceRequest";
import { UserResponse } from "@/types/user";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Calendar, MapPin, DollarSign, User, Mail, Phone, CheckCircle, PlayCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/BackButton";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { paymentService } from "@/services/paymentService";

const OngoingWork = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ongoingRequests, setOngoingRequests] = useState<ServiceRequestResponse[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ServiceRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestResponse | null>(null);
  const [clientDetails, setClientDetails] = useState<UserResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<Record<number, string>>({});
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const pageSize = 20;

  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "PROVIDER") {
      navigate("/login", { state: { from: "/ongoing-work" } });
      return;
    }
    fetchRequests();
  }, [authState.isAuthenticated, authState.user?.role, navigate, currentPage]);

  const fetchRequests = async () => {
    try {
      const response = await serviceRequestService.getAllRequests(currentPage, pageSize);
      
      // Filter requests for this provider
      const providerRequests = response.content.filter(
        request => request.assignedProviderId === authState.user?.id
      );

      // Separate requests by status
      const ongoing = providerRequests.filter(request => 
        request.status === "ASSIGNED" || 
        request.status === "IN_PROGRESS" || 
        request.status === "PENDING_APPROVAL"
      );
      const completed = providerRequests.filter(request => request.status === "COMPLETED");

      setOngoingRequests(ongoing);
      setCompletedRequests(completed);
      setTotalPages(response.totalPages);
      setTotalElements(providerRequests.length);

      // Fetch payment status for each request
      const statuses: Record<number, string> = {};
      await Promise.all(
        providerRequests.map(async (req) => {
          try {
            const payment = await paymentService.getPaymentStatusByRequestId(req.id);
            statuses[req.id] = payment.paymentStatus;
          } catch {
            statuses[req.id] = "NONE";
          }
        })
      );
      setPaymentStatus(statuses);
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

  // NEW: Escrow workflow methods
  const handleStartWork = async (requestId: number) => {
    try {
      setIsActionLoading(requestId);
      await serviceRequestService.startWork(requestId);
      toast({
        title: "Success",
        description: "Work started! You can now begin the service.",
      });
      fetchRequests();
    } catch (error) {
      console.error("Failed to start work:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start work",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleMarkComplete = async (requestId: number) => {
    try {
      setIsActionLoading(requestId);
      await serviceRequestService.markComplete(requestId);
      toast({
        title: "Success",
        description: "Work marked as complete! Waiting for client approval.",
      });
      fetchRequests();
    } catch (error) {
      console.error("Failed to mark complete:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark complete",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const fetchClientDetails = async (clientId: number) => {
    try {
      const response = await userService.getUserById(clientId);
      setClientDetails(response);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch client details",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (request: ServiceRequestResponse) => {
    setSelectedRequest(request);
    if (request.clientId) {
      await fetchClientDetails(request.clientId);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "PENDING_APPROVAL":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionButton = (request: ServiceRequestResponse) => {
    const isLoading = isActionLoading === request.id;
    
    switch (request.status) {
      case "ASSIGNED":
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStartWork(request.id)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Starting..." : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Work
              </>
            )}
          </Button>
        );
      case "IN_PROGRESS":
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleMarkComplete(request.id)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Submitting..." : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        );
      case "PENDING_APPROVAL":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="cursor-not-allowed"
          >
            <Clock className="h-4 w-4 mr-2" />
            Awaiting Approval
          </Button>
        );
      default:
        return null;
    }
  };

  const RequestTable = ({ requests, showCompleteButton = true }: { requests: ServiceRequestResponse[], showCompleteButton?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Service Type</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.title}</TableCell>
            <TableCell>{request.eventName}</TableCell>
            <TableCell>
              {format(new Date(request.eventDate), "MMM d, yyyy")}
            </TableCell>
            <TableCell>{request.serviceType}</TableCell>
            <TableCell>${(request.assignedPrice || request.budget).toLocaleString()}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </TableCell>
            <TableCell>
              {paymentStatus[request.id] && paymentStatus[request.id] !== "NONE" ? (
                <PaymentStatusBadge status={paymentStatus[request.id]} />
              ) : (
                <span className="text-xs text-gray-500">No payment</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(request)}
                >
                  View Details
                </Button>
                {showCompleteButton && getActionButton(request)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (!authState.isAuthenticated || authState.user?.role !== "PROVIDER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ongoing Work</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your active service requests
            </p>
          </div>
          <BackButton />
        </div>

        <Tabs defaultValue="ongoing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ongoing">Ongoing Work</TabsTrigger>
            <TabsTrigger value="completed">Completed Work</TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing">
            <div className="bg-white rounded-lg shadow">
              {isLoading ? (
                <div className="p-8 text-center">Loading requests...</div>
              ) : ongoingRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No ongoing requests found
                </div>
              ) : (
                <RequestTable requests={ongoingRequests} showCompleteButton={true} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="bg-white rounded-lg shadow">
              {isLoading ? (
                <div className="p-8 text-center">Loading requests...</div>
              ) : completedRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No completed requests found
                </div>
              ) : (
                <RequestTable requests={completedRequests} showCompleteButton={false} />
              )}
            </div>
          </TabsContent>
        </Tabs>

        {totalElements > pageSize && (
          <div className="flex items-center justify-between p-4 border-t mt-4">
            <div className="text-sm text-gray-500">
              Showing {currentPage * pageSize + 1} to{" "}
              {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
              {totalElements} requests
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setClientDetails(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Event: {selectedRequest?.eventName}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Event Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(selectedRequest.eventDate), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedRequest.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <DollarSign className="h-4 w-4" />
                      <span>${(selectedRequest.assignedPrice || selectedRequest.budget).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Client Details</h4>
                  <div className="space-y-2">
                    {clientDetails ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{`${clientDetails.firstName} ${clientDetails.lastName}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-4 w-4" />
                          <span>{clientDetails.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-4 w-4" />
                          <span>{clientDetails.mobileNumber || "No phone number provided"}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Loading client details...</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-500">{selectedRequest.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Payment</h4>
                  {paymentStatus[selectedRequest.id] && paymentStatus[selectedRequest.id] !== "NONE" ? (
                    <PaymentStatusBadge status={paymentStatus[selectedRequest.id]} />
                  ) : (
                    <span className="text-xs text-gray-500">No payment</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                {getActionButton(selectedRequest)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OngoingWork; 