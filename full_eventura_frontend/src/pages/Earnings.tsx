import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/services/paymentService";
import { PaymentResponse } from "@/types/common";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";

const PAGE_SIZE = 20;

const Earnings = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["providerPayments", page],
    queryFn: () => paymentService.getProviderPayments(page, PAGE_SIZE),
    enabled: authState.isAuthenticated && authState.user?.role === "PROVIDER",
  });

  const payments = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalEarnings = payments
    .filter((p: PaymentResponse) => p.paymentStatus === "COMPLETED")
    .reduce((sum: number, p: PaymentResponse) => sum + p.amount, 0);

  if (!authState.isAuthenticated || authState.user?.role !== "PROVIDER") {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="mt-1 text-sm text-gray-500">Track your payments and earnings</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-xs text-gray-500">Total Earnings</span>
            <span className="text-2xl font-bold text-green-600">${totalEarnings.toLocaleString()}</span>
          </div>
        </header>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payments found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Request ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: PaymentResponse) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell>{format(new Date(payment.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>{payment.requestId}</TableCell>
                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                        payment.paymentStatus === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : payment.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {payment.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>{payment.transactionId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings; 