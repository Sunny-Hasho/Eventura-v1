export type PaymentStatus = "AWAITING_PAYMENT" | "ESCROWED" | "RELEASED" | "REFUNDED" | "DISPUTED";

export interface PaymentResponse {
  id: number;
  requestId: number;
  clientId: number;
  providerId: number;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  providerAmount?: number;
  platformFee?: number;
}

export interface CreatePaymentRequest {
  requestId: number;
  amount: number;
}
