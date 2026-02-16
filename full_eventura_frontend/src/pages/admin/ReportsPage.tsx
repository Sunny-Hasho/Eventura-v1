import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import { reportService, Report } from "@/services/reportService";

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch Reports
  const { data: reportsPage, isLoading } = useQuery({
    queryKey: ["admin-reports", statusFilter],
    queryFn: () => reportService.getAllReports(statusFilter === "ALL" ? undefined : statusFilter),
  });

  const reports = reportsPage?.content || [];

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      reportService.updateReportStatus(id, status),
    onSuccess: () => {
      toast.success("Report status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: any) => {
        toast.error("Failed to update status: " + (error.response?.data?.message || error.message));
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "DISMISSED": return "bg-gray-100 text-gray-800";
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
            <h2 className="text-3xl font-bold tracking-tight">User Reports</h2>
          </div>

          <div className="flex items-center space-x-2 py-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Reports</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Loading reports...
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: Report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">#{report.id}</TableCell>
                      <TableCell>
                        {report.reportedBy.firstName} {report.reportedBy.lastName}
                        <br/>
                        <span className="text-xs text-muted-foreground">{report.reportedBy.email}</span>
                      </TableCell>
                      <TableCell>
                        {report.reportedUser.firstName} {report.reportedUser.lastName}
                        <br/>
                        <span className="text-xs text-muted-foreground">{report.reportedUser.email}</span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={report.reason}>
                        {report.reason}
                        {report.request && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Request: #{report.request.id} {report.request.title}
                            </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(report.createdAt), "PP")}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {report.status === "PENDING" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => statusMutation.mutate({ id: report.id, status: "DISMISSED" })}
                              disabled={statusMutation.isPending}
                            >
                              Dismiss
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => statusMutation.mutate({ id: report.id, status: "RESOLVED" })}
                              disabled={statusMutation.isPending}
                            >
                              Resolve
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
    </div>
  );
}
