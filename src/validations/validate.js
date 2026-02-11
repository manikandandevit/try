// validations/location.schema.js
import { email, z } from "zod";

export const mapZodErrors = (zodError) => {
  const errors = {};

  zodError.issues.forEach((issue) => {
    const key = issue.path[0];
    if (key) {
      errors[key] = issue.message;
    }
  });

  return errors;
};

export const locationSchema = z.object({
  locationName: z
    .string()
    .trim()
    .min(1, "Location is required"),
});

export const sublocationSchema = z.object({
  locationId: z
    .string()
    .min(1, "Location is required"),

  sublocationName: z
    .string()
    .trim()
    .min(1, "Sublocation is required"),

  address: z
    .string()
    .trim()
    .min(1, "Address is required"),
});

export const departmentSchema = z.object({
  departmentName: z
    .string()
    .trim()
    .min(1, "Department is required"),
});


export const vendorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vendor name is required"),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  // email: z
  //   .string()
  //   .trim()
  //   .optional()
  //   .refine(
  //     (val) => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
  //     { message: "Invalid email address" }
  //   ),

  address: z.string().trim().optional(),
});


export const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Supplier name is required"),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  // email: z
  //   .string()
  //   .trim()
  //   .optional()
  //   .refine(
  //     (val) => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
  //     { message: "Invalid email address" }
  //   ),

  address: z.string().trim().optional(),
});


export const assetTypeSchema = z.object({
  assetTypeName: z
    .string()
    .trim()
    .min(1, "Asset Type is required"),
});

export const assetCategorySchema = z.object({
  assetTypeId: z
    .string()
    .min(1, "Asset Type is required"),

  assetCategoryName: z
    .string()
    .trim()
    .min(1, "Asset Category is required"),

});


export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "User name is required"),

  empId: z
    .string()
    .trim()
    .min(1, "Employee ID is required"),

  departmentId: z
    .string()
    .min(1, "Department is required"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
});
