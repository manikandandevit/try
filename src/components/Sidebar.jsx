import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { bottomMenus, ProtectedRoutes } from "../routes/routesConfig";
import { Images } from "../common/assets";
import { ChevronLeft, ChevronRight, Dot, X } from "lucide-react";
import { SIDEBAR_WIDTH, SIDEBAR_MINI_WIDTH } from "../common/constants";
import { logoutApi } from "../API/authApi";
import { getCompanyDetails } from "../API/companyApi";
import { CONFIG } from "../API/config";
import toast from "../common/toast";
import LogoutPopup from "./LogoutPopup";

const Sidebar = ({ isOpen, isMini, onClose, onMini, onExpand }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openIndex, setOpenIndex] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [loginLogo, setLoginLogo] = useState(Images.fullLogo);
  const [quotationLogo, setQuotationLogo] = useState(Images.smLogo);

  const token = localStorage.getItem("accessToken");
  const width = isMini ? SIDEBAR_MINI_WIDTH : SIDEBAR_WIDTH;

  // Helper function to construct full media URL
  const constructMediaUrl = (relativeUrl) => {
    if (!relativeUrl ||
      relativeUrl === null ||
      relativeUrl === 'null' ||
      relativeUrl === undefined ||
      String(relativeUrl).trim() === '') {
      return null;
    }

    let url = String(relativeUrl).trim();

    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Get base URL and remove /api if present (media files are served at root level, not under /api)
    let baseUrl = (CONFIG.BASE_URL || '').replace(/\/$/, '');
    // Remove /api from the end of base URL since media files are at root level
    baseUrl = baseUrl.replace(/\/api$/, '');

    // Ensure URL starts with /
    const mediaUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${mediaUrl}`;
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token]);

  // Fetch company logos on component mount
  useEffect(() => {
    const fetchCompanyLogos = async () => {
      try {
        const res = await getCompanyDetails();
        if (res.success && res.data?.company) {
          const company = res.data.company;

          // Process login logo (for full sidebar)
          const loginLogoUrl = company.login_logo_url;
          const fullLoginLogoUrl = constructMediaUrl(loginLogoUrl);
          if (fullLoginLogoUrl) {
            setLoginLogo(fullLoginLogoUrl);
          }

          // Process quotation logo (for mini sidebar)
          const quotationLogoUrl = company.quotation_logo_url;
          const fullQuotationLogoUrl = constructMediaUrl(quotationLogoUrl);
          if (fullQuotationLogoUrl) {
            setQuotationLogo(fullQuotationLogoUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching company logos:", err);
        // Keep default logos on error
      }
    };

    if (token) {
      fetchCompanyLogos();
    }
  }, [token]);

  const handleLogout = async () => {
    try {
      await logoutApi();
      localStorage.removeItem("accessToken");
      setShowLogoutPopup(false);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
      console.error(err);
    }
  };

  const renderMenu = (item, index, isSub = false) => {
    const hasChildren = item.children?.length > 0;
    const isActive =
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/") ||
      item.children?.some(
        (c) =>
          location.pathname === c.path ||
          location.pathname.startsWith(c.path + "/")
      );

    return (
      <div key={item.name}>
        <button
          onClick={() => {
            if (hasChildren) {
              setOpenIndex(openIndex === index ? null : index);
            } else if (item.path) {
              navigate(item.path);
              onClose?.();
            }
          }}
          className={`
          w-full flex items-center justify-between
          px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium
          transition-all duration-200
          ${isSub ? "pl-8 sm:pl-10" : ""}
          ${isActive
              ? "bg-white text-primary border-r-4 border-primary shadow-sm" // Active menu
              : "text-white/80 hover:bg-white/10 hover:text-white"
            }
        `}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isSub ? (
              <Dot size={16} className={`sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-white"}`} />
            ) : (
              <img
                src={isActive && item.activeIcon ? item.activeIcon : item.icon}
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                alt={item.name}
              />
            )}
            {!isMini && (
              <span className="truncate text-xs sm:text-sm md:text-base">{item.name}</span>
            )}
          </div>

          {!isMini && hasChildren && (
            <ChevronRight
              size={14}
              className={`sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openIndex === index ? "rotate-90" : ""}`}
            />
          )}
        </button>

        {!isMini && hasChildren && openIndex === index && (
          <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1 bg-white/5 rounded-lg mx-2 sm:mx-0">
            {item.children.map((child, i) =>
              renderMenu(child, `${index}-${i}`, true)
            )}
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen bg-gradient-to-b from-primary to-primary/95 z-50 transition-all duration-300 flex flex-col shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ width }}
      >
        {/* LOGO */}
        <div className="h-16 sm:h-18 md:h-20 flex items-center justify-center relative border-b border-white/10">
          <img
            src={isMini ? quotationLogo : loginLogo}
            alt="Logo"
            className={`transition-all object-contain ${
              isMini 
                ? "w-8 h-8 sm:w-10 sm:h-10" 
                : "w-32 h-auto sm:w-36 md:w-45 max-h-12 sm:max-h-14 md:max-h-16"
            }`}
            onError={(e) => {
              // Fallback to default logo if backend logo fails to load
              e.target.src = isMini ? Images.smLogo : Images.fullLogo;
            }}
          />

          {!isMini && (
            <button
              onClick={onMini}
              className="absolute right-2 sm:right-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 hidden md:block transition-all"
              title="Minimize sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <button
            onClick={onClose}
            className="absolute right-2 sm:right-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 md:hidden transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isMini && (
          <button
            onClick={onExpand}
            className="mx-auto mt-2 sm:mt-3 block text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 md:block transition-all"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* SCROLLABLE MENUS */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-1 sm:px-0">
          {/* MAIN MENUS */}
          <nav className="mt-4 sm:mt-6 md:mt-8 space-y-0.5 sm:space-y-1">
            {ProtectedRoutes.filter((r) => r.showInSidebar && !r.group)
              .map((item, index) => renderMenu(item, index))}
          </nav>

          {/* GROUPS */}
          {ProtectedRoutes.filter((r) => r.group).map((group) => (
            <div key={group.group} className="mt-4 sm:mt-6 px-2 sm:px-4">
              {!isMini && (
                <p className="text-[10px] sm:text-xs text-white/60 uppercase mb-2 sm:mb-3 tracking-wide font-semibold px-2">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5 sm:space-y-1">
                {group.menus.map((item, index) =>
                  renderMenu(item, `g-${index}`)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM MENUS */}
        <div className="py-2 sm:py-3 border-t border-white/10">
          {bottomMenus.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  onClose?.();
                }}
                className={`
          w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium
          transition-all duration-200
          ${isActive
                    ? "bg-white text-primary border-r-4 border-primary shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
        `}
              >
                <img
                  src={isActive ? item.activeIcon : item.icon}
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                  alt={item.name}
                />
                {!isMini && (
                  <span className="truncate text-xs sm:text-sm md:text-base">{item.name}</span>
                )}
              </button>
            );
          })}

          {/* LOGOUT */}
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-white/80 hover:bg-red-500/20 hover:text-white transition-all duration-200 text-sm sm:text-base font-medium"
          >
            <img src={Images.logoutIcon} className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" alt="Logout" />
            {!isMini && <span className="truncate text-xs sm:text-sm md:text-base">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Reusable LogoutPopup */}
      <LogoutPopup
        show={showLogoutPopup}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutPopup(false)}
      />
    </>
  );
};

export default Sidebar;
