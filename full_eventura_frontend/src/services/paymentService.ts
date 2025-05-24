import { getAuthToken } from "@/utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface PaymentResponse {
  id: number;
  requestId: number;
  clientId: number;
  providerId: number;
  amount: number;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  transactionId: string;
  createdAt: string;
}

class PaymentService {
  async createPayment(data: { requestId: number; amount: number; paymentMethod: string }) {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Payment failed");
    return await response.json();
  }

  async getPaymentStatusByRequestId(requestId: number): Promise<PaymentResponse> {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/payments/request/${requestId}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("No payment found for this request");
      }
      throw new Error("Failed to fetch payment status");
    }

    return await response.json();
  }
}

export const paymentService = new PaymentService(); 