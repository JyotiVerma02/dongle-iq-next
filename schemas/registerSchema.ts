import { z } from "zod";

export const registerSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .transform(name => name.charAt(0).toUpperCase() + name.slice(1)), // Capitalize first letter
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  number: z.string().regex(/^[0-9]{10}$/, "Number must be 10 digits"),
});