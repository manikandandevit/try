import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Images } from "../common/assets";
import { TOPBAR_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_MINI_WIDTH } from "../common/constants";
import { logoutApi, getCurrentUserApi } from "../API/authApi"; 
import toast from "../common/toast";
import LogoutPopup from "./LogoutPopup";
// import Notification from "../pages/notification/notification";

const Header = ({ onMenuClick, isSidebarMini }) => {
  const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  // const [openNotification, setOpenNotification] = useState(false);
  const menuRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null
  });
  const [userDisplay, setUserDisplay] = useState({ label: "User", displayName: "Tester" });

  useEffect(() => {
    // Load tokens from localStorage
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    setTokens({ accessToken, refreshToken });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!localStorage.getItem("accessToken")) return;
      const res = await getCurrentUserApi();
      if (res.success && res.label) {
        setUserDisplay({
          label: res.label,
          displayName: res.displayName || (res.label === "Admin" ? "Admin" : "User"),
        });
      }
    };
    fetchUser();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isSidebarMini
    ? SIDEBAR_MINI_WIDTH
    : SIDEBAR_WIDTH;

  /* ---------- CLOSE ON OUTSIDE CLICK (optional) ---------- */
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (menuRef.current && !menuRef.current.contains(e.target)) {
  //       setOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  const handleLogout = async () => {
    try {
      await logoutApi(); // Call API to logout
      localStorage.removeItem("accessToken"); // Clear access token
      localStorage.removeItem("refreshToken"); // Clear refresh token
      setTokens({ accessToken: null, refreshToken: null });
      setUserDisplay({ label: "User", displayName: "Tester" });
      setShowLogoutPopup(false);
      toast.success("Logged out successfully");
      navigate("/"); // Redirect to login/home
    } catch (err) {
      toast.error("Logout failed");
      console.error(err);
    }
  };

  // const handleNotificationToggle = () => {
  //   setOpenNotification((prev) => !prev);
  // };

  return (
    <>
      <header
        className="fixed top-0 z-40 flex items-center px-2 sm:px-3 md:px-4 lg:px-6 shadow-md bg-gradient-to-r from-primary to-primary/95 transition-all duration-300"
        style={{
          height: windowWidth < 640 ? '60px' : TOPBAR_HEIGHT,
          right: 0,
          left: windowWidth >= 768 ? sidebarWidth : 0,
        }}
      >
        {/* MOBILE MENU */}
        <button 
          onClick={onMenuClick} 
          className="md:hidden mr-2 sm:mr-3 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {/* TOKEN VIEW TOGGLE */}
          {/* <button
            onClick={() => setShowTokens(!showTokens)}
            className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-md text-white transition"
          >
            {showTokens ? "Hide Tokens" : "Show Tokens"}
          </button> */}

          {/* NOTIFICATION */}
          <div 
            className="relative cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors" 
            // onClick={handleNotificationToggle}
            title="Notifications"
          >
            <img src={Images.bellIcon} className="w-4 h-4 sm:w-5 sm:h-5" alt="Notifications" />
            <span className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-primary" />
          </div>

          {/* PROFILE */}
          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="relative">
                <img
                  src={Images.adminProfile}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-white/30 shadow-sm"
                  alt="Profile"
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-semibold text-xs sm:text-sm md:text-base text-white truncate max-w-[100px] sm:max-w-[120px] md:max-w-none">
                  {userDisplay.label}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white/90 truncate max-w-[100px] sm:max-w-[120px] md:max-w-none">
                  {userDisplay.displayName || (userDisplay.label === "Admin" ? "Admin" : "User")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- TOKEN DISPLAY MODAL --- */}
      {showTokens && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-textPrimary">Local Storage Tokens</h2>
              <button
                onClick={() => setShowTokens(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Access Token */}
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Access Token
                </label>
                <div className="bg-gray-50 border border-borderColor rounded-md p-3">
                  <p className="text-xs text-gray-700 break-all font-mono">
                    {tokens.accessToken || "Not found in localStorage"}
                  </p>
                </div>
              </div>

              {/* Refresh Token */}
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Refresh Token
                </label>
                <div className="bg-gray-50 border border-borderColor rounded-md p-3">
                  <p className="text-xs text-gray-700 break-all font-mono">
                    {tokens.refreshToken || "Not found in localStorage"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTokens(false)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT POPUP --- */}
      <LogoutPopup
        show={showLogoutPopup}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutPopup(false)}
      />

      {/* <Notification
        open={openNotification}
        onClose={() => setOpenNotification(false)}
      /> */}
    </>
  );
};

export default Header;
