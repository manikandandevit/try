import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { z } from "zod";

/* -------------------- ZOD SCHEMA -------------------- */
const customerSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    companyName: z.string().min(1, "Company name is required"),
    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    address: z.string().optional(),
    gst: z
        .string()
        .optional()
        .refine((val) => !val || val.length === 15, {
            message: "GST number must be 15 characters",
        }),
});

const CustomerForm = ({
    open,
    onClose,
    mode,
    editData,
    onSubmit,
    onSuccess,
}) => {
    const [form, setForm] = useState({
        id: null,
        customerName: "",
        companyName: "",
        phone: "",
        email: "",
        address: "",
        gst: "",
    });

    const [errors, setErrors] = useState({});

    /* ---------------- LOAD EDIT DATA ---------------- */
    useEffect(() => {
        if (mode === "edit" && editData) {
            setForm({
                id: editData.id,
                customerName: editData.name || "",
                companyName: editData.company || "",
                phone: editData.phone || "",
                email: editData.email || "",
                address: editData.address || "",
                gst: editData.gst || "",
            });
        } else {
            setForm({
                id: null,
                customerName: "",
                companyName: "",
                phone: "",
                email: "",
                address: "",
                gst: "",
            });
        }
    }, [mode, editData]);

    if (!open) return null;

    /* ---------------- HANDLE CHANGE ---------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    /* ---------------- HANDLE SUBMIT ---------------- */
    const handleSubmit = () => {
        const result = customerSchema.safeParse(form);

        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        onSubmit({
            id: form.id,
            customerName: form.customerName,
            companyName: form.companyName,
            name: form.customerName, // Keep for backward compatibility
            company: form.companyName, // Keep for backward compatibility
            phone: form.phone,
            email: form.email,
            address: form.address,
            gst: form.gst,
        });

        // Don't close here - let parent handle it after API success
        // onClose();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
            />

            <div className="fixed top-0 right-0 h-screen w-full sm:w-96 md:w-105 bg-white z-50 flex flex-col animate-slideIn shadow-2xl">

                {/* Header */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-primary">
                        {mode === "add" ? "Add Customer" : "Edit Customer"}
                    </h3>
                </div>

                {/* Body */}
                <div className="flex-1 p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">

                    {/* Customer Name */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium">
                            Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="customerName"
                            value={form.customerName}
                            placeholder="Enter Customer Name"
                            onChange={handleChange}
                            className="w-full mt-1 border border-lineColor rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-1 focus:ring-primary"
                        />
                        {errors.customerName && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.customerName}
                            </p>
                        )}
                    </div>

                    {/* Company */}
                    <div>
                        <label className="text-sm font-medium">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="companyName"
                            value={form.companyName}
                            placeholder="Enter Company Name"
                            onChange={handleChange}
                            className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary"
                        />
                        {errors.companyName && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.companyName}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-medium">
                            Phone No <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="phone"
                            value={form.phone}
                            placeholder="Enter a Number"
                            onChange={handleChange}
                            className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.phone}
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

                    {/* Address */}
                    <div>
                        <label className="text-sm font-medium">Address</label>
                        <textarea
                            name="address"
                            value={form.address}
                            placeholder="Description"
                            onChange={handleChange}
                            rows="3"
                            className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* GST */}
                    <div>
                        <label className="text-sm font-medium">GST Number</label>
                        <input
                            name="gst"
                            value={form.gst}
                            placeholder="Enter GST"
                            onChange={handleChange}
                            className="w-full mt-1 border border-lineColor rounded-md px-3 py-2 focus:ring-1 focus:ring-primary"
                        />
                        {errors.gst && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.gst}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-200 bg-white">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={handleSubmit}
                            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 text-xs sm:text-sm rounded-md hover:bg-primary/90 transition-colors"
                        >
                            {mode === "add" ? "Submit" : "Update"}
                            <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                        </button>

                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-primary text-primary text-xs sm:text-sm rounded-md hover:bg-primary/5 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerForm;
