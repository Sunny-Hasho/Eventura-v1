import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { Loader2 } from "lucide-react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  requestTitle?: string;
  onSuccess?: () => void;
}

export const DisputeModal = ({
  isOpen,
  onClose,
  paymentId,
  requestTitle,
  onSuccess,
}: DisputeModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the dispute",
        variant: "destructive",
      });
      return;
    }

    if (reason.trim().length < 20) {
      toast({
        title: "Error",
        description: "Please provide a detailed reason (at least 20 characters)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await paymentService.disputePayment(paymentId, reason);
      
      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted for admin review. Payment is now on hold.",
      });

      setReason("");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit dispute",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispute Payment</DialogTitle>
          <DialogDescription>
            Please provide a detailed reason for disputing this payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {requestTitle && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Request:</strong> {requestTitle}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This will freeze the payment until an admin reviews your dispute
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Dispute Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you're disputing this payment (e.g., work quality issues, missing deliverables, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {reason.length} / 500 characters (minimum 20)
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setReason("");
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
