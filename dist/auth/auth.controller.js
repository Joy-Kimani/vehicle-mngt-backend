import bcrypt from "bcryptjs";
import {} from "hono";
import * as authServices from "./auth.service.js";
import { getUserByEmailService, saveOTPService, verifyOTPService, updateUserPasswordService } from "../users/user.service.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendNotificationEmail } from "../mailer/mailer.js";
import { UserRegistrationSchema, ResetPasswordSchema } from "../validator/zode.validator.js";
dotenv.config();
// Register new user
export const createUser = async (c) => {
    try {
        const body = (await c.req.json());
        // Validate input
        const validation = UserRegistrationSchema.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            return c.json({ error: "Validation failed", details: errors }, 400);
        }
        // Check if email already exists
        const emailCheck = await getUserByEmailService(body.email);
        if (emailCheck) {
            return c.json({ error: "Email already exists, please log in" }, 400);
        }
        // Create user
        const newUser = await authServices.createUserService(body.first_name, body.last_name, body.email, body.contact_phone, body.password, body.role);
        // Send welcome email
        try {
            await sendNotificationEmail(body.email, body.first_name, "User Registration Successful 🎊", `Welcome ${body.first_name}! Your account has been created successfully.`);
        }
        catch (err) {
            console.warn("Failed to send email:", err);
        }
        return c.json({ message: "User registered successfully", user: newUser }, 201);
    }
    catch (error) {
        console.error("Error creating user:", error);
        return c.json({ error: error.message }, 500);
    }
};
// // Login user (email or username)
// export const loginUser = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const { email, password } = body; // identifier (email)
//      console.log("Identifier:", email);
//     // Fetch user from database
//     const user = await authServices.loginUserService(email);
//     if (!user) {
//       return c.json({ error: "user does not exist" }, 400);
//     }
//     console.log("User found:", user);
//     // Compare password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return c.json({ error: "Invalid email or password" }, 400);
//     }
//     // Generate JWT token
//     const secretKey = process.env.JWT_SECRET_KEY as string;
//     const token = jwt.sign(
//       {
//         user_id: user.user_id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         email: user.email,
//         role: user.role
//       },
//       secretKey,
//       { expiresIn: "1h" }
//     );
//     return c.json({
//       message: "Login successful",
//       token,
//       userInfo: {
//         user_id: user.user_id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         email: user.email,
//         contact_phone: user.contact_phone,
//         role: user.role
//       },
//     }, 200);
//   } catch (error: any) {
//     console.error("Error logging in user:", error);
//     return c.json({ error: "Internal server error" }, 500);
//   }
// };
// Request password reset OTP
export const requestPasswordReset = async (c) => {
    try {
        const { email } = await c.req.json();
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Save OTP in database
        await saveOTPService(email, otp);
        // Send OTP via email
        await sendNotificationEmail(email, "User", "Password Reset OTP 🔒", `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`);
        return c.json({ message: "OTP sent to your email" }, 200);
    }
    catch (error) {
        console.error("Error in requestPasswordReset:", error);
        return c.json({ error: error.message }, 500);
    }
};
// Reset password
export const resetPassword = async (c) => {
    try {
        const body = await c.req.json().catch(() => null);
        if (!body)
            return c.json({ error: "Missing request body" }, 400);
        // Validate input
        const parsed = ResetPasswordSchema.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(e => e.message);
            return c.json({ error: errors.join(", ") }, 400);
        }
        const { email, otp, newPassword } = parsed.data;
        // Verify OTP
        const isValid = await verifyOTPService(email, otp);
        if (!isValid)
            return c.json({ error: "Invalid or expired OTP" }, 400);
        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPasswordService(email, hashedPassword);
        return c.json({ message: "Password reset successfully" }, 200);
    }
    catch (error) {
        console.error("Error in resetPassword:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};
export const loginUser = async (c) => {
    try {
        const body = await c.req.json();
        const { email, password } = body;
        if (!email || !password) {
            return c.json({ error: "Email and password are required" }, 400);
        }
        console.log("Email:", email);
        // Fetch user from database
        const user = await authServices.loginUserService(email);
        if (!user) {
            return c.json({ error: "User does not exist" }, 400);
        }
        console.log("User found:", user);
        // Password validation
        let isPasswordValid = false;
        if (user.password.startsWith("$2b$")) {
            // If password is hashed (bcrypt)
            isPasswordValid = await bcrypt.compare(password, user.password);
        }
        else {
            // Plain text password (current DB)
            isPasswordValid = password === user.password;
        }
        if (!isPasswordValid) {
            return c.json({ error: "Invalid email or password" }, 400);
        }
        // Generate JWT token
        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        }, secretKey, { expiresIn: "1h" });
        return c.json({
            message: "Login successful",
            token,
            userInfo: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                contact_phone: user.contact_phone,
                role: user.role,
            },
        }, 200);
    }
    catch (error) {
        console.error("Error logging in user:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};
