import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

// Login API
export const loginApi = async (data) => {
    try {
        const response = await API.post("/login/", data);
        const res = handleSuccess(response);
        console.log('Login API response: ', res);
        console.log('Login API response.data: ', res.data);

        if (res.success) {
            // Store both access token and refresh token
            // Backend returns tokens at top level, handleSuccess wraps in res.data
            const accessToken = res.data?.accessToken || res.data?.access_token || response.data?.access_token;
            const refreshToken = res.data?.refreshToken || res.data?.refresh_token || response.data?.refresh_token;
            
            console.log('Access Token:', accessToken ? 'Found' : 'Not found');
            console.log('Refresh Token:', refreshToken ? 'Found' : 'Not found');
            
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }
        }

        return res;
    } catch (err) {
        console.error('Login API error:', err);
        return handleError(err);
    }
};

// Logout API
export const logoutApi = async () => {
    try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Send refresh token to backend for revocation
        if (refreshToken) {
            await API.post(
                "/logout/",
                { refresh_token: refreshToken },
                { withCredentials: true }
            );
        }
    } catch (err) {
        console.error("Logout failed", err);
    } finally {
        // Always remove tokens from localStorage, even if API call fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
};

// Change password API
export const changePasswordApi = async (data) => {
    try {
        const response = await API.post("/change-password", data);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Reset password API
export const resetPasswordApi = async (token, newPassword, confirmPassword) => {
    console.log(token);
    try {
        const response = await API.post("/reset-password", { token, newPassword, confirmPassword });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Verify reset token API
export const VerifyTokenApi = async (token) => {
    try {
        const response = await API.get("/verify-reset-token", {
            params: { token }
        });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Forgot password API
export const ForgotApi = async (data) => {
    try {
        const response = await API.post("/forget-password", data);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get current user info (for navbar - label and display name)
export const getCurrentUserApi = async () => {
    try {
        const response = await API.get("/check-auth/");
        const data = response.data || {};
        if (data.authenticated) {
            const userType = data.user_type || "user";
            const userName = data.user_name || "";
            const userDetails = data.user_details || {};
            const companyName = userDetails.company_name || "";
            return {
                success: true,
                userType,
                label: userType === "company" ? "Admin" : "User",
                displayName: userType === "company" ? companyName : userName,
                createdAt: userDetails.created_at || null,
            };
        }
        return { success: false };
    } catch (err) {
        console.error("getCurrentUser error:", err);
        return { success: false };
    }
};

// Get company login images API (public endpoint)
export const getCompanyLoginApi = async () => {
    try {
        const response = await API.get("/company-login/");
        console.log("Company login API raw response:", response);
        console.log("Company login API response.data:", response.data);
        
        // This endpoint returns data directly as JsonResponse, so response.data contains the object
        const responseData = response.data || {};
        console.log("Parsed response data:", responseData);
        
        return {
            success: true,
            data: responseData
        };
    } catch (err) {
        console.error("Error fetching company login images:", err);
        console.error("Error details:", err.response?.data);
        // Return default values on error
        return {
            success: false,
            data: {
                login_logo_url: null,
                login_image_url: null
            }
        };
    }
};