import { Images } from "../../common/assets";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ForgotApi, getCompanyLoginApi } from "../../API/authApi";
import toast from "../../common/toast";
import { useEffect } from "react";

// ================= ZOD SCHEMA =================
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

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

  const onSubmit = async (data) => {
    try {
      const { success, message } = await ForgotApi(data);

      if (success) {
        toast.success("Email sent successfully");
        reset();
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

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
              text-primary font-bold
              text-xl sm:text-2xl lg:text-3xl
              mb-2
            "
          >
            Forgot Password
          </h1>

          <p className="text-darkGrey text-xs sm:text-sm mb-6">
            Enter your registered email address below, and we’ll send you an OTP
            to reset your password.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* ================= EMAIL ================= */}
            <div>
              <label className="text-sm mb-1 text-primary block">
                E-mail ID
              </label>
              <input
                type="email"
                placeholder="Your email address"
                className="
                  w-full h-11 sm:h-12 px-4
                  bg-white rounded-xl
                  border border-borderColor outline-none
                "
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ================= BUTTONS ================= */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="submit"
                className="
                  w-full h-11 text-white
                  rounded-xl shadow-md
                "
                style={{
                  background:
                    "linear-gradient(90deg, #1A4974 0%, #2B70B5 100%)",
                }}
              >
                Send Link
              </button>

              <button
                type="button"
                className="
                  w-full h-11 rounded-xl
                  border border-primary
                  text-primary
                "
                onClick={() => navigate("/")}
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

export default ForgotPassword;
