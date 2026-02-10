import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Filter, Lock, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";

// Define Payment Type locally if not available globally yet
interface Payment {
  id: number;
  requestId: number;
  clientId: number;
  providerId: number;
  amount: number;
  paymentStatus: "AWAITING_PAYMENT" | "ESCROWED" | "RELEASED" | "REFUNDED" | "DISPUTED";
  transactionId?: string;
  createdAt: string;
  requestTitle?: string; // These might need to be fetched separately or included in DTO
}

import { adminService } from "@/services/adminService";

// ... (imports remain similar, assume Payment type is imported or defined)

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);

  // Fetch Payments
  const { data: paymentsPage, isLoading } = useQuery({
    queryKey: ["admin-payments", statusFilter],
    queryFn: () => adminService.getAllPayments(0, statusFilter),
  });

  const payments = paymentsPage?.content || [];

  // Release Payment Mutation
  const releaseMutation = useMutation({
    mutationFn: (paymentId: number) => adminService.releasePayment(paymentId),
    onSuccess: () => {
      toast.success("Payment released to provider successfully");
      setIsReleaseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (error) => toast.error("Failed to release payment: " + error.message),
  });

  // Refund Payment Mutation
  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      adminService.refundPayment(id, reason),
    onSuccess: () => {
      toast.success("Payment refunded to client successfully");
      setIsRefundDialogOpen(false);
      setRefundReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (error) => toast.error("Failed to refund payment: " + error.message),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RELEASED": return "bg-green-100 text-green-800";
      case "ESCROWED": return "bg-blue-100 text-blue-800";
      case "REFUNDED": return "bg-gray-100 text-gray-800";
      case "DISPUTED": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={!isSidebarOpen}
        onCollapse={() => setIsSidebarOpen(false)}
      />
      <div className={cn(
        "flex min-h-screen flex-col transition-all duration-300",
        isSidebarOpen ? "md:pl-64" : "md:pl-20"
      )}>
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Payments & Disputes</h2>
          </div>

          <div className="flex items-center space-x-2 py-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payments</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
                <SelectItem value="ESCROWED">Escrowed</SelectItem>
                <SelectItem value="RELEASED">Released</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.id}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(payment.paymentStatus)}>
                          {payment.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.clientId}</TableCell>
                      <TableCell>{payment.providerId}</TableCell>
                      <TableCell>{format(new Date(payment.createdAt), "PP")}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {(payment.paymentStatus === "DISPUTED" || payment.paymentStatus === "ESCROWED") && (
                          <>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsRefundDialogOpen(true);
                              }}
                            >
                              Refund
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsReleaseDialogOpen(true);
                              }}
                            >
                              Release
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment #{selectedPayment?.id}</DialogTitle>
            <DialogDescription>
              This action will refund the payment to the client and cancel the service request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Reason for Refund:</label>
            <Input 
              value={refundReason} 
              onChange={(e) => setRefundReason(e.target.value)} 
              placeholder="e.g. Service not delivered, Mutual cancellation"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPayment && refundMutation.mutate({ id: selectedPayment.id, reason: refundReason })}
              disabled={!refundReason || refundMutation.isPending}
            >
              {refundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Dialog */}
      <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Payment #{selectedPayment?.id}</DialogTitle>
            <DialogDescription>
              This action will override the client and release funds to the provider. use with caution.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedPayment && releaseMutation.mutate(selectedPayment.id)}
              disabled={releaseMutation.isPending}
            >
              {releaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
