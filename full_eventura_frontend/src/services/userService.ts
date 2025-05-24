import { getAuthToken } from "@/utils/auth";
import { UserResponse } from "@/types/user";

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
}; 