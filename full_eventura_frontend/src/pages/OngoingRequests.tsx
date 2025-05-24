import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { serviceRequestService } from "@/services/serviceRequestService";
import { userService } from "@/services/userService";
import { ServiceRequestResponse } from "@/types/serviceRequest";
import { UserResponse } from "@/types/user";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { paymentService } from "@/services/paymentService";

const OngoingRequests = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestResponse | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<UserResponse | null>(null);
  const [isProviderDetailsOpen, setIsProviderDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<ServiceRequestResponse | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(tabParam === "completed" ? "completed" : "assigned");
  const queryClient = useQueryClient();
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  useEffect(() => {
    if (tabParam !== tab) {
      setSearchParams({ tab });
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleTabChange = (value: string) => {
    setTab(value);
    setSearchParams({ tab: value });
  };

  // Fetch requests with React Query
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: () => serviceRequestService.getMyRequests(0, 100),
    enabled: authState.isAuthenticated && authState.user?.role === "CLIENT",
  });

  // Fetch payment statuses with React Query
  const { data: paymentStatuses = {} } = useQuery({
    queryKey: ['paymentStatuses', requestsData?.content],
    queryFn: async () => {
      if (!requestsData?.content) return {};
      const statuses: Record<number, string> = {};
      await Promise.all(
        requestsData.content.map(async (req) => {
          try {
            const payment = await paymentService.getPaymentStatusByRequestId(req.id);
            statuses[req.id] = payment.paymentStatus;
          } catch {
            statuses[req.id] = "NONE";
          }
        })
      );
      return statuses;
    },
    enabled: !!requestsData?.content,
  });

  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "CLIENT") {
      navigate("/login", { state: { from: "/ongoing-requests" } });
      return;
    }
  }, [authState.isAuthenticated, authState.user?.role, navigate]);

  const handleViewProviderDetails = async (request: ServiceRequestResponse) => {
    try {
      if (!request.assignedProviderId) {
        toast({
          title: "Error",
          description: "No provider assigned to this request",
          variant: "destructive",
        });
        return;
      }

      const provider = await userService.getUserById(request.assignedProviderId);
      setSelectedProvider(provider);
      setIsProviderDetailsOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch provider details",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePay = (request: ServiceRequestResponse) => {
    setPaymentRequest(request);
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRequest) return;

    setProcessingPayment(paymentRequest.id);
    try {
      await paymentService.createPayment({
        requestId: paymentRequest.id,
        amount: paymentRequest.budget,
        paymentMethod: "CREDIT_CARD",
      });
      toast({ title: "Payment initiated!" });
      setIsPaymentOpen(false);
      // Invalidate and refetch payment statuses
      await queryClient.invalidateQueries({ queryKey: ['paymentStatuses'] });
    } catch (error) {
      toast({ title: "Payment failed", variant: "destructive" });
    } finally {
      setProcessingPayment(null);
    }
  };

  if (!authState.isAuthenticated || authState.user?.role !== "CLIENT") {
    return null;
  }

  const assignedRequests = requestsData?.content.filter(r => r.status === "ASSIGNED") || [];
  const completedRequests = requestsData?.content.filter(r => r.status === "COMPLETED") || [];
  const totalElements = requestsData?.totalElements || 0;
  const totalPages = requestsData?.totalPages || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ongoing Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your assigned service requests
          </p>
        </header>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="assigned">
            <div className="bg-white rounded-lg shadow">
              {isLoading ? (
                <div className="p-8 text-center">Loading requests...</div>
              ) : assignedRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No ongoing requests found
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.title}</TableCell>
                          <TableCell>{request.eventName}</TableCell>
                          <TableCell>
                            {format(new Date(request.eventDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{request.serviceType}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {request.assignedProviderId ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProviderDetails(request)}
                              >
                                View Provider
                              </Button>
                            ) : (
                              "Not Assigned"
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedRequest(request)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalElements > 20 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-500">
                        Showing {currentPage * 20 + 1} to{" "}
                        {Math.min((currentPage + 1) * 20, totalElements)} of{" "}
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
                </>
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
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.title}</TableCell>
                          <TableCell>{request.eventName}</TableCell>
                          <TableCell>
                            {format(new Date(request.eventDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{request.serviceType}</TableCell>
                          <TableCell>
                            {paymentStatuses[request.id] === "COMPLETED" ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Paid
                              </span>
                            ) : paymentStatuses[request.id] === "PENDING" ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                Payment Pending
                              </span>
                            ) : (
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePay(request)}
                                  className="text-xs"
                                >
                                  Pay Now
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {request.assignedProviderId ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProviderDetails(request)}
                              >
                                View Provider
                              </Button>
                            ) : (
                              "Not Assigned"
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedRequest(request)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalElements > 20 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-500">
                        Showing {currentPage * 20 + 1} to{" "}
                        {Math.min((currentPage + 1) * 20, totalElements)} of{" "}
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
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Event: {selectedRequest?.eventName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Event Details</h4>
                <p className="text-sm text-gray-500">
                  Date: {selectedRequest?.eventDate && format(new Date(selectedRequest.eventDate), "MMMM d, yyyy")}
                </p>
                <p className="text-sm text-gray-500">
                  Location: {selectedRequest?.location}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Service Details</h4>
                <p className="text-sm text-gray-500">
                  Type: {selectedRequest?.serviceType}
                </p>
                <p className="text-sm text-gray-500">
                  Budget: ${selectedRequest?.budget}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-sm text-gray-500">{selectedRequest?.description}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Status</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest?.status || "")}`}>
                {selectedRequest?.status}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Provider Details Dialog */}
      <Dialog open={isProviderDetailsOpen} onOpenChange={setIsProviderDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>
              Information about the assigned provider
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedProvider.firstName} {selectedProvider.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedProvider.role}</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedProvider.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedProvider.mobileNumber || "No mobile number provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedProvider.address || "No address provided"}</span>
                </div>
              </div>
              {selectedProvider.bio && (
                <div>
                  <h4 className="font-medium mb-1">About</h4>
                  <p className="text-sm text-gray-500">{selectedProvider.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Pay for <b>{paymentRequest?.title}</b>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={paymentRequest?.budget || ""}
                readOnly
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={processingPayment === paymentRequest?.id}
            >
              {processingPayment === paymentRequest?.id ? "Processing..." : "Pay Now"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OngoingRequests; 