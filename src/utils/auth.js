// utils/auth.js
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};
