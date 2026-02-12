import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  SIDEBAR_WIDTH,
  SIDEBAR_MINI_WIDTH,
  TOPBAR_HEIGHT,
} from "../common/constants";
import { getCompanyLoginApi } from "../API/authApi";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMini, setSidebarMini] = useState(false);

  const sidebarWidth = sidebarMini ? SIDEBAR_MINI_WIDTH : SIDEBAR_WIDTH;

  // Set document title based on brand name
  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const res = await getCompanyLoginApi();
        const responseData = res?.data || res || {};
        const brandNameValue = responseData.brand_name;
        
        // Update document title
        const titleText = brandNameValue && brandNameValue.trim() 
          ? brandNameValue.trim() 
          : "SynQuot";
        document.title = titleText;
      } catch (err) {
        console.error("Error fetching brand name for title:", err);
        // Set default title on error
        document.title = "SynQuot";
      }
    };

    fetchBrandName();
  }, []);

  return (
    <div className="flex min-h-screen bg-bgColor">
      <div className="md:fixed md:top-0 md:left-0 md:h-screen md:z-50">
        <Sidebar
          isOpen={sidebarOpen}
          isMini={sidebarMini}
          onClose={() => setSidebarOpen(false)}
          onMini={() => setSidebarMini(true)}
          onExpand={() => setSidebarMini(false)}
        />
      </div>

      <div
        className="flex-1 flex flex-col transition-all duration-300 w-full md:w-auto"
        style={{
          marginLeft: window.innerWidth >= 768 ? sidebarWidth : '0',
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          isSidebarMini={sidebarMini}
        />

        <div
          className="flex-1 bg-primary"
          style={{ marginTop: TOPBAR_HEIGHT }}
        >
          <div className="bg-bgColor1 h-full flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto hide-scrollbar p-4">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
