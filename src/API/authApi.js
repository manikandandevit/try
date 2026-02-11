import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

// Login API
export const loginApi = async (data) => {
    try {
        const response = await API.post("/login/", data);
        const res = handleSuccess(response);
        console.log('resssssssssssss: ', res);

        if (res.success) {
            // Store both access token and refresh token
            const accessToken = res.data.accessToken || res.data.access_token;
            const refreshToken = res.data.refreshToken || res.data.refresh_token;
            
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }
        }

        return res;
    } catch (err) {
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
