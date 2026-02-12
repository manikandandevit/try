import { Images } from "../../common/assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { VerifyTokenApi, resetPasswordApi, getCompanyLoginApi } from "../../API/authApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "../../common/toast";
import { Eye, EyeOff } from "lucide-react";

// ================= ZOD SCHEMA =================
const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    verifyToken();
  }, [token]);

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
        document.title = "SynQuot";
      }
    };

    fetchBrandName();
  }, []);

  const verifyToken = async () => {
    try {
      const res = await VerifyTokenApi(token);
      if (!res?.success) navigate("/");
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const res = await resetPasswordApi(
      token,
      data.newPassword,
      data.confirmPassword
    );

    if (res?.success) {
      toast.success("Password reset successfully");
      navigate("/");
    } else {
      toast.error(res?.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-primary text-lg font-medium">Verifying link...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col lg:grid lg:grid-cols-2">

      {/* ================= ILLUSTRATION SECTION ================= */}
      <div
        className="
          flex flex-col items-center justify-center
          bg-bgColor px-6 py-10
          order-1 lg:order-2
          mb-8 sm:mb-10 lg:mb-0
        "
      >
        <img
          src={Images.full_logo}
          alt="School Logo"
          className="w-36 sm:w-44 md:w-52 xl:w-72 h-auto mb-4"
        />

        <h2
          className="
            text-primary font-bold text-center
            text-xl sm:text-2xl md:text-3xl xl:text-4xl
            mb-6
          "
        >
          School ERP System
        </h2>

        <img
          src={Images.login}
          alt="ERP Illustration"
          className="
            w-full max-w-xs sm:max-w-md lg:max-w-xl
            h-auto object-contain
          "
        />
      </div>

      {/* ================= FORM SECTION ================= */}
      <div
        className="
          flex items-center justify-center
          bg-bgColor1 px-4 sm:px-6
          order-2 lg:order-1
          mt-2 sm:mt-0
        "
      >
        <div
          className="
            bg-white shadow-xl rounded-2xl
            w-full max-w-sm sm:max-w-md
            px-6 sm:px-8 lg:px-10 py-8
          "
        >
          <h1
            className="
              text-textPrimary text-xl sm:text-2xl lg:text-3xl font-bold mb-2
            "
          >
            Reset Password
          </h1>

          <p className="text-darkGrey text-xs sm:text-sm mb-6">
            Enter your new password and confirm it below
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* New Password */}
            <div>
              <label className="text-sm text-textPrimary mb-1 block">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Your new password"
                  className="
                    w-full h-11 sm:h-12 px-4 bg-bgColor1 rounded-xl 
                    border border-borderColor outline-none
                  "
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNew ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-textPrimary mb-1 block">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="
                    w-full h-11 sm:h-12 px-4 bg-bgColor1 rounded-xl 
                    border border-borderColor outline-none
                  "
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirm ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="submit"
                className="w-full h-11 text-textWhite rounded-xl shadow-md"
                style={{ background: "var(--gradient-primary)" }}
              >
                Submit
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full h-11 rounded-xl border text-primary"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
};

export default ResetPassword;
