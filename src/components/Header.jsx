import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Images } from "../common/assets";
import { TOPBAR_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_MINI_WIDTH } from "../common/constants";
import { logoutApi } from "../API/authApi"; 
import toast from "../common/toast";
import LogoutPopup from "./LogoutPopup";
// import Notification from "../pages/notification/notification";

const Header = ({ onMenuClick, isSidebarMini }) => {
  const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  // const [openNotification, setOpenNotification] = useState(false);
  const menuRef = useRef(null);

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
      localStorage.removeItem("accessToken"); // Clear token
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
        className="fixed top-0 z-40 flex items-center px-4 md:px-6 shadow-sm bg-primary transition-all duration-300"
        style={{
          height: TOPBAR_HEIGHT,
          right: 0,
          left: window.innerWidth >= 768 ? sidebarWidth : 0,
        }}
      >
        {/* MOBILE MENU */}
        <button onClick={onMenuClick} className="md:hidden mr-4 text-2xl">
          ☰
        </button>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-4 md:gap-6">
          {/* NOTIFICATION */}
          <div className="relative cursor-pointer" 
          // onClick={handleNotificationToggle}
          >
            <img src={Images.bellIcon} className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>

          {/* PROFILE */}
          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-2 md:gap-3">
              <img
                src={Images.adminProfile}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full"
              />
              <div className="hidden md:block leading-tight">
                <p className="font-semibold text-base text-white">
                  Tester
                </p>
                <p className="text-sm font-medium text-white">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

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
