import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { pitchService } from "@/services/pitchService";
import { serviceRequestService } from "@/services/serviceRequestService";
import { PitchResponse } from "@/types/pitch";
import { ServiceRequestResponse } from "@/types/serviceRequest";
import { format } from "date-fns";
import { ArrowLeft, Check } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RequestPitches = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [pitches, setPitches] = useState<PitchResponse[]>([]);
  const [request, setRequest] = useState<ServiceRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPitch, setSelectedPitch] = useState<PitchResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isAssigning, setIsAssigning] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { state: { from: `/requests/${requestId}/pitches` } });
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [pitchesResponse, requestResponse] = await Promise.all([
          pitchService.getPitchesByRequestId(Number(requestId), currentPage, pageSize),
          serviceRequestService.getRequestById(Number(requestId))
        ]);

        setPitches(pitchesResponse.content);
        setTotalPages(pitchesResponse.totalPages);
        setTotalElements(pitchesResponse.totalElements);
        setRequest(requestResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch pitches",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestId, currentPage, authState.isAuthenticated, navigate, toast]);

  const handleViewPitchDetails = (pitch: PitchResponse) => {
    setSelectedPitch(pitch);
    setIsDetailsOpen(true);
  };

  const handleAssignProvider = async (providerId: number, pitchId: number) => {
    if (!requestId) return;

    try {
      setIsAssigning(true);
      
      // Update the request assignment and the winning pitch status
      const [updatedRequest, updatedPitch] = await Promise.all([
        serviceRequestService.assignProvider(Number(requestId), providerId),
        pitchService.updatePitchStatus(pitchId, "WIN")
      ]);
      
      // Update all other pitches to LOSE status
      const otherPitches = pitches.filter(p => p.id !== pitchId);
      const updateOtherPitches = otherPitches.map(pitch => 
        pitchService.updatePitchStatus(pitch.id, "LOSE")
      );
      
      // Wait for all status updates to complete
      await Promise.all(updateOtherPitches);
      
      setRequest(updatedRequest);
      
      // Update the pitches list to reflect all status changes
      setPitches(pitches.map(pitch => {
        if (pitch.id === pitchId) {
          return { ...pitch, status: "WIN", isAssigned: true };
        }
        return { ...pitch, status: "LOSE" };
      }));

      toast({
        title: "Success",
        description: "Provider has been assigned and all pitch statuses have been updated",
      });
    } catch (error) {
      console.error("Error assigning provider:", error);
      toast({
        title: "Error",
        description: "Failed to assign provider or update pitch statuses",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  const isClient = authState.user?.role === "CLIENT";
  const canAssign = isClient && request?.status !== "ASSIGNED";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Pitches for {request?.title || "Request"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View all pitches submitted for this request
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading pitches...</div>
          ) : pitches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pitches have been submitted for this request yet
            </div>
          ) : (
            <>
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider ID</TableHead>
                      <TableHead>Proposed Price</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pitches.map((pitch) => (
                      <TableRow 
                        key={pitch.id}
                        className={pitch.providerId === request?.assignedProviderId ? "bg-green-50" : ""}
                      >
                        <TableCell>{pitch.providerId}</TableCell>
                        <TableCell>${pitch.proposedPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          {format(new Date(pitch.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPitchDetails(pitch)}
                            >
                              View Details
                            </Button>
                            {canAssign && (
                              <Button
                                variant={pitch.providerId === request?.assignedProviderId ? "outline" : "default"}
                                size="sm"
                                onClick={() => handleAssignProvider(pitch.providerId, pitch.id)}
                                disabled={isAssigning || pitch.providerId === request?.assignedProviderId}
                              >
                                {pitch.providerId === request?.assignedProviderId ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Assigned
                                  </>
                                ) : (
                                  "Assign"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-4">
                <div className="text-sm text-gray-500">
                  Showing {pitches.length} of {totalElements} pitches
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
            </>
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pitch Details</DialogTitle>
            <DialogDescription>
              Detailed information about this pitch
            </DialogDescription>
          </DialogHeader>
          {selectedPitch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Provider ID</p>
                  <p className="mt-1">{selectedPitch.providerId}</p>
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
                  <p className="mt-1">
                    {format(new Date(selectedPitch.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                {canAssign && (
                  <Button
                    variant={selectedPitch.providerId === request?.assignedProviderId ? "outline" : "default"}
                    onClick={() => handleAssignProvider(selectedPitch.providerId, selectedPitch.id)}
                    disabled={isAssigning || selectedPitch.providerId === request?.assignedProviderId}
                  >
                    {selectedPitch.providerId === request?.assignedProviderId ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Assigned
                      </>
                    ) : (
                      "Assign Provider"
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
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

export default RequestPitches; 