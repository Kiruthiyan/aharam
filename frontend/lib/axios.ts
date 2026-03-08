import axios from "axios";
import { toast } from "sonner";

// Define the API Response interface matching the Spring Boot backend
export interface ApiResponse<T> {
    status: "success" | "error";
    data: T;
    message: string;
    timestamp: string;
    errorCode?: string;
    path?: string;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Check for token in localStorage (if running in browser)
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        // If the backend returned an ApiResponse<T>, we can unwrap it or just return data directly
        // Since our components expect the full ApiResponse (to access the message), we'll return response.data
        return response.data;
    },
    (error) => {
        // Handle Network Errors
        if (!error.response) {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081/api";
            const message = `Cannot connect to backend (${backendUrl}). Start backend server and try again.`;
            toast.error(message);
            return Promise.reject({ message });
        }

        const statusCode = error.response.status;
        const errorData = error.response.data as ApiResponse<unknown>;
        const errorMessage = errorData?.message || "An unexpected error occurred";

        // Global Error Handling
        if (statusCode === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("userRole");
                localStorage.removeItem("username");
                localStorage.removeItem("name");
                localStorage.removeItem("userId");
                localStorage.removeItem("requirePasswordChange");
                const isLoginPage = window.location.pathname === "/login";
                if (!isLoginPage) {
                    toast.error("Session expired. Please log in again.");
                    window.location.href = "/login";
                }
            }
        } else if (statusCode === 403) {
            toast.error("You don't have permission to perform this action.");
        } else if (statusCode >= 500) {
            toast.error("Server error. Please try again later.");
        } else {
            // 400 Bad Request, 404 Not Found, etc.
            toast.error(errorMessage);
        }

        return Promise.reject(error.response.data);
    }
);

export default api;
