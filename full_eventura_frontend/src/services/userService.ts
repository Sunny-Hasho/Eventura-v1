import { getAuthToken } from "@/utils/auth";
import { UserResponse } from "@/types/user";
import { Page } from "@/types/common";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export type { UserResponse };

export const userService = {
  async getUserById(userId: number): Promise<UserResponse> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Not authenticated");
        }
        if (response.status === 404) {
          throw new Error("User not found");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch user");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch user");
    }
  },

  // New function for admin to fetch all users (paginated)
  async getAllUsers(page: number, size: number, sort?: string): Promise<Page<UserResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("size", size.toString());
    if (sort) queryParams.append("sort", sort);
    const endpoint = `${API_URL}/api/admin/users?${queryParams.toString()}`;
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();
    return data;
  }
}; 