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
      item.children?.some((c) => c.path === location.pathname);

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
          px-4 py-3 text-base font-medium
          ${isSub ? "pl-10 " : ""}
          ${isActive
              ? "bg-white text-primary border-r-3 border-primary" // Active menu
              : "text-white/80 hover:bg-white/10"
            }
        `}
        >
          <div className="flex items-center gap-3">
            {isSub ? (
              <Dot size={20} className={isActive ? "text-primary" : "text-white"} />
            ) : (
              <img
                src={isActive && item.activeIcon ? item.activeIcon : item.icon} // <-- Active icon
                className="w-5 h-5"
              />
            )}
            {!isMini && <span>{item.name}</span>}
          </div>

          {!isMini && hasChildren && (
            <ChevronRight
              size={16}
              className={`transition-transform ${openIndex === index ? "rotate-90" : ""}`}
            />
          )}
        </button>

        {!isMini && hasChildren && openIndex === index && (
          <div className="mt-1 space-y-1">
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
          fixed left-0 top-0 h-screen bg-primary z-50 transition-all duration-300 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ width }}
      >
        {/* LOGO */}
        <div className="h-20 flex items-center justify-center relative">
          <img
            src={isMini ? quotationLogo : loginLogo}
            alt="Logo"
            className={`transition-all ${isMini ? "w-10" : "w-45"}`}
            onError={(e) => {
              // Fallback to default logo if backend logo fails to load
              e.target.src = isMini ? Images.smLogo : Images.fullLogo;
            }}
          />

          {!isMini && (
            <button
              onClick={onMini}
              className="absolute right-3 text-white/60 hidden md:block"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <button
            onClick={onClose}
            className="absolute right-3 text-white/60 md:hidden text-xl font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isMini && (
          <button
            onClick={onExpand}
            className="mx-auto mt-3 block text-white md:block"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* SCROLLABLE MENUS */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* MAIN MENUS */}
          <nav className="mt-8 space-y-1">
            {ProtectedRoutes.filter((r) => r.showInSidebar && !r.group)
              .map((item, index) => renderMenu(item, index))}
          </nav>

          {/* GROUPS */}
          {ProtectedRoutes.filter((r) => r.group).map((group) => (
            <div key={group.group} className="mt-6 px-4">
              {!isMini && (
                <p className="text-xs text-white/60 uppercase mb-2 tracking-wide">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.menus.map((item, index) =>
                  renderMenu(item, `g-${index}`)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM MENUS */}
        <div className="py-3">
          {bottomMenus.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`
          w-full flex items-center gap-3 px-4 py-2 text-base font-medium
          ${isActive
                    ? "bg-white text-primary border-r-3 border-primary"
                    : "text-white hover:bg-white/10"
                  }
        `}
              >
                <img
                  src={isActive ? item.activeIcon : item.icon}
                  className="w-5 h-5"
                />
                {!isMini && item.name}
              </button>
            );
          })}

          {/* LOGOUT */}
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-white hover:bg-red-500/20"
          >
            <img src={Images.logoutIcon} className="w-5 h-5" />
            {!isMini && "Logout"}
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
