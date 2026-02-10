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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { Loader2 } from "lucide-react";

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  amount: number;
  pitchDetails?: {
    providerName: string;
    serviceType: string;
  };
  onSuccess?: () => void;
}

export const PaymentConfirmModal = ({
  isOpen,
  onClose,
  paymentId,
  amount,
  pitchDetails,
  onSuccess,
}: PaymentConfirmModalProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const platformFee = amount * 0.1;
  const total = amount;

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await paymentService.markAsPaid(paymentId, transactionId);
      
      toast({
        title: "Success",
        description: "Payment confirmed! The provider can now start work.",
      });

      setTransactionId("");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>
            Please complete the payment and enter your transaction ID below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {pitchDetails && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">{pitchDetails.providerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{pitchDetails.serviceType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Amount:</span>
                <span className="font-medium">Rs {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (10%):</span>
                <span className="font-medium">Rs {platformFee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total to Pay:</span>
                <span className="text-green-600">Rs {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="Enter your transaction reference number"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              After completing the payment, enter the transaction ID or reference number provided by your payment method
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
