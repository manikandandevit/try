import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

// Login API
export const loginApi = async (data) => {
    try {
        const response = await API.post("/login", data);
        const res = handleSuccess(response);
        console.log('resssssssssssss: ', res);

        if (res.success) {
            localStorage.setItem("accessToken", res.data.accessToken);
        }

        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Logout API
export const logoutApi = async () => {
    try {
        await API.post(
            "/logout",
            {},
            { withCredentials: true }
        );
    } catch (err) {
        console.error("Logout failed", err);
    } finally {
        localStorage.removeItem("accessToken");
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
