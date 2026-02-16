import { LoginRequest, RegisterRequest, UpdateUserRequest, User } from "@/types/auth";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

export const authService = {
  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Email already exists");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Registration failed");
    }
  },

  async login(data: LoginRequest): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        }
        throw new Error("Login failed");
      }

      // Backend now returns "OTP_SENT" string instead of JWT for first step
      const result = await response.text();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Login failed");
    }
  },

  async googleLogin(token: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/google/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No account found. Please sign up first.");
        }
        throw new Error("Google Login failed");
      }

      const jwtToken = await response.text();
      return jwtToken;
    } catch (error) {
       if (error instanceof Error) {
        throw error;
      }
      throw new Error("Google Login failed");
    }
  },

  async googleSignUp(token: string, role: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/google/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, role }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Account already exists. Please log in instead.");
        }
        throw new Error("Google Sign Up failed");
      }

      const jwtToken = await response.text();
      return jwtToken;
    } catch (error) {
       if (error instanceof Error) {
        throw error;
      }
      throw new Error("Google Sign Up failed");
    }
  },

  async verifyOtp(email: string, otp: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
         if (response.status === 401) {
           throw new Error("Invalid OTP");
         }
         throw new Error("OTP verification failed");
      }

      const token = await response.text();
      return token;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("OTP verification failed");
    }
  },

  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found with this email");
        }
        throw new Error("Failed to send OTP");
      }

      return await response.text(); // Returns "OTP_SENT"
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to send OTP");
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OTP or Expired");
        }
        throw new Error("Failed to reset password");
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to reset password");
    }
  },

  async initiateChangePassword(email: string, token: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/change-password/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate password change");
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to initiate password change");
    }
  },

  async changePassword(email: string, otp: string, newPassword: string, token: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/users/change-password/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OTP or Expired");
        }
        throw new Error("Failed to change password");
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to change password");
    }
  },

  async getUserInfo(token: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get user info");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get user info");
    }
  },

  async updateProfile(token: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Email already in use");
        }
        throw new Error("Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update profile");
    }
  },

  async deleteAccount(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete account");
    }
  },

  saveToken(token: string): void {
    localStorage.setItem("token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  removeToken(): void {
    localStorage.removeItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  },

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    const payload = this.parseJwt(token);
    return payload?.role || null;
  }
};
