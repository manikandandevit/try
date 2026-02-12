import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

// Get company details API
export const getCompanyDetails = async () => {
    try {
        const response = await API.get("/company-details/");
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

// Update company details API
export const updateCompanyDetails = async (formData) => {
    try {
        // Check if formData has files
        const hasFiles = formData instanceof FormData;
        
        const config = {
            headers: {
                'Content-Type': hasFiles ? 'multipart/form-data' : 'application/json',
            },
        };
        
        // Use POST for FormData (file uploads), PUT for JSON
        const method = hasFiles ? 'post' : 'put';
        const response = await API[method]("/company-details/update/", formData, config);
        const res = handleSuccess(response);
        return res;
    } catch (err) {
        return handleError(err);
    }
};

