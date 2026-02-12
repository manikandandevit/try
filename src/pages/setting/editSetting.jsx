import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { updateCompanyDetails } from "../../API/companyApi";
import { CONFIG } from "../../API/config";

const EditSettings = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [imageFiles, setImageFiles] = useState({
    login_logo: null,
    login_image: null,
    quotation_logo: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const validate = () => {
    let newErrors = {};
    // Email validation removed - Login Credentials not shown in settings
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setImageFiles({ ...imageFiles, [name]: file });
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        [`${name}_url`]: previewUrl,
      });
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Add all text fields (skip email and password - Login Credentials not editable)
      Object.keys(formData).forEach((key) => {
        // Skip image URL fields (we'll use actual files)
        // Skip email and password - Login Credentials are not editable in settings
        if (!key.endsWith("_url") && key !== "email" && key !== "password") {
          const value = formData[key];
          if (value !== null && value !== undefined && value !== "") {
            submitData.append(key, value);
          }
        }
      });

      // Add image files if they exist
      Object.keys(imageFiles).forEach((key) => {
        if (imageFiles[key]) {
          submitData.append(key, imageFiles[key]);
        }
      });

      const response = await updateCompanyDetails(submitData);

      if (response.success) {
        setSuccessMessage("Company details updated successfully!");
        setErrorMessage("");
        // Clear image files after successful upload
        setImageFiles({
          login_logo: null,
          login_image: null,
          quotation_logo: null,
        });
        // Refresh data from parent
        if (onUpdate) {
          setTimeout(() => {
            onUpdate();
            setSuccessMessage("");
          }, 2000);
        }
      } else {
        setErrorMessage(response.message || "Failed to update company details");
        setSuccessMessage("");
      }
    } catch (err) {
      setErrorMessage("Error updating company details. Please try again.");
      setSuccessMessage("");
      console.error("Error updating company:", err);
    } finally {
      setLoading(false);
    }
  };

  const companyInfoFields = [
    { label: "Company Name", name: "company_name" },
    { label: "Brand Name", name: "brand_name" },
    { label: "Tagline", name: "tagline" },
    { label: "Phone Number", name: "phone_number" },
    { label: "Address", name: "address", col: true },
  ];

  const emailFields = [
    { label: "Send Email", name: "sendemail" },
    { label: "Send Email Password", name: "sendpassword", type: "password" },
  ];

  const whatsappFields = [{ label: "WhatsApp Number", name: "sendnumber" }];

  const openrouterFields = [
    { label: "OpenRouter API Key", name: "openrouter_api_key", col: true },
    { label: "OpenRouter Model 1", name: "openrouter_model" },
    { label: "OpenRouter Model 2", name: "openrouter_model_2" },
    { label: "OpenRouter Model 3", name: "openrouter_model_3" },
  ];

  const imageFields = [
    { label: "Login Logo", name: "login_logo", urlKey: "login_logo_url" },
    { label: "Login Image", name: "login_image", urlKey: "login_image_url" },
    {
      label: "Quotation Logo",
      name: "quotation_logo",
      urlKey: "quotation_logo_url",
    },
  ];

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-semibold">Company Settings</h2>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      {/* Company Information */}
      <div className="space-y-6 pb-6">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-3">
          Company Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {companyInfoFields.map((field, index) => (
            <div key={index} className={field.col ? "col-span-2" : ""}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-borderColor rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Send Email Credentials */}
      <div className="space-y-6 pb-6">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-3">
          Send Email Credentials
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {emailFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-borderColor rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-6 pb-6">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-3">
          Send WhatsApp Number
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {whatsappFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-borderColor rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OpenRouter API Settings */}
      <div className="space-y-6 pb-6">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-3">
          OpenRouter API Settings
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {openrouterFields.map((field, index) => (
            <div key={index} className={field.col ? "col-span-2" : ""}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-borderColor rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-6 pb-6">
        <h3 className="text-lg font-semibold border-b border-borderColor pb-3">
          Company Images
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {imageFields.map((img, index) => {
            let previewUrl = null;
            if (imageFiles[img.name]) {
              previewUrl = URL.createObjectURL(imageFiles[img.name]);
            } else if (formData[img.urlKey]) {
              previewUrl = constructMediaUrl(formData[img.urlKey]);
            }
            return (
              <div key={index}>
                <label className="block text-sm font-medium mb-2">
                  {img.label}
                </label>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={img.label}
                    className="h-24 mb-2 rounded border border-gray-200 object-contain"
                  />
                )}
                <input
                  type="file"
                  name={img.name}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-borderColor rounded-lg p-2 text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default EditSettings;
