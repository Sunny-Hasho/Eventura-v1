import { Badge } from "@/components/ui/badge";

export type PaymentStatus =
  | "AWAITING_PAYMENT"
  | "ESCROWED"
  | "PENDING_RELEASE"
  | "RELEASED"
  | "REFUNDED"
  | "DISPUTED"
  | "EXPIRED";

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "AWAITING_PAYMENT":
        return {
          variant: "outline" as const,
          className: "border-yellow-500 text-yellow-700 bg-yellow-50",
          label: "⏳ Awaiting Payment",
        };
      case "ESCROWED":
        return {
          variant: "outline" as const,
          className: "border-blue-500 text-blue-700 bg-blue-50",
          label: "🔒 Payment Escrowed",
        };
      case "PENDING_RELEASE":
        return {
          variant: "outline" as const,
          className: "border-orange-500 text-orange-700 bg-orange-50",
          label: "⏱️ Pending Release",
        };
      case "RELEASED":
        return {
          variant: "default" as const,
          className: "bg-green-600 text-white",
          label: "✅ Payment Released",
        };
      case "REFUNDED":
        return {
          variant: "outline" as const,
          className: "border-gray-500 text-gray-700 bg-gray-50",
          label: "↩️ Refunded",
        };
      case "DISPUTED":
        return {
          variant: "destructive" as const,
          className: "",
          label: "⚠️ Disputed",
        };
      case "EXPIRED":
        return {
          variant: "outline" as const,
          className: "border-gray-400 text-gray-600 bg-gray-50",
          label: "⌛ Expired",
        };
      default:
        return {
          variant: "outline" as const,
          className: "",
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
