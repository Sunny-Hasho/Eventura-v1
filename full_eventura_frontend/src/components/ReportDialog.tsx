import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reportService } from "@/services/reportService";
import { Loader2 } from "lucide-react";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: number;
  requestId?: number;
  reporterName?: string; // Optional context for the title
}

export function ReportDialog({ isOpen, onClose, reportedUserId, requestId }: ReportDialogProps) {
  const [reason, setReason] = useState("");

  const reportMutation = useMutation({
    mutationFn: reportService.createReport,
    onSuccess: () => {
      toast.success("Report submitted successfully. Admins will review it.");
      setReason("");
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to submit report: " + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the report.");
      return;
    }
    reportMutation.mutate({
      reportedUserId,
      requestId,
      reason,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            Please describe the issue with this user/request.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Describe the issue (e.g., Rude behavior, No show, Scam attempt)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={reportMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={reportMutation.isPending}>
            {reportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
