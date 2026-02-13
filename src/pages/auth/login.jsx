import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Images } from "../../common/assets";
import { loginApi, getCompanyLoginApi } from "../../API/authApi";
import { CONFIG } from "../../API/config";
import toast from "../../common/toast";

// ================= ZOD SCHEMA =================
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginImage, setLoginImage] = useState(Images.loginLeft);
  const [loginLogo, setLoginLogo] = useState(Images.fullLogo);
  const [brandName, setBrandName] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

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

  // Fetch company login images on component mount
  useEffect(() => {
    const fetchCompanyImages = async () => {
      try {
        const res = await getCompanyLoginApi();
        console.log("Login component - Full API response:", res);
        console.log("CONFIG.BASE_URL:", CONFIG.BASE_URL);
        
        // Handle response - check both res.data and direct res properties
        const responseData = res?.data || res || {};
        console.log("Response data extracted:", responseData);
        
        // Use backend images if available, otherwise fallback to default
        const loginImageUrl = responseData.login_image_url;
        const loginLogoUrl = responseData.login_logo_url;
        const brandNameValue = responseData.brand_name;
        
        // Set brand name if available
        if (brandNameValue && brandNameValue.trim()) {
          setBrandName(brandNameValue.trim());
        } else {
          setBrandName("");
        }
        
        // Update document title
        const titleText = brandNameValue && brandNameValue.trim() 
          ? brandNameValue.trim() 
          : "SynQuot";
        document.title = titleText;
        
        console.log("Raw login_image_url:", loginImageUrl, "Type:", typeof loginImageUrl);
        console.log("Raw login_logo_url:", loginLogoUrl, "Type:", typeof loginLogoUrl);
        console.log("Brand name:", brandNameValue);
        
        // Process login image
        const fullImageUrl = constructMediaUrl(loginImageUrl);
        if (fullImageUrl) {
          console.log("✅ Setting login image URL:", fullImageUrl);
          setLoginImage(fullImageUrl);
        } else {
          console.log("❌ No valid login_image_url found, keeping default image");
        }
        
        // Process login logo
        const fullLogoUrl = constructMediaUrl(loginLogoUrl);
        if (fullLogoUrl) {
          console.log("✅ Setting login logo URL:", fullLogoUrl);
          setLoginLogo(fullLogoUrl);
        } else {
          console.log("❌ No valid login_logo_url found, keeping default logo");
        }
      } catch (err) {
        console.error("❌ Error fetching company login images:", err);
        // Keep default images on error
      }
    };

    fetchCompanyImages();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginApi(data);
      console.log("Login response:", res);
      setLoading(false);

      if (res.success) {
        toast.success("Login successful");
        navigate("/dashboard");
      } else {
        const errorMessage = res.message || res.error || "Login failed. Please check your email and password.";
        toast.error(errorMessage);
        console.error("Login failed:", res);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err?.response?.data?.error || err?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ================= LEFT SIDE ================= */}
      <div className="w-full md:w-1/2 bg-primary text-white flex flex-col items-center justify-center p-6 sm:p-8 md:p-10">
        <img
          src={loginImage}
          alt="Illustration"
          className="w-48 sm:w-64 md:w-75 h-auto max-h-60 sm:max-h-80 md:max-h-96 object-contain mb-6 sm:mb-8 md:mb-10"
          onError={(e) => {
            // Fallback to default image if backend image fails to load
            e.target.src = Images.loginLeft;
          }}
        />
        <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4 text-center px-4">
          {brandName ? (
            brandName
          ) : (
            <>Syn<span className="text-3xl sm:text-4xl md:text-5xl">Q</span>uot</>
          )}
        </h2>
        <p className="text-center text-sm sm:text-md font-medium px-4">
          Smart Quotes, Made Simple.
        </p>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-bgColor p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <img 
              src={loginLogo} 
              alt="Logo" 
              className="w-86.5 h-25"
              onError={(e) => {
                // Fallback to default logo if backend logo fails to load
                e.target.src = Images.fullLogo;
              }}
            />
          </div>

          <h2 className="text-center text-textPrimary text-2xl font-semibold mb-6">Welcome !</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email or Username */}
            <div>
              <label className="text-sm text-textPrimary font-medium">Email or Username</label>
              <input
                type="text"
                placeholder="Enter your email or username"
                className="w-full mt-1 h-11 px-4 rounded-md border border-borderColor outline-none"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative mt-1">
              <label className="text-sm text-textPrimary font-medium">Password</label>
              <input
                type={show ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full h-11 px-4 rounded-md border border-borderColor outline-none"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-11 -translate-y-1/2 text-gray-400"
              >
                {show ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-md mt-4 bg-primary text-white font-medium transition ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
