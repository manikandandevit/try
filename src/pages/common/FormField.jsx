import React, { useState, forwardRef, useEffect } from "react";
import Select from "react-select";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import { Calendar, Image } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { Images } from "../../common/assets";

/* ---------- CUSTOM DATE INPUT ---------- */
const CustomDateInput = forwardRef(
  ({ value, onClick, placeholder, className }, ref) => (
    <div className="relative w-full" onClick={onClick}>
      <input
        ref={ref}
        value={value || ""}
        readOnly
        placeholder={placeholder}
        className={`${className} pr-10 cursor-pointer`}
      />
      <Calendar
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  )
);

const FormField = ({
  label,
  name,
  type = "text",
  register,
  control,
  options = [],
  required = false,
  error,
  placeholder,
  disabled = false,
  readOnly = false,
  className = "",
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  /* ✅ MATCH AddAssets INPUT DESIGN */
  const baseInputClass = `
    w-full h-[38px] border border-gray-300 rounded-md px-3
    text-sm placeholder:text-gray-400
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
    ${className}
  `;

  const Label = label && (
    <label className="text-xs font-medium text-gray-700 mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );

  /* ---------- SELECT ---------- */
  if (type === "select") {
    return (
      <div>
        {Label}
        <select
          {...register(name)}
          disabled={disabled}
          className={`${baseInputClass} text-gray-400`}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  /* ---------- MULTI SELECT ---------- */
  if (type === "multi-select") {
    return (
      <div>
        {Label}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              isDisabled={disabled}
              options={options}
              placeholder={placeholder || `Select ${label}`}
              classNamePrefix="react-select"
            />
          )}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  /* ---------- IMAGE UPLOAD ---------- */
  if (type === "image") {
    return (
      <div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const [preview, setPreview] = useState(null);

            useEffect(() => {
              if (field.value instanceof File) {
                const url = URL.createObjectURL(field.value);
                setPreview(url);
                return () => URL.revokeObjectURL(url);
              }
              setPreview(field.value || null);
            }, [field.value]);

            return (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    field.onChange(e.target.files?.[0] || null)
                  }
                />

                <div className="flex items-center gap-4">
                  {/* UPLOAD BOX */}
                  <div className="w-16 h-16 border border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={Images.uploadIcon}
                        className="w-10 h-10"
                        alt="Upload"
                      />
                    )}
                  </div>

                  {/* TEXT */}
                  <div>
                    <p className="text-md font-bold text-black">
                      Upload a Photo
                    </p>
                    <p className="text-sm text-black">
                      Drag and drop files here
                    </p>
                  </div>
                </div>
              </label>
            );
          }}
        />

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  /* ---------- DATE ---------- */
  if (type === "date" || type === "datetime") {
    return (
      <div>
        {Label}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              showTimeSelect={type === "datetime"}
              dateFormat={
                type === "datetime"
                  ? "dd/MM/yyyy h:mm aa"
                  : "dd/MM/yyyy"
              }
              placeholderText={placeholder}
              disabled={disabled}
              customInput={
                <CustomDateInput
                  placeholder={placeholder}
                  className={baseInputClass}
                />
              }
            />
          )}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  /* ---------- TEXTAREA ---------- */
  if (type === "textarea") {
    return (
      <div>
        {Label}
        <textarea
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={3}
          className={`${baseInputClass} h-auto py-2 resize-none`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  /* ---------- DEFAULT INPUT ---------- */
  return (
    <div>
      {Label}
      <div className="relative">
        <input
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          {...register(name)}
          className={baseInputClass + (type === "password" ? " pr-10" : "")}
          {...rest}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
