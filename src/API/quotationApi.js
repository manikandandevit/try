import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

// Chat with AI for quotation
export const sendChatMessage = async (message) => {
    try {
        const response = await API.post("/chat/", { message });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get current quotation
export const getQuotation = async () => {
    try {
        const response = await API.get("/quotation/");
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Reset quotation
export const resetQuotation = async () => {
    try {
        const response = await API.post("/reset/");
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Sync quotation from frontend
export const syncQuotation = async (quotation) => {
    try {
        const response = await API.post("/sync-quotation/", { quotation });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get conversation history
export const getConversationHistory = async () => {
    try {
        const response = await API.get("/conversation-history/");
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Sync conversation history from frontend
export const syncConversationHistory = async (messages) => {
    try {
        const response = await API.post("/sync-conversation-history/", { messages });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

