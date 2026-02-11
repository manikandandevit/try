import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const imageSchema = z
  .any()
  .optional()
  .refine((file) => {
    if (!file) return true;
    if (typeof file === "string") return true;
    return file instanceof File;
  }, { message: "Invalid file" })
  .refine((file) => {
    if (!file || typeof file === "string") return true;
    return file.size <= MAX_FILE_SIZE;
  }, { message: "Image size must be less than 2MB" })
  .refine((file) => {
    if (!file || typeof file === "string") return true;
    return ACCEPTED_IMAGE_TYPES.includes(file.type);
  }, { message: "Only JPG, JPEG and PNG images are allowed" });


export const personalInformationSchema = z.object({
  profileImage: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        if (typeof file === "string") return true;
        return file instanceof File;
      },
      { message: "Invalid file" }
    )
    .refine(
      (file) => {
        if (!file || typeof file === "string") return true;
        return file.size <= MAX_FILE_SIZE;
      },
      { message: "Image size must be less than 2MB" }
    )
    .refine(
      (file) => {
        if (!file || typeof file === "string") return true;
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      },
      { message: "Only JPG, JPEG and PNG images are allowed" }
    ),

  academicYear: z.string().min(1, "Academic year is required"),

  admissionNumber: z.string().min(1, "Admission number is required"),

  admissionDate: z.coerce.date({
    required_error: "Admission date is required",
    invalid_type_error: "Invalid date",
  }),

  rollNumber: z.string().min(1, "Roll number is required"),

  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),

  gender: z.string().min(1, "Gender is required"),

  dateOfBirth: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date",
  }),

  primaryContact: z
    .string()
    .min(1, "Primary contact number is required")
    .regex(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  bloodGroup: z.string().min(1, "Blood group is required"),

  classId: z.string().min(1, "Class is required"),

  sectionId: z.string().min(1, "Section is required"),

  languageKnown: z.string().min(1, "Language known is required"),

  motherTongue: z.string().min(1, "Mother tongue is required"),

  nationality: z.string().min(1, "Nationality is required"),

  religion: z.string().min(1, "Religion is required"),

  identificationMarks: z
    .string()
    .min(1, "Identification marks is required"),

  previousSchoolName: z.string().optional(),

  previousSchoolAddress: z.string().optional(),
});

export const parentGuardianSchema = z
  .object({
    guardianType: z.enum(["parent", "guardian", "others"]),

    /* ---------- FATHER ---------- */
    fatherName: z.string().optional(),
    fatherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    fatherPhone: z.string().optional(),
    fatherOccupation: z.string().optional(),
    fatherImage: imageSchema,

    /* ---------- MOTHER ---------- */
    motherName: z.string().optional(),
    motherEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    motherPhone: z.string().optional(),
    motherOccupation: z.string().optional(),
    motherImage: imageSchema,

    /* ---------- GUARDIAN ---------- */
    guardianName: z.string().optional(),
    guardianEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    guardianPhone: z.string().optional(),
    guardianOccupation: z.string().optional(),
    guardianRelation: z.string().optional(),
    guardianAddress: z.string().optional(),
    guardianImage: imageSchema,
  })
  .superRefine((data, ctx) => {
    /* ================= PARENT VALIDATION ================= */
    if (data.guardianType === "parent") {
      if (!data.fatherName) {
        ctx.addIssue({
          path: ["fatherName"],
          message: "Father's name is required",
        });
      }

      if (!data.fatherPhone) {
        ctx.addIssue({
          path: ["fatherPhone"],
          message: "Father's phone number is required",
        });
      } else if (!/^[6-9]\d{9}$/.test(data.fatherPhone)) {
        ctx.addIssue({
          path: ["fatherPhone"],
          message: "Enter valid 10 digit mobile number",
        });
      }

      if (!data.fatherOccupation) {
        ctx.addIssue({
          path: ["fatherOccupation"],
          message: "Father's occupation is required",
        });
      }

      if (!data.motherName) {
        ctx.addIssue({
          path: ["motherName"],
          message: "Mother's name is required",
        });
      }

      if (!data.motherPhone) {
        ctx.addIssue({
          path: ["motherPhone"],
          message: "Mother's phone number is required",
        });
      } else if (!/^[6-9]\d{9}$/.test(data.motherPhone)) {
        ctx.addIssue({
          path: ["motherPhone"],
          message: "Enter valid 10 digit mobile number",
        });
      }

      if (!data.motherOccupation) {
        ctx.addIssue({
          path: ["motherOccupation"],
          message: "Mother's occupation is required",
        });
      }
    }

    /* ================= GUARDIAN / OTHERS VALIDATION ================= */
    if (data.guardianType !== "parent") {
      if (!data.guardianName) {
        ctx.addIssue({
          path: ["guardianName"],
          message: "Guardian name is required",
        });
      }

      if (!data.guardianEmail) {
        ctx.addIssue({
          path: ["guardianEmail"],
          message: "Guardian email is required",
        });
      }

      if (!data.guardianPhone) {
        ctx.addIssue({
          path: ["guardianPhone"],
          message: "Guardian phone number is required",
        });
      } else if (!/^[6-9]\d{9}$/.test(data.guardianPhone)) {
        ctx.addIssue({
          path: ["guardianPhone"],
          message: "Enter valid 10 digit mobile number",
        });
      }
      if (!data.guardianOccupation) {
        ctx.addIssue({
          path: ["guardianOccupation"],
          message: "Guardian occupation is required",
        });
      }
      if (!data.guardianRelation) {
        ctx.addIssue({
          path: ["guardianRelation"],
          message: "Guardian relation is required",
        });
      }

      if (!data.guardianAddress) {
        ctx.addIssue({
          path: ["guardianAddress"],
          message: "Guardian address is required",
        });
      }
    }
  });

const singleSiblingSchema = z
  .object({
    name: z.string().min(1, "Sibling's name is required"),

    isSameSchool: z.enum(["yes", "no"], {
      required_error: "Please specify if sibling is in the same school",
    }),

    /* School fields */
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    rollNo: z.string().optional(),
    admissionNo: z.string().optional(),

    /* Outside school */
    age: z.string().optional(),
    occupation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    /* ===== YES → SAME SCHOOL ===== */
    if (data.isSameSchool === "yes") {
      if (!data.classId) {
        ctx.addIssue({
          path: ["classId"],
          message: "Class is required",
        });
      }

      if (!data.sectionId) {
        ctx.addIssue({
          path: ["sectionId"],
          message: "Section is required",
        });
      }

      if (!data.rollNo) {
        ctx.addIssue({
          path: ["rollNo"],
          message: "Roll number is required",
        });
      }

      if (!data.admissionNo) {
        ctx.addIssue({
          path: ["admissionNo"],
          message: "Admission number is required",
        });
      }
    }

    /* ===== NO → NOT SAME SCHOOL ===== */
    if (data.isSameSchool === "no") {
      if (!data.age) {
        ctx.addIssue({
          path: ["age"],
          message: "Age is required",
        });
      }

      if (!data.occupation) {
        ctx.addIssue({
          path: ["occupation"],
          message: "Occupation is required",
        });
      }
    }
  });

export const siblingSchema = z
  .object({
    noSiblings: z.boolean().optional(),
    siblings: z.array(singleSiblingSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const { noSiblings, siblings } = data;

    if (!noSiblings) {
      if (!siblings || siblings.length === 0) {
        ctx.addIssue({
          path: ["siblings"],
          message: "Add at least one sibling",
        });
      }
    }
  });

export const addressSchema = z.object({
  currentAddress: z.string().min(1, "Current address is required"),

  permanentAddress: z.string().min(1, "Permanent address is required"),

  city: z.string().min(1, "City is required"),

  state: z.string().min(1, "State is required"),

  pincode: z.string().min(1, "Pincode is required"),
});

export const transportSchema = z.object({
  route: z.string().optional(),
  vehicleNumber: z.string().optional(),
  pickupPoint: z.string().optional(),
  dropPoint: z.string().optional(),
});

export const hostelSchema = z.object({
  hostelName: z.string().optional(),
  roomNo: z.string().optional(),
});


export const documentsSchema = z.object({
  documents: z.array(
    z.object({
      documentFile: z
        .instanceof(File)
        .refine(file => file.size <= MAX_FILE_SIZE, {
          message: "File size must be less than 2MB",
        }),
    })
  ).optional(),
});

export const medicalSchema = z.object({
  healthIssues: z.string().min(1, "Health issues information is required"),

  medications: z.string().min(1, "Medications information is required"),

  emergencyContact: z
    .string()
    .min(1, "Emergency contact number is required")
    .regex(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number"),

  condition: z.enum(["good", "normal", "bad"], {
    required_error: "Medical condition is required",
  }),
});

export const loginDetailsSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number"),
});
