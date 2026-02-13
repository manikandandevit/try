import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

// Chat with AI for quotation (quotationId = persist chat+quotation to that quotation in DB)
export const sendChatMessage = async (message, quotationId = null) => {
    try {
        const payload = { message };
        if (quotationId) payload.quotation_id = quotationId;
        const response = await API.post("/chat/", payload);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get current quotation (session)
export const getQuotation = async () => {
    try {
        const response = await API.get("/quotation/");
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get last quotation ID the current user worked on (for redirect when opening /quotation)
export const getLastQuotationId = async () => {
    try {
        const response = await API.get("/last-quotation-id/");
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get quotation by ID (from database)
export const getQuotationById = async (id) => {
    try {
        const response = await API.get(`/quotation/${id}/`);
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

// Sync quotation from frontend (auto-save to DB when quotation has id)
export const syncQuotation = async (quotation) => {
    try {
        const response = await API.post("/sync-quotation/", { quotation });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Get conversation history (quotationId = load from that quotation in DB)
export const getConversationHistory = async (quotationId = null) => {
    try {
        const params = quotationId ? { quotation_id: String(quotationId) } : {};
        const response = await API.get("/conversation-history/", { params });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Sync conversation history (quotationId = save to that quotation in DB)
export const syncConversationHistory = async (messages, quotationId = null) => {
    try {
        const payload = { messages };
        if (quotationId) payload.quotation_id = quotationId;
        const response = await API.post("/sync-conversation-history/", payload);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Send quotation via email (sets status to submitted)
export const sendQuotationEmail = async (payload) => {
    try {
        const response = await API.post("/send-quotation-email/", payload);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Send quotation via WhatsApp (sets status to submitted, returns wa_link)
export const sendQuotationWhatsApp = async (payload) => {
    try {
        const response = await API.post("/send-quotation-whatsapp/", payload);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Update quotation status (e.g. Submitted → Awarded)
export const updateQuotationStatus = async (quotationId, status) => {
    try {
        const response = await API.patch(`/quotation/${quotationId}/status/`, { status });
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

