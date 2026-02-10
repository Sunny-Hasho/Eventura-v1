import { PaymentResponse } from "@/types/payment";
import { getAuthToken } from "@/utils/auth";
import { UserResponse } from "@/types/user";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
}

export const adminService = {
  async getAllPayments(page: number = 0, status: string = "ALL"): Promise<PageResponse<PaymentResponse>> {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const url = status === "ALL" 
      ? `${API_URL}/api/admin/payments?page=${page}`
      : `${API_URL}/api/admin/payments?page=${page}&status=${status}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch payments");
    return response.json();
  },

  async releasePayment(paymentId: number): Promise<PaymentResponse> {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/payments/${paymentId}/release`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to release payment");
    return response.json();
  },

  async refundPayment(paymentId: number, reason: string): Promise<PaymentResponse> {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/payments/${paymentId}/refund`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) throw new Error("Failed to refund payment");
    return response.json();
  },

  async updateUserStatus(userId: number, status: string): Promise<UserResponse> {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: status, // Controller expects plain string body
    });

    if (!response.ok) throw new Error("Failed to update user status");
    return response.json();
  }
};
