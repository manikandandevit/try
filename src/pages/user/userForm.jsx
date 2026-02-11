import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

/* -------------------- ZOD SCHEMA -------------------- */
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const UserForm = ({ open, onClose, mode, editData, onSubmit }) => {

  /* ---------------- STATES ---------------- */
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isEditPassword, setIsEditPassword] = useState(false);

  /* ---------------- LOAD EDIT DATA ---------------- */
  useEffect(() => {

    if (mode === "edit" && editData) {

      setForm({
        id: editData.id,
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        password: "********",
      });

      setIsEditPassword(false);

    } else {

      setForm({
        id: null,
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setIsEditPassword(false);
    }

  }, [mode, editData]);

  if (!open) return null;

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = () => {

    let submitData = { ...form };

    // If edit mode & password not changed → remove
    if (mode === "edit" && !isEditPassword) {
      delete submitData.password;
    }

    // Validate
    const result = userSchema.safeParse(
      mode === "edit" && !isEditPassword
        ? { ...submitData, password: "123456" } // dummy password
        : submitData
    );

    if (!result.success) {

      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }

    onSubmit(submitData);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-screen w-full sm:w-105 bg-white z-50 flex flex-col animate-slideIn">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">
            {mode === "add" ? "Add User" : "Edit User"}
          </h3>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-5 overflow-y-auto">

          {/* Name */}
          <div>
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>

            <input
              name="name"
              value={form.name}
              placeholder="Enter Name"
              onChange={handleChange}
              className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary"
            />

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="Enter Email"
              onChange={handleChange}
              className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </label>

            <input
              name="phone"
              value={form.phone}
              placeholder="Enter Phone Number"
              onChange={handleChange}
              className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary"
            />

            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-1">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                placeholder="Enter Password"
                onChange={(e) => {

                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));

                  if (mode === "edit") {
                    setIsEditPassword(true);
                  }

                  setErrors((prev) => ({
                    ...prev,
                    password: "",
                  }));
                }}
                className="w-full border border-lineColor rounded-md px-3 py-2 pr-10 focus:ring-1 focus:ring-primary"
              />

              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-white">

          <div className="flex gap-3">

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm"
            >
              {mode === "add" ? "Submit" : "Update"}
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-primary text-primary text-sm"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default UserForm;
