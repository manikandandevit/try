import { SendHorizonal } from "lucide-react";

const SidePopupForm = ({
    open,
    title,

    /* INPUT FIELD */
    label,
    placeholder,
    value,
    required = false,
    onChange,
    error,

    /* INPUT FIELD 2 (OPTIONAL) */
    label2,
    placeholder2,
    value2,
    required2 = false,
    onChange2,
    error2,
    // /* INPUT FIELD 3 (OPTIONAL) */
    // label3,
    // placeholder3,
    // value3,
    // required3 = false,
    // onChange3,

    /* DROPDOWN FIELD (OPTIONAL) */
    dropdownLabel,
    dropdownRequired = false,
    dropdownValue,
    dropdownOptions = [],
    onDropdownChange,
    dropdownError,
    // /* DROPDOWN FIELD 2 (OPTIONAL) */
    // dropdownLabel2,
    // dropdownRequired2 = false,
    // dropdownValue2,
    // dropdownOptions2 = [],
    // onDropdownChange2,

    // /* DROPDOWN FIELD 3 (OPTIONAL) */
    // dropdownLabel3,
    // dropdownRequired3 = false,
    // dropdownValue3,
    // dropdownOptions3 = [],
    // onDropdownChange3,

    submitText = "Submit",
    cancelText = "Cancel",
    submitting = false,
    onSubmit,
    onClose,
}) => {
    if (!open) return null;

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
            />

            {/* DRAWER */}
            <div className="fixed top-0 right-0 h-screen w-full sm:w-105 bg-white z-50 flex flex-col animate-slideIn">
                {/* HEADER */}
                <div className="px-5 py-4 border-b border-borderColor flex items-center justify-between">
                    <h3 className="text-lg text-primary font-semibold">{title}</h3>
                </div>

                {/* BODY */}
                <div className="flex-1 p-5 space-y-6">

                    {/* DROPDOWN FIELD */}
                    {dropdownLabel && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                {dropdownLabel}
                                {dropdownRequired && (
                                    <span className="text-red-500 pl-1">*</span>
                                )}
                            </label>

                            <select
                                value={dropdownValue}
                                onChange={(e) => onDropdownChange(e.target.value)}
                                className="w-full border border-lineColor rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="" disabled hidden>
                                    Select
                                </option>
                                {dropdownOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {dropdownError && (
                                <p className="text-xs text-red-500">{dropdownError}</p>
                            )}
                        </div>
                    )}

                    {/* INPUT FIELD */}
                    {label && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                {label}
                                {required && (
                                    <span className="text-red-500 pl-1">*</span>
                                )}
                            </label>

                            <input
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={placeholder}
                                className="w-full border border-lineColor rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                    )}

                    {/* INPUT FIELD 2 */}
                    {label2 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                {label2}
                                {required2 && (
                                    <span className="text-red-500 pl-1">*</span>
                                )}
                            </label>

                            <input
                                value={value2}
                                onChange={(e) => onChange2(e.target.value)}
                                placeholder={placeholder2}
                                className="w-full border border-lineColor rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {error2 && <p className="text-xs text-red-500">{error2}</p>}
                        </div>
                    )}

                    {/* DROPDOWN FIELD */}
                    {/* {dropdownLabel2 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                {dropdownLabel2}
                                {dropdownRequired2 && (
                                    <span className="text-red-500 pl-1">*</span>
                                )}
                            </label>

                            <select
                                value={dropdownValue2}
                                onChange={(e) => onDropdownChange2(e.target.value)}
                                className="w-full border border-lineColor rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select</option>
                                {dropdownOptions2.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )} */}


                    {/* INPUT FIELD 3 */}
                    {/* {label3 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                {label3}
                                {required3 && (
                                    <span className="text-red-500 pl-1">*</span>
                                )}
                            </label>

                            <input
                                value={value3}
                                onChange={(e) => onChange3(e.target.value)}
                                placeholder={placeholder3}
                                className="w-full border border-lineColor rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    )} */}

                    {/* DROPDOWN FIELD */}
                    {/* {dropdownLabel3 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                {dropdownLabel3}
                                {dropdownRequired3 && (
                                    <span className="text-red-500 pl-1">*</span>
                                )}
                            </label>

                            <select
                                value={dropdownValue3}
                                onChange={(e) => onDropdownChange3(e.target.value)}
                                className="w-full border border-lineColor rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select</option>
                                {dropdownOptions3.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )} */}


                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={onSubmit}
                            disabled={submitting}
                            className={`flex items-center gap-2 px-4 py-2 text-sm text-white
        ${submitting ? "bg-primary/70 cursor-not-allowed" : "bg-primary"}
    `}
                        >
                            {submitting ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <SendHorizonal size={16} />
                                    {submitText}
                                </>
                            )}
                        </button>


                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-primary border border-primary text-sm"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SidePopupForm;
