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
  const menuRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [userDisplay, setUserDisplay] = useState({ label: "User", displayName: "Tester" });


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
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenDropdown(false);   // ✅ Correct state
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi(); // Call API to logout
      localStorage.removeItem("accessToken"); // Clear access token
      localStorage.removeItem("refreshToken"); // Clear refresh token
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
        className="fixed top-0 z-40 flex items-center px-2 sm:px-3 md:px-4 lg:px-6 shadow-md bg-linear-to-r from-primary to-primary/95 transition-all duration-300"
        style={{
          height: windowWidth < 640 ? '60px' : TOPBAR_HEIGHT,
          right: 0,
          left: windowWidth >= 768 ? sidebarWidth : 0,
          width: windowWidth >= 768 ? `calc(100% - ${sidebarWidth})` : '100%',
        }}
      >
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="md:hidden mr-2 sm:mr-3 p-2 text-white hover:bg-white/20 rounded-lg transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-w-0">

          {/* PROFILE */}
          <div ref={menuRef} className="relative shrink-0">
            <div onClick={() => setOpenDropdown((prev) => !prev)} className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer">
              <div className="relative shrink-0">
                <img
                  src={Images.adminProfile}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-white/30 shadow-sm"
                  alt="Profile"
                />
              </div>
              <div className="hidden sm:block leading-tight min-w-0">
                <p className="font-semibold text-xs sm:text-sm md:text-base text-white truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-none">
                  {userDisplay.label}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-white/90 truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-none">
                  {userDisplay.displayName || (userDisplay.label === "Admin" ? "Admin" : "User")}
                </p>
              </div>
            </div>
            {/* DROPDOWN */}
            {openDropdown && (
              <div className="absolute right-0 mt-3 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-borderColor py-2 z-50 animate-fadeIn">

                {/* SETTINGS */}
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/settings");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Settings
                </button>

                {/* LOGOUT */}
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    setShowLogoutPopup(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header >

      {/* --- LOGOUT POPUP --- */}
      < LogoutPopup
        show={showLogoutPopup}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutPopup(false)}
      />


    </>
  );
};

export default Header;
