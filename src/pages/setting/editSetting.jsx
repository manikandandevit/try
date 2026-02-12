import React, { useState } from "react";
import { Save } from "lucide-react";

const EditSettings = ({ data }) => {
  const [formData, setFormData] = useState(data || {});
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Company name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData({
        ...formData,
        [name]: URL.createObjectURL(file),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log(formData);
  };

  const fields = [
    { label: "Company Name", name: "name" },
    { label: "Company Email", name: "email" },
    { label: "Company Phone", name: "phone" },
    { label: "Whatsapp Number", name: "whatsapp" },
    { label: "Company Address", name: "address", col: true },
    { label: "SMTP Email", name: "smtpEmail" },
    { label: "SMTP Password", name: "smtpPassword" },
    { label: "Open Router API Key", name: "openRouterKey", col: true },
    { label: "Open Router Model 1", name: "model1" },
    { label: "Open Router Model 2", name: "model2" },
    { label: "Open Router Model 3", name: "model3" },
  ];

  const images = [
    { label: "Login Logo", name: "loginLogo" },
    { label: "Login Image", name: "loginImage" },
    { label: "Quotation Logo", name: "quotationLogo" },
  ];

  return (
    <div className="space-y-10">

      <h2 className="text-2xl font-semibold">Company Settings</h2>

      {/* ===== COMPANY INFO ===== */}
      <div className="space-y-6 pb-6">

        <h3 className="text-lg font-semibold  border-b border-borderColor pb-3">Company Information</h3>

        <div className="grid grid-cols-2 gap-6">

          {fields.map((field, index) => (
            <div key={index} className={field.col ? "col-span-2" : ""}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>

              <input
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-borderColor rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ===== IMAGES ===== */}
      <div className="space-y-6 pb-6 ">

        <h3 className="text-lg font-semibold border-b border-borderColor pb-3">Company Images</h3>

        <div className="grid grid-cols-3 gap-6">

          {images.map((img, index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-2">
                {img.label}
              </label>

              {formData[img.name] && (
                <img
                  src={formData[img.name]}
                  alt=""
                  className="h-16 mb-2 rounded"
                />
              )}

              <input
                type="file"
                name={img.name}
                onChange={handleChange}
                className="w-full border border-borderColor rounded-lg p-2"
              />
            </div>
          ))}

        </div>
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>

    </div>
  );
};

export default EditSettings;
