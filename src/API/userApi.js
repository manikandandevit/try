import API from "./axios";
import { handleSuccess, handleError } from "./apiHelper";

/* ===================== USER ===================== */

// CREATE USER
export const addUserApi = async (data) => {
  try {
    const response = await API.post("/users/", data);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};



// UPDATE USER
export const updateUserApi = async (id, data) => {
  try {
    const response = await API.put(`/users/${id}/`, data);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// GET ALL USERS
export const getAllUsersApi = async ({ page, limit, search, isActive }) => {
  try {
    const response = await API.get("/get-all-users/", {
      params: { page, limit, search, isActive },
    });
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// GET USER BY ID
export const getUserByIdApi = async (id) => {
  try {
    const response = await API.get(`/user/${id}/`);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// UPDATE USER STATUS (Activate / Deactivate)
export const updateUserStatusApi = async (id) => {
  try {
    const response = await API.put(`/user/status/${id}/`);
    const res = handleSuccess(response);
    return res;
  } catch (err) {
    return handleError(err);
  }
};

// GET ACTIVE DEPARTMENTS (for dropdown in user form)
export const getActiveDepartmentsApi = async () => {
    try {
        const response = await API.get("/get-active-departments/");
        return handleSuccess(response);
    } catch (err) {
        return handleError(err);
    }
};