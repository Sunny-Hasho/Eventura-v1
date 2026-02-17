import { useEffect, useState } from "react";
import { providerService } from "@/services/providerService";
import { ProviderProfileResponse } from "@/types/provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { portfolioService } from "@/services/portfolioService";
import { PortfolioResponse, PortfolioAuditLog } from "@/types/portfolio";
import { Loader2, History, ArrowLeft, Trash2 } from "lucide-react";

const ProviderVerificationTable = () => {
  const [providers, setProviders] = useState<ProviderProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [providerToVerify, setProviderToVerify] = useState<{ id: number; isVerified: boolean } | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfileResponse | null>(null);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioResponse[]>([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  
  // History State
  const [auditLogs, setAuditLogs] = useState<PortfolioAuditLog[]>([]);
  const [viewingHistoryId, setViewingHistoryId] = useState<number | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Delete State
  const [deletePortfolioId, setDeletePortfolioId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();
  const pageSize = 5;

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await providerService.getAllProviders(currentPage, pageSize);
      setProviders(response.content);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
      toast({
        title: "Error",
        description: "Failed to fetch providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [currentPage]);

  const handleVerification = async (providerId: number, isVerified: boolean) => {
    try {
      await providerService.updateProviderVerification(providerId, isVerified);
      toast({
        title: "Success",
        description: `Provider ${isVerified ? "verified" : "unverified"} successfully`,
      });
      // Refresh the providers list
      fetchProviders();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsVerifyDialogOpen(false);
      setProviderToVerify(null);
    }
  };

  const handleViewPortfolio = async (provider: ProviderProfileResponse) => {
    setSelectedProvider(provider);
    setIsPortfolioDialogOpen(true);
    setIsPortfolioLoading(true);
    setViewingHistoryId(null); // Reset history view
    try {
      const response = await portfolioService.getProviderPortfolios(provider.id, 0, 10);
      setPortfolioItems(response.content);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch portfolio items",
        variant: "destructive",
      });
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const handleViewHistory = async (portfolioId: number) => {
    setViewingHistoryId(portfolioId);
    setIsHistoryLoading(true);
    try {
        if (!selectedProvider) return;
        const logs = await portfolioService.getPortfolioHistory(selectedProvider.id, portfolioId);
        setAuditLogs(logs);
    } catch (err) {
        toast({
            title: "Error",
            description: "Failed to fetch portfolio history",
            variant: "destructive",
        });
    } finally {
        setIsHistoryLoading(false);
    }
  };

  const handleBackToPortfolio = () => {
    setViewingHistoryId(null);
    setAuditLogs([]);
  };

  const handleDeletePortfolio = (portfolioId: number) => {
    setDeletePortfolioId(portfolioId);
    setDeleteReason("");
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePortfolio = async () => {
    if (!deletePortfolioId || !deleteReason.trim()) {
        toast({
            title: "Error",
            description: "Please provide a reason for deletion.",
            variant: "destructive",
        });
        return;
    }

    try {
        await portfolioService.deletePortfolioByAdmin(deletePortfolioId, deleteReason);
        toast({
            title: "Success",
            description: "Portfolio item deleted successfully",
        });
        
        // Remove from local state
        setPortfolioItems(items => items.filter(item => item.id !== deletePortfolioId));
        setIsDeleteDialogOpen(false);
        setDeletePortfolioId(null);
    } catch (err) {
        toast({
            title: "Error",
            description: "Failed to delete portfolio item",
            variant: "destructive",
        });
    }
  };

  const getServiceTypeBadgeColor = (type: string) => {
    switch (type) {
      case "PHOTOGRAPHY":
        return "bg-purple-100 text-purple-800";
      case "CATERING":
        return "bg-orange-100 text-orange-800";
      case "VENUE":
        return "bg-pink-100 text-pink-800";
      case "DECORATION":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading providers...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.companyName}</TableCell>
                <TableCell>
                  <Badge className={getServiceTypeBadgeColor(provider.serviceType)}>
                    {provider.serviceType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{provider.mobileNumber}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{provider.address}</div>
                </TableCell>
                <TableCell>
                  <Badge className={provider.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {provider.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPortfolio(provider)}
                    >
                      View Portfolio
                    </Button>
                    <Button
                      variant={provider.isVerified ? "destructive" : "default"}
                      size="sm"
                      onClick={() => {
                        setProviderToVerify({ id: provider.id, isVerified: !provider.isVerified });
                        setIsVerifyDialogOpen(true);
                      }}
                    >
                      {provider.isVerified ? "Unverify" : "Verify"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Verification Confirmation Dialog */}
      <AlertDialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {providerToVerify?.isVerified ? "verify" : "unverify"} this provider?
              {providerToVerify?.isVerified ? " This will allow them to receive service requests." : " This will prevent them from receiving new service requests."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => providerToVerify && handleVerification(providerToVerify.id, providerToVerify.isVerified)}
              className={providerToVerify?.isVerified ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {providerToVerify?.isVerified ? "Verify" : "Unverify"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Portfolio Dialog */}
      <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Portfolio - {selectedProvider?.companyName}
            </DialogTitle>
            <DialogDescription>
              View the provider's portfolio items and past work
            </DialogDescription>
          </DialogHeader>
          
          {isPortfolioLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : viewingHistoryId ? (
            <div className="space-y-4">
                <Button variant="ghost" onClick={handleBackToPortfolio} className="mb-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portfolio
                </Button>
                
                {isHistoryLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                ) : auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No history found for this item.</div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Old Value</TableHead>
                                    <TableHead>New Value</TableHead>
                                    <TableHead>Changed At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {auditLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.fieldName}</TableCell>
                                        <TableCell className="text-red-600 break-all">{log.oldValue || "-"}</TableCell>
                                        <TableCell className="text-green-600 break-all">{log.newValue || "-"}</TableCell>
                                        <TableCell>{new Date(log.changedAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
          ) : portfolioItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {portfolioItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  {item.imageUrl && (
                    <div className="aspect-video relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="outline">{item.eventType}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(item.projectDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewHistory(item.id)}>
                            <History className="h-4 w-4 mr-2" />
                            History
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePortfolio(item.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No portfolio items found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </Button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this portfolio item? This action cannot be undone.
              The provider will be notified with the reason you provide below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="delete-reason" className="mb-2 block">Reason for deletion</Label>
            <Textarea 
                id="delete-reason" 
                placeholder="e.g., Violeted content policy..." 
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                  e.preventDefault();
                  confirmDeletePortfolio();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProviderVerificationTable; 