import { useState } from "react";
import ViewSettings from "./viewSetting";
import EditSettings from "./editSetting";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("view");

  const companyData = {
    name: "Syngrid Technologies",
    email: "info@syngrid.com",
    phone: "+91 9876543210",
    address: "Chennai, Tamil Nadu",
    smtpEmail: "smtp@syngrid.com",
    smtpPassword: "********",
    whatsapp: "+91 9999999999",
    openRouterKey: "sk-xxxxxxx",
    models: ["model-1", "model-2", "model-3"],
    loginLogo: "",
    loginImage: "",
    quotationLogo: "",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex gap-6"> {/* ✅ GAP ADDED */}

        {/* LEFT SIDE */}
        <div className="w-64 bg-white rounded-2xl shadow p-6 space-y-4">
          <button
            onClick={() => setActiveTab("view")}
            className={`w-full py-2 rounded-lg text-sm font-medium ${
              activeTab === "view"
                ? "bg-primary text-white"
                : "border"
            }`}
          >
            View Settings
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`w-full py-2 rounded-lg text-sm font-medium ${
              activeTab === "edit"
                ? "bg-primary text-white"
                : "border"
            }`}
          >
            Edit Settings
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 bg-white rounded-2xl shadow p-8">
          {activeTab === "view" ? (
            <ViewSettings data={companyData} />
          ) : (
            <EditSettings data={companyData} />
          )}
        </div>

      </div>
    </div>
  );
};

export default Setting;
