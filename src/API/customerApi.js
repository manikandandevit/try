import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

/* ===================== CUSTOMER/CLIENT ===================== */

// GET ALL CUSTOMERS (with optional search)
export const getAllCustomersApi = async (search = "") => {
  try {
    const params = search ? { search } : {};
    const response = await API.get("/clients/", { params });
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// GET DASHBOARD STATS (KPIs, monthly sends for bar chart, pie chart data)
export const getDashboardStatsApi = async (year, month = null, weekDate = null) => {
  try {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (weekDate) params.week_date = weekDate;
    const response = await API.get("/dashboard-stats/", { params });
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// GET DASHBOARD CUSTOMER LIST (chart keela - same shape as recentDetails table)
export const getDashboardCustomersApi = async (limit = 20) => {
  try {
    const response = await API.get("/dashboard-customers/", {
      params: limit ? { limit } : {},
    });
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// CREATE CUSTOMER
export const addCustomerApi = async (data) => {
  try {
    // Map frontend fields to backend fields
    const payload = {
      customer_name: data.customerName || data.name,
      company_name: data.companyName || data.company || "",
      phone_number: data.phone || "",
      email: data.email,
      address: data.address || "",
    };
    const response = await API.post("/clients/", payload);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// UPDATE CUSTOMER
export const updateCustomerApi = async (id, data) => {
  try {
    // Map frontend fields to backend fields
    const payload = {
      customer_name: data.customerName || data.name,
      company_name: data.companyName || data.company || "",
      phone_number: data.phone || "",
      email: data.email,
      address: data.address || "",
    };
    const response = await API.put(`/clients/${id}/`, payload);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// DELETE CUSTOMER
export const deleteCustomerApi = async (id) => {
  try {
    const response = await API.delete(`/clients/${id}/`);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// UPDATE CUSTOMER STATUS (Toggle is_active)
// Note: This requires current customer data because backend PUT requires customer_name and email
export const updateCustomerStatusApi = async (id, isActive, currentCustomerData = null) => {
  try {
    let payload;
    
    if (currentCustomerData) {
      // Use provided current data
      payload = {
        customer_name: currentCustomerData.customer_name || currentCustomerData.name,
        company_name: currentCustomerData.company_name || currentCustomerData.company || "",
        phone_number: currentCustomerData.phone_number || currentCustomerData.phone || "",
        email: currentCustomerData.email,
        address: currentCustomerData.address || "",
        is_active: isActive,
      };
    } else {
      // Try to get current data from API
      const getResponse = await API.get("/clients/");
      const clients = getResponse.data?.clients || getResponse.data || [];
      const currentClient = clients.find((c) => c.id === id);
      
      if (!currentClient) {
        throw new Error("Customer not found");
      }
      
      payload = {
        customer_name: currentClient.customer_name,
        company_name: currentClient.company_name || "",
        phone_number: currentClient.phone_number || "",
        email: currentClient.email,
        address: currentClient.address || "",
        is_active: isActive,
      };
    }
    
    const response = await API.put(`/clients/${id}/`, payload);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// GET CUSTOMER QUOTATIONS
export const getCustomerQuotationsApi = async (customerId) => {
  try {
    const response = await API.get(`/clients/${customerId}/quotations/`);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// CREATE DRAFT QUOTATION FOR A CUSTOMER
export const createCustomerQuotationApi = async (customerId) => {
  try {
    const response = await API.post(`/clients/${customerId}/quotations/`);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

