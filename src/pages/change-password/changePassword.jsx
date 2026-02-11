import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordApi } from "../../API/authApi";
import toast from "../../common/toast";

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // clear field error on typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.oldPassword) {
      setErrors({ oldPassword: "Current password is required" });
      return;
    }

    if (!form.newPassword) {
      setErrors({ newPassword: "New password is required" });
      return;
    }

    if (!form.confirmPassword) {
      setErrors({ confirmPassword: "Confirm password is required" });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrors({
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await changePasswordApi(form);

      if (res?.success) {
        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password updated successfully")
      } else {
        if (Object.keys(res.error).length > 0) {
          setErrors(res.error);
        } else {
          setErrors({ general: res?.message || "Password update failed" });
        }
      }

    } catch (err) {
      const apiErrors = err?.response?.data?.errors;

      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({
          general: err?.response?.data?.message || "Password update failed",
        });
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-bgColor">



      {/* RIGHT SECTION (FORM CENTERED RESPONSIVELY) */}
      <div className="flex-1 flex justify-center items-center bg-sidebar p-4">
        <div className="w-full max-w-md bg-bgColor shadow-xl rounded-md px-8 py-8">

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-primary1">Change Password</h1>
            <p className="text-primary text-sm">Update your password to continue</p>
          </div>

          {/* Status Messages */}
          {errors.general && (
            <p className="text-red-500 text-sm text-center mb-2">
              {errors.general}
            </p>
          )}
          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* CURRENT PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={show.current ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Enter current password"
                  value={form.oldPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-borderColor rounded-lg outline-none placeholder:text-primary"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShow((prev) => ({ ...prev, current: !prev.current }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {show.current ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              {errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.oldPassword}
                </p>
              )}
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={show.newPass ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-borderColor rounded-lg outline-none placeholder:text-primary"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShow((prev) => ({ ...prev, newPass: !prev.newPass }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {show.newPass ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={show.confirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-borderColor rounded-lg outline-none placeholder:text-primary"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShow((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {show.confirm ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white text-xl py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
