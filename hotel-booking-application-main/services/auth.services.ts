// services/auth.service.ts
// import { jwtDecode } from "jwt-decode";
import { SessionService } from "./session.services";
interface LoginResponse {
  message: string;
  profile: {
    id: string;
    name: string;
    businessName: string;
    email: string;
    address: string;
    branch: string;
    profileImage: string;
    services: string[];
    token: string;
  };
}

// interface RegisterResponse {
//   message: string;
//   vendor: {
//     name: string;
//     email: string;
//     phone: string;
//     address: string;
//     role: string;
//     profileImage: string;
//     services: string[];
//     _id: string;
//     createdAt: string;
//     updatedAt: string;
//   };
// }

interface RegisterData {
  name: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  branch?: string;
  password: string;
  role: string;
  services: string[];
}

interface PaymentDetalsProps {
  accountNumber: string;
  bankAccountName: string;
  bankCode: string;
  bankName: string;
  paystackSubAccount: string;
  percentageCharge: number;
  recipientCode: string;
}

export interface AuthUser {
  email: string;
  role: string;
  token?: string;
  id: string;
  profile: {
    id: string;
    businessName: string;
    email: string;
    address: string;
    branch: string;
    profileImage: string;
    phone: number;
    paymentDetails: PaymentDetalsProps;
    recipientCode: string;
  };
}

export class AuthService {
  private static BASE_URL =
    "https://hotel-booking-app-backend-30q1.onrender.com";
  private static TOKEN_KEY = "auth_token";
  private static USER_KEY = "auth_user";
  private static SESSION_ID_KEY = "session_id";

  static async register(data: RegisterData) {
    try {
      // const url = `${this.BASE_URL}/api/vendors/register`;
      // console.log("Making registration request to:", url);

      const response = await fetch(`${this.BASE_URL}/api/vendors/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          businessName: data.businessName,
          businessType: data.businessType,
          email: data.email,
          phone: data.phone,
          address: data.address,
          branch: data.branch || "",
          password: data.password,
          role: data.role,
          services: data.services,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  static async verifyOTP(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/api/vendors/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "OTP verification failed");
    }

    return response.json();
  }

  // auth.services.ts - Enhanced error handling
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log("Starting login attempt with:", { email }); // Log the attempt

      const response = await fetch(`${this.BASE_URL}/api/vendors/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin", // Change from 'include' to 'same-origin' if cookies are on the same domain
      });

      console.log("Response status:", response.status); // Log the response status

      const data = await response.json();
      console.log("Response data:", data); // Log the response data

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Create session
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      const session = await SessionService.createSession(
        data.profile.id,
        data.profile.token,
        expiresAt
      );

      // Store session ID
      localStorage.setItem(this.SESSION_ID_KEY, session._id);
      // Store auth data
      this.setToken(data.profile.token);
      this.setUser({
        email: data.profile.email,
        role: data.profile.role || "vendor",
        token: data.profile.token,
        profile: data.profile,
        id: data.profile.id,
      });

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async resendOTP(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/api/vendors/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to resend OTP");
    }

    return response.json();
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      // Check both cookie and localStorage
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];
      return cookieToken || localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      // Set both cookie and localStorage
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  static getUser(): AuthUser | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  static setUser(user: AuthUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static async logout(): Promise<void> {
    try {
      const sessionId = localStorage.getItem(this.SESSION_ID_KEY);
      if (sessionId) {
        await SessionService.deleteSession(sessionId);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      this.clearAuth();
    }
  }

  private static clearAuth(): void {
    if (typeof window !== "undefined") {
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.SESSION_ID_KEY);
    }
  }

  static async checkSession(): Promise<boolean> {
    try {
      const sessionId = localStorage.getItem(this.SESSION_ID_KEY);
      if (!sessionId) return false;

      const session = await SessionService.getSession(sessionId);

      if (SessionService.isSessionExpired(session.expiresAt)) {
        this.clearAuth();
        return false;
      }

      return true;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  static isAuthorized(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? allowedRoles.includes(userRole) : false;
  }
}
