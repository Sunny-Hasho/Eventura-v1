export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}


export interface PaymentResponse {
  id: number;
  requestId: number;
  clientId: number;
  providerId: number;
  amount: number;
  paymentStatus: "AWAITING_PAYMENT" | "ESCROWED" | "PENDING_RELEASE" | "RELEASED" | "REFUNDED" | "DISPUTED" | "EXPIRED";
  transactionId: string;
  createdAt: string;
} 

