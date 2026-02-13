
/**
 * Handle API success response
 */
export const handleSuccess = (response) => {
  return {
    status: response.status || 200,
    success: response.data?.success !== undefined ? response.data.success : true,
    message: response.data?.message || "Success",
    data: response.data?.data || response.data, // fallback if data is not nested
    error: null,
  };
};


/**
 * Handle API error response
 */
export const handleError = (error) => {
  const errorData = error.response?.data || {};

  return {
    status: error.response?.status || 500,
    success: false,
    message: errorData.message || errorData.error || error.message || "Something went wrong",
    data: null,
    error: errorData.errors || errorData.error || error,
    errorCode: errorData.errorCode || null,
  };
};
