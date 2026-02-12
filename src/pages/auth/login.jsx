import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Images } from "../../common/assets";
import { loginApi } from "../../API/authApi";
import toast from "../../common/toast";

// ================= ZOD SCHEMA =================
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // const res = await loginApi(data);
      // setLoading(false);

      // if (res.success) {
      localStorage.setItem("accessToken", "9090808")
        toast.success("Login successful");
        navigate("/dashboard");
      // } else {
      //   toast.error(res.message || "Login failed");
      // }
    } catch (err) {
      setLoading(false);
      toast.error("Login failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ================= LEFT SIDE ================= */}
      <div className="w-1/2 bg-primary text-white flex flex-col items-center justify-center p-10">
        <img
          src={Images.loginLeft}
          alt="Illustration"
          className="w-75 h-70 object-contain mb-10"
        />
        <h2 className="text-3xl font-semibold mb-4">Syn<span className="text-5xl">Q</span>uot</h2>
        <p className="text-center text-md font-medium">
          Smart Quotes, Made Simple.
        </p>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="w-1/2 flex items-center justify-center bg-bgColor p-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <img src={Images.fullLogo} alt="Logo" className="w-86.5 h-25" />
          </div>

          <h2 className="text-center text-textPrimary text-2xl font-semibold mb-6">Welcome !</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-textPrimary font-medium">Email</label>
              <input
                type="text"
                placeholder="Enter your email"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
