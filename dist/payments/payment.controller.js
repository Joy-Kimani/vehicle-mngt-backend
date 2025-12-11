import {} from "hono";
import * as paymentServices from "./payment.service.js";
import { markBookingPaid } from "./payment.service.js";
import { getBookingByIdService } from "../bookings/booking.service.js";
import { initializePaymentServices } from "./initialize-payment.js";
import axios from "axios";
//get all
export const getAllPayments = async (c) => {
    try {
        const payments = await paymentServices.getAllpaymentServices();
        if (payments.length === 0) {
            return c.json({ message: "No payments found" }, 404);
        }
        return c.json(payments, 200);
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};
//get by id
export const getPaymentById = async (c) => {
    const payment_id = parseInt(c.req.param("payment_id"));
    try {
        const result = await paymentServices.getPaymentByIdServices(payment_id);
        if (result === null) {
            return c.json({ error: "Payment not found" }, 404);
        }
        return c.json(result, 200);
    }
    catch (error) {
        console.error("Error fetching payment:", error);
        return c.json({ error: "Failed to fetch payment" }, 500);
    }
};
//create
export const createPayment = async (c) => {
    try {
        const body = await c.req.json();
        const result = await paymentServices.createPaymentService(body.booking_id, body.amount, body.payment_status, body.payment_date, body.payment_method, body.transaction_id);
        if (result === "Payment Created Successfully") {
            return c.json({ message: result }, 201);
        }
        else {
            return c.json({ error: "Failed to create payment" }, 500);
        }
    }
    catch (error) {
        console.error("Error creating payment:", error);
        return c.json({ error: "Failed to create payment" }, 500);
    }
};
//update
export const updatePayment = async (c) => {
    try {
        const payment_id = parseInt(c.req.param("payment_id"));
        const body = await c.req.json();
        // check if payment exists
        const checkExists = await paymentServices.getPaymentByIdServices(payment_id);
        if (checkExists === null) {
            return c.json({ error: "Payment not found" }, 404);
        }
        const result = await paymentServices.updatePaymentService(payment_id, body.booking_id, body.amount, body.payment_status, body.payment_date, body.payment_method, body.transaction_id);
        if (result === null) {
            return c.json({ error: "Failed to update payment" }, 404);
        }
        return c.json({ message: "Payment updated successfully" }, 200);
    }
    catch (error) {
        console.error("Error updating payment:", error);
        return c.json({ error: "Failed to update payment" }, 500);
    }
};
//delete
export const deletePayment = async (c) => {
    const payment_id = parseInt(c.req.param("payment_id"));
    try {
        // check if exists
        const check = await paymentServices.getPaymentByIdServices(payment_id);
        if (check === null) {
            return c.json({ error: "Payment not found" }, 404);
        }
        const result = await paymentServices.deletePaymentService(payment_id);
        if (result === null) {
            return c.json({ error: "Failed to delete payment" }, 404);
        }
        return c.json({ message: "Payment deleted successfully" }, 200);
    }
    catch (error) {
        console.error("Error deleting payment:", error);
        return c.json({ error: "Failed to delete payment" }, 500);
    }
};
// export const initializePayment = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const { email, amount: clientAmount, booking_id, method } = body;
//     if (!email || !booking_id) {
//       return c.json({ error: "Missing required fields: email, booking_id" }, 400);
//     }
//     // ensure booking exists and obtain authoritative amount
//     const booking = await getBookingByIdService(booking_id);
//     if (!booking) {
//       return c.json({ error: "Booking not found" }, 404);
//     }
//     // Use booking.total_amount as the single source of truth, ignoring client-sent amount
//     const amountToUse = Number(booking.total_amount);
//     if (isNaN(amountToUse) || amountToUse <= 0) {
//       return c.json({ error: "Invalid booking amount" }, 400);
//     }
// initialize paystack with booking total amount
//     const transaction: any = await paymentServices.initializePaymentServices(
//       email,
//       amountToUse,
//       booking_id
//     );
//     if (!transaction?.data?.reference) {
//       console.error("Paystack returned no reference", transaction);
//       return c.json({ error: "Failed to initialize payment" }, 500);
//     }
//     // Create payment record in DB (store the booking amount as stored)
//     const created = await paymentServices.createPaymentRecord(
//       booking_id,
//       amountToUse,
//       method || "Paystack",
//       transaction.data.reference
//     );
//     if (!created) {
//       console.error("Failed to create local payment record");
//       // Not fatal for redirecting user, but we surface an error
//       return c.json({ error: "Failed to record payment" }, 500);
//     }
//     return c.json(
//       {
//         message: "Payment initialized successfully",
//         authorization_url: transaction.data.authorization_url,
//         reference: transaction.data.reference,
//         amount: amountToUse, // return amount for frontend confirmation
//       },
//       200
//     );
//   } catch (error) {
//     console.error("Error initializing payment:", error);
//     return c.json({ error: "Payment initialization failed" }, 500);
//   }
// };
// export const initializePayment = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const { email, booking_id, method } = body;
//     if (!email || !booking_id) {
//       return c.json({ error: "Missing required fields: email, booking_id" }, 400);
//     }
//     // Get booking from DB
//     const booking = await getBookingByIdService(booking_id);
//     if (!booking) {
//       return c.json({ error: "Booking not found" }, 404);
//     }
//     const amountToUse = Number(booking.total_amount);
//     if (isNaN(amountToUse) || amountToUse <= 0) {
//       return c.json({ error: "Invalid booking amount" }, 400);
//     }
//     // Initialize Paystack
//     const transaction: any = await paymentServices.initializePaymentServices(
//       email,
//       amountToUse,
//       booking_id
//     );
//     if (!transaction?.data?.reference) {
//       console.error("Paystack returned no reference", transaction);
//       return c.json({ error: "Failed to initialize payment" }, 500);
//     }
//     // Save reference + booking_id in DB
//     const created = await paymentServices.createPaymentRecord(
//       booking_id,
//       amountToUse,
//       method || "Paystack",
//       transaction.data.reference
//     );
//     if (!created) {
//       return c.json({ error: "Failed to record payment" }, 500);
//     }
//     return c.json(
//       {
//         message: "Payment initialized successfully",
//         authorization_url: transaction.data.authorization_url,
//         reference: transaction.data.reference,
//         amount: amountToUse,
//       },
//       200
//     );
//   } catch (error) {
//     console.error("Error initializing payment:", error);
//     return c.json({ error: "Payment initialization failed" }, 500);
//   }
// };
// export const initializePayment = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const { email, amount, booking_id } = body;
//     if (!email || !amount || !booking_id) {
//       return c.json({ error: "Missing required fields" }, 400);
//     }
//     // Pass your frontend callback route here
//     const callback_url = "http://localhost:5173/payment/callback";
//     const resp = await paymentServices.initializePaymentService({
//       email,
//       amount,
//       booking_id,
//       callback_url,
//     });
//     return c.json(resp, 200);
//   } catch (err: any) {
//     console.error("Initialize payment error:", err?.response?.data ?? err);
//     return c.json({ error: "Initialization failed", details: err?.message }, 500);
//   }
// };
export const initializePayment = async (c) => {
    try {
        const { email, amount, booking_id, callback_url } = await c.req.json();
        if (!email || !amount || !booking_id || !callback_url) {
            return c.json({ error: "Missing required fields" }, 400);
        }
        const resp = await paymentServices.initializePaymentServices({
            email,
            amount,
            booking_id,
            callback_url,
        });
        return c.json(resp, 200); // resp includes authorization_url
    }
    catch (err) {
        console.error("Initialize payment error:", err?.response?.data ?? err);
        return c.json({ error: "Initialization failed", details: err?.message }, 500);
    }
};
// payment webhook
// export const paymentWebhook = async (c: Context) => {
//   const event = await c.req.json();
//   if (event.event === "charge.success") {
//     const booking_id = event.data.metadata.booking_id;
//     const reference = event.data.reference;
//     await paymentServices.markPaymentSuccessful(reference); 
//     await markBookingPaid(booking_id);
//     console.log("Payment Success → Booking Updated:", booking_id);
//   }
//   return c.text("OK", 200);
// };
export const paymentWebhook = async (c) => {
    const event = await c.req.json();
    console.log("Webhook payload:", JSON.stringify(event, null, 2));
    const { event: eventType } = event;
    if (eventType === "charge.success") {
        const booking_id = Number(event.data.metadata.booking_id);
        const reference = event.data.reference.trim();
        const paymentRows = await paymentServices.markPaymentSuccessful(reference);
        const bookingRows = await markBookingPaid(booking_id);
        console.log(`Payment rows updated: ${paymentRows}, Booking rows updated: ${bookingRows}`);
        return c.json({
            status: "success",
            message: "Payment recorded and booking updated",
            paymentRows,
            bookingRows
        }, 200);
    }
    else {
        console.warn(`Unhandled webhook event type: ${eventType}`);
        return c.json({ status: "ignored", message: `Event type ${eventType} not handled` }, 200);
    }
};
// export const verifyPayment = async (c: Context) => {
//   try {
//     const reference = c.req.query("reference");
//     if (!reference) {
//       return c.json({ error: "Missing reference" }, 400);
//     }
//     const result = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );
//     const data = result.data.data;
//     if (data.status === "success") {
//       const booking_id = data.metadata.booking_id;
//       await paymentServices.markPaymentSuccessful(reference);
//       await markBookingPaid(booking_id);
//       return c.json(
//         {
//           status: "success",
//           message: "Payment verified successfully",
//           booking_id,
//         },
//         200
//       );
//     }
//     return c.json(
//       {
//         status: "failed",
//         message: "Payment not successful",
//       },
//       400
//     );
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     return c.json({ error: "Verification failed" }, 500);
//   }
// };
export const paymentStatus = async (c) => {
    try {
        const statusCounts = await paymentServices.paymentStatus();
        return c.json(statusCounts, 200);
    }
    catch (error) {
        console.error("Error fetching payment status:", error);
        return c.json({ error: "Failed to fetch payment status" }, 500);
    }
};
export const getPaymentsByUserController = async (c) => {
    try {
        const user_id = Number(c.req.param("user_id"));
        if (!user_id) {
            return c.json({ message: "User ID is required" }, 400);
        }
        const payments = await paymentServices.getPaymentsByUserService(user_id);
        return c.json(payments, 200);
    }
    catch (error) {
        console.error("Error fetching user payments:", error);
        return c.json({ message: "Server error fetching payments" }, 500);
    }
};
/**
 * Initialize payment -> calls Paystack and returns authorization_url
 * Expects body: { email, amount, booking_id, callback_url? }
 */
export const initializePaymentController = async (c) => {
    try {
        const body = await c.req.json();
        const { email, amount, booking_id, callback_url } = body;
        if (!email || !amount || !booking_id) {
            return c.json({ error: "Missing required fields" }, 400);
        }
        const resp = await paymentServices.initializePaymentService({
            email,
            amount,
            booking_id,
            callback_url,
        });
        return c.json(resp, 200);
    }
    catch (err) {
        console.error("Initialize payment error:", err?.response?.data ?? err);
        return c.json({ error: "Initialization failed", details: err?.message }, 500);
    }
};
// export const initializePaymentController = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const { email, callback_url } = body;
//     const booking_id_raw = body.booking_id;
//     // Check for missing required fields
//     const missingFields = [];
//     if (!email) missingFields.push("email");
//     if (!booking_id_raw) missingFields.push("booking_id");
//     if (!callback_url) missingFields.push("callback_url");
//     if (missingFields.length > 0) {
//       return c.json(
//         { error: `Missing required fields: ${missingFields.join(", ")}` },
//         400
//       );
//     }
//     // Now TypeScript knows booking_id is a number
//     const booking_id: number = booking_id_raw;
//     // Fetch booking from DB
//     const booking = await getBookingByIdService(booking_id);
//     if (!booking) {
//       return c.json({ error: "Booking not found" }, 404);
//     }
//     const amount = Number(booking.total_amount);
//     // Initialize payment
//     const transaction = await paymentServices.initializePaymentServices({
//       email,
//       amount,
//       booking_id,
//       callback_url,
//     });
//     const authUrl = transaction.authorization_url;
//     if (!authUrl) {
//       return c.json({ error: "Payment initialization failed" }, 500);
//     }
//     // Redirect user to Paystack authorization page
//     return c.redirect(authUrl);
//   } catch (err) {
//     console.error("Payment initialization error:", err);
//     return c.json({ error: "Payment initialization failed" }, 500);
//   }
// };
/**
 * Verify - used when user returns to your site.
 * GET /verify?reference=...
 */
// export const verifyPayment = async (c: Context) => {
//   try {
//     const reference = c.req.query("reference");
//     if (!reference) return c.json({ error: "Missing reference" }, 400);
//     const verification = await paymentServices.verifyPaymentService(reference);
//     // If success, update local DB
//     if (verification && verification.status === "success") {
//       const booking_id = verification.metadata?.booking_id;
//       await paymentServices.markPaymentSuccessful(reference);
//       if (booking_id) await paymentServices.markBookingPaid(Number(booking_id));
//     }
//     return c.json(verification, 200);
//   } catch (err) {
//     console.error("Verify payment error:", err);
//     return c.json({ error: "Verification failed" }, 500);
//   }
// };
// export const verifyPayment = async (c: Context) => {
//   const reference = c.req.query("reference");
//   if (!reference) return c.json({ error: "Missing reference" }, 400);
//   try {
//     const result = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
//     );
//     const data = result.data.data;
//     if (data.status === "success") {
//       const booking_id = data.metadata.booking_id;
//       await paymentServices.markPaymentSuccessful(reference);
//       await markBookingPaid(booking_id);
//       return c.json({ status: "success", booking_id });
//     }
//     return c.json({ status: "failed" }, 400);
//   } catch (err) {
//     console.error(err);
//     return c.json({ status: "error" }, 500);
//   }
// };
// export const verifyPaymentController = async (c: Context) => {
//   try {
//     const reference = c.req.query("reference");
//     if (!reference) return c.json({ error: "Missing reference" }, 400);
//     const res = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
//       }
//     );
//     const data = res.data.data;
//     if (data.status === "success") {
//       const booking_id = data.metadata.booking_id;
//       await paymentServices.markPaymentSuccessful(reference); // Payment table
//       await markBookingPaid(booking_id); // Optional: Booking table
//       return c.json({ status: "success", booking_id }, 200);
//     }
//     return c.json({ status: "failed", message: "Payment not successful" }, 400);
//   } catch (err) {
//     console.error(err);
//     return c.json({ error: "Verification failed" }, 500);
//   }
// };
// export const verifyPayment = async (c: Context) => {
//   const { reference } = c.req.query; // Paystack sends ?reference=xxxx
//   try {
//     // 1. Call Paystack verify endpoint
//     const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
//     });
//     const data = res.data.data;
//     const booking_id = data.metadata.booking_id; // ✅ important
//     if (data.status === 'success') {
//       // 2. Update payment status
//       await paymentServices.markPaymentSuccessful(reference);
//       // 3. Update booking status
//       await markBookingPaid(booking_id);
//       return c.json({ message: 'Payment verified and booking updated.' });
//     }
//     return c.json({ message: 'Payment not successful.' }, 400);
//   } catch (err) {
//     console.error(err);
//     return c.json({ error: 'Payment verification failed' }, 500);
//   }
// };
// export const verifyPayment = async (c: Context) => {
//   const reference = c.req.query("reference");
//   if (!reference) {
//     return c.redirect("/dashboard/payment?status=error&message=MissingReference");
//   }
//   try {
//     const data = await paymentServices.verifyPaystackPayment(reference);
//     const booking_id = data.metadata?.booking_id;
//     if (data.status === "success") {
//       await paymentServices.markPaymentSuccessful(reference);
//       await paymentServices.markBookingPaid(booking_id);
//       // Redirect to dashboard/payment with success
//       return c.redirect(`/dashboard/payment?status=success&booking_id=${booking_id}`);
//     } else {
//       // Redirect to dashboard/payment with failure
//       return c.redirect(`/dashboard/payment?status=failed&booking_id=${booking_id}`);
//     }
//   } catch (err: any) {
//     console.error("Payment verification error:", err?.response?.data ?? err);
//     return c.redirect(`/dashboard/payment?status=error&message=${encodeURIComponent(err?.message)}`);
//   }
// };
export const verifyPayment = async (c) => {
    const reference = c.req.query("reference");
    if (!reference) {
        return c.json({ error: "Reference is required" }, 400);
    }
    try {
        //  Verify with Paystack
        const data = await paymentServices.verifyPaystackPayment(reference);
        // Extract booking ID from metadata
        const booking_id = data.metadata?.booking_id;
        if (data.status === "success") {
            // Update payment status
            const paymentUpdated = await paymentServices.markPaymentSuccessful(reference);
            //  Update booking status
            const bookingUpdated = await paymentServices.markBookingPaid(booking_id);
            console.log("Payment updated:", paymentUpdated, "Booking updated:", bookingUpdated);
            return c.json({ message: "Payment verified and booking updated successfully." }, 200);
        }
        else {
            return c.json({ message: "Payment not successful." }, 400);
        }
    }
    catch (err) {
        console.error("Payment verification error:", err?.response?.data ?? err);
        return c.json({ error: "Payment verification failed", details: err?.message }, 500);
    }
};
/**
 * Webhook endpoint for Paystack. Validates signature and handles events.
 * Expects raw body and X-Paystack-Signature header.
 */
import crypto from "crypto";
export const paymentWebhookController = async (c) => {
    try {
        const rawBody = await c.req.text(); // raw text required
        const signature = c.req.header("x-paystack-signature") || "";
        // verify signature
        const secret = process.env.PAYSTACK_SECRET_KEY || "";
        const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
        if (hash !== signature) {
            console.warn("Invalid webhook signature");
            return c.json({ error: "Invalid signature" }, 401);
        }
        const event = JSON.parse(rawBody);
        const eventType = event.event ?? event.eventType;
        // handle charge.success
        if (eventType === "charge.success") {
            const booking_id = Number(event.data?.metadata?.booking_id);
            const reference = (event.data?.reference || "").trim();
            // update payment row (if you store transaction_id/reference)
            const paymentRows = await paymentServices.markPaymentSuccessful(reference);
            const bookingRows = booking_id ? await paymentServices.markBookingPaid(booking_id) : 0;
            return c.json({
                status: "success",
                message: "Webhook processed",
                paymentRows,
                bookingRows,
            }, 200);
        }
        // unhandled events
        return c.json({ status: "ignored", message: "Event not handled" }, 200);
    }
    catch (err) {
        console.error("Webhook handler error:", err);
        return c.json({ error: "Webhook processing failed" }, 500);
    }
};
