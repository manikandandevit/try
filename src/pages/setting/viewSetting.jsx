import { CONFIG } from "../../API/config";

const ViewSettings = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500">No data available</div>;
  }

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

  // Field labels mapping
  const fieldLabels = {
    company_name: "Company Name",
    brand_name: "Brand Name",
    email: "Email",
    password: "Password",
    tagline: "Tagline",
    phone_number: "Phone Number",
    address: "Address",
    sendemail: "Send Email",
    sendpassword: "Send Email Password",
    sendnumber: "WhatsApp Number",
    openrouter_api_key: "OpenRouter API Key",
    openrouter_model: "OpenRouter Model 1",
    openrouter_model_2: "OpenRouter Model 2",
    openrouter_model_3: "OpenRouter Model 3",
    login_logo_url: "Login Logo",
    login_image_url: "Login Image",
    quotation_logo_url: "Quotation Logo",
    created_at: "Created At",
    updated_at: "Updated At",
  };

  // Group fields into sections
  const companyInfoFields = [
    "company_name",
    "brand_name",
    "tagline",
    "phone_number",
    "address",
  ];

  const emailFields = ["sendemail", "sendpassword"];

  const whatsappFields = ["sendnumber"];

  const openrouterFields = [
    "openrouter_api_key",
    "openrouter_model",
    "openrouter_model_2",
    "openrouter_model_3",
  ];

  const imageFields = [
    "login_logo_url",
    "login_image_url",
    "quotation_logo_url",
  ];

  const timestampFields = ["created_at", "updated_at"];

  const renderField = (key, value) => {
    if (key.includes("_url") && (key.includes("logo") || key.includes("image"))) {
      const fullUrl = constructMediaUrl(value);
      return (
        <div key={key} className="col-span-2">
          <p className="text-gray-500 mb-2">{fieldLabels[key] || key}</p>
          {fullUrl ? (
            <img
              src={fullUrl}
              alt={fieldLabels[key]}
              className="h-24 mt-2 rounded border border-gray-200 object-contain"
            />
          ) : (
            <p className="text-gray-400">No Image</p>
          )}
        </div>
      );
    }

    if (key === "password" || key === "sendpassword") {
      return (
        <div key={key}>
          <p className="text-gray-500 mb-1">{fieldLabels[key] || key}</p>
          <p className="font-medium">{"*".repeat(8)}</p>
        </div>
      );
    }

    if (key === "address") {
      return (
        <div key={key} className="col-span-2">
          <p className="text-gray-500 mb-1">{fieldLabels[key] || key}</p>
          <p className="font-medium">{value || "N/A"}</p>
        </div>
      );
    }

    return (
      <div key={key}>
        <p className="text-gray-500 mb-1">{fieldLabels[key] || key}</p>
        <p className="font-medium">{value || "N/A"}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Company Details</h2>

      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-2">
          Company Information
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {companyInfoFields.map((key) => renderField(key, data[key]))}
        </div>
      </div>

      {/* Send Email Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-2">
          Send Email Credentials
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {emailFields.map((key) => renderField(key, data[key]))}
        </div>
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-2">
          Send WhatsApp Number
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {whatsappFields.map((key) => renderField(key, data[key]))}
        </div>
      </div>

      {/* OpenRouter API Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-2">
          OpenRouter API Settings
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {openrouterFields.map((key) => renderField(key, data[key]))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-2">
          Images
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {imageFields.map((key) => renderField(key, data[key]))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-2">
          Timestamps
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {timestampFields.map((key) => {
            const value = data[key];
            const formattedDate = value
              ? new Date(value).toLocaleString()
              : "N/A";
            return (
              <div key={key}>
                <p className="text-gray-500 mb-1">{fieldLabels[key] || key}</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewSettings;
