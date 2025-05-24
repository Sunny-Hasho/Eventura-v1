import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { pitchService } from "@/services/pitchService";
import { serviceRequestService } from "@/services/serviceRequestService";
import { PitchResponse } from "@/types/pitch";
import { ServiceRequestResponse } from "@/types/serviceRequest";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const AllPitches = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [pitches, setPitches] = useState<PitchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pitchToDelete, setPitchToDelete] = useState<number | null>(null);
  const [selectedPitch, setSelectedPitch] = useState<PitchResponse | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestResponse | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [pitchStatuses, setPitchStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // Clear all state when not authenticated
      setPitches([]);
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(0);
      setPitchToDelete(null);
      setSelectedPitch(null);
      setSelectedRequest(null);
      navigate("/login", { state: { from: "/all-pitches" } });
      return;
    }

    if (authState.user?.role !== "PROVIDER") {
      navigate("/dashboard");
      return;
    }

    fetchPitches(currentPage);
  }, [authState.isAuthenticated, authState.user?.role, navigate, currentPage]);

  const fetchPitchStatus = async (pitchId: number) => {
    try {
      const status = await pitchService.getPitchStatus(pitchId);
      setPitchStatuses(prev => ({
        ...prev,
        [pitchId]: status
      }));
    } catch (error) {
      console.error("Error fetching pitch status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WIN":
        return "bg-green-500";
      case "LOSE":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const fetchPitches = async (page: number) => {
    try {
      const response = await pitchService.getMyPitches(page, 10);
      setPitches(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
      // Fetch status for each pitch
      response.content.forEach(pitch => {
        fetchPitchStatus(pitch.id);
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pitches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (pitchId: number) => {
    try {
      setIsDetailsLoading(true);
      const pitchDetails = await pitchService.getPitchById(pitchId);
      setSelectedPitch(pitchDetails);
      // Fetch request details
      setIsRequestLoading(true);
      const requestDetails = await serviceRequestService.getRequestById(pitchDetails.requestId);
      setSelectedRequest(requestDetails);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch details",
        variant: "destructive",
      });
    } finally {
      setIsDetailsLoading(false);
      setIsRequestLoading(false);
    }
  };

  const handleDeletePitch = async (pitchId: number) => {
    try {
      await pitchService.deletePitch(pitchId);
      toast({
        title: "Success",
        description: "Pitch deleted successfully",
      });
      // Refresh the pitches list
      fetchPitches(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pitch",
        variant: "destructive",
      });
    } finally {
      setPitchToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Pitches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all your submitted proposals
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>All Pitches</CardTitle>
            <CardDescription>View and manage your submitted proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Loading pitches...</div>
              ) : pitches.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No pitches found
                </div>
              ) : (
                pitches.map((pitch) => (
                  <div key={pitch.id} className="p-4 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">Pitch #{pitch.id}</h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {format(new Date(pitch.createdAt), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pitchStatuses[pitch.id] && (
                          <Badge className={getStatusColor(pitchStatuses[pitch.id])}>
                            {pitchStatuses[pitch.id]}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setPitchToDelete(pitch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Proposed Price: ${pitch.proposedPrice.toLocaleString()}</p>
                      <p className="mt-1">Details: {pitch.pitchDetails}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => handleViewDetails(pitch.id)}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="py-2 px-4">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={pitchToDelete !== null} onOpenChange={() => setPitchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your pitch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pitchToDelete && handleDeletePitch(pitchToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pitch Details Dialog */}
      <Dialog open={selectedPitch !== null} onOpenChange={() => {
        setSelectedPitch(null);
        setSelectedRequest(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pitch Details</DialogTitle>
            <DialogDescription>
              Detailed information about your pitch and the associated request
            </DialogDescription>
          </DialogHeader>
          {isDetailsLoading || isRequestLoading ? (
            <div className="text-center py-4">Loading details...</div>
          ) : selectedPitch && selectedRequest && (
            <div className="space-y-6">
              {/* Pitch Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Pitch</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pitch ID</p>
                    <p className="mt-1">{selectedPitch.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Proposed Price</p>
                    <p className="mt-1">${selectedPitch.proposedPrice.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Pitch Details</p>
                    <p className="mt-1">{selectedPitch.pitchDetails}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p className="mt-1">{format(new Date(selectedPitch.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Service Request</h3>
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
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/requests/${selectedRequest.id}`)}
                >
                  View Full Request Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPitch(null);
                    setSelectedRequest(null);
                  }}
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

export default AllPitches;