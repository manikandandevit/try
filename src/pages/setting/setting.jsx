import { useState, useEffect } from "react";
import ViewSettings from "./viewSetting";
import EditSettings from "./editSetting";
import { getCompanyDetails } from "../../API/companyApi";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await getCompanyDetails();
      if (response.success && response.data?.company) {
        const company = response.data.company;
        // Map backend fields to frontend format
        setCompanyData({
          company_name: company.company_name || "",
          brand_name: company.brand_name || "",
          email: company.email || "",
          password: company.password || "",
          tagline: company.tagline || "",
          phone_number: company.phone_number || "",
          address: company.address || "",
          sendemail: company.sendemail || "",
          sendpassword: company.sendpassword || "",
          sendnumber: company.sendnumber || "",
          openrouter_api_key: company.openrouter_api_key || "",
          openrouter_model: company.openrouter_model || "",
          openrouter_model_2: company.openrouter_model_2 || "",
          openrouter_model_3: company.openrouter_model_3 || "",
          login_logo_url: company.login_logo_url || "",
          login_image_url: company.login_image_url || "",
          quotation_logo_url: company.quotation_logo_url || "",
          created_at: company.created_at || "",
          updated_at: company.updated_at || "",
        });
        setError(null);
      } else {
        setError(response.message || "Failed to fetch company details");
      }
    } catch (err) {
      setError("Error loading company details");
      console.error("Error fetching company data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex gap-4">

        {/* LEFT SIDE */}
        <div className="w-64 bg-white rounded-2xl shadow p-6">

          {/* Common Title */}
          <h2 className="text-xl font-semibold mb-6 border-b border-borderColor pb-3">
            Settings
          </h2>

          {/* Menu List */}
          <div className="space-y-2">

            <button
              onClick={() => setActiveTab("view")}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "view"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              View Settings
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "edit"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              Edit Settings
            </button>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 bg-white rounded-2xl shadow p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading company details...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">{error}</p>
            </div>
          ) : companyData ? (
            activeTab === "view" ? (
              <ViewSettings data={companyData} />
            ) : (
              <EditSettings data={companyData} onUpdate={fetchCompanyData} />
            )
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No company data available</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Setting;
