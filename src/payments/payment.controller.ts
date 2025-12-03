import { type Context } from "hono";
import * as paymentServices from "./payment.service.js";
import { markBookingPaid } from "./payment.service.js";
import { getBookingByIdService } from "../bookings/booking.service.js";
import { initializePaymentServices } from "./initialize-payment.js";
import axios from "axios";

//get all
export const getAllPayments = async (c: Context) => {
    try {
        const payments = await paymentServices.getAllpaymentServices();
        if (payments.length === 0) {
            return c.json({ message: "No payments found" }, 404);
        }
        return c.json(payments, 200);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};
//get by id
export const getPaymentById = async (c: Context) => {
    const payment_id = parseInt(c.req.param("payment_id"));

    try {
        const result = await paymentServices.getPaymentByIdServices(payment_id);
        if (result === null) {
            return c.json({ error: "Payment not found" }, 404);
        }
        return c.json(result, 200);
    } catch (error) {
        console.error("Error fetching payment:", error);
        return c.json({ error: "Failed to fetch payment" }, 500);
    }
};
//create
export const createPayment = async (c: Context) => {
    try {
        const body = await c.req.json() as {
            booking_id: number;
            amount: number;
            payment_status: string;
            payment_date: string;
            payment_method: string;
            transaction_id: string;
        };

        const result = await paymentServices.createPaymentService(
            body.booking_id,
            body.amount,
            body.payment_status,
            body.payment_date,
            body.payment_method,
            body.transaction_id
        );

        if (result === "Payment Created Successfully") {
            return c.json({ message: result }, 201);
        } else {
            return c.json({ error: "Failed to create payment" }, 500);
        }
    } catch (error) {
        console.error("Error creating payment:", error);
        return c.json({ error: "Failed to create payment" }, 500);
    }
};

//update
export const updatePayment = async (c: Context) => {
    try {
        const payment_id = parseInt(c.req.param("payment_id"));

        const body = await c.req.json() as {
            booking_id: number;
            amount: number;
            payment_status: string;
            payment_date: string;
            payment_method: string;
            transaction_id: number;
        };

        // check if payment exists
        const checkExists = await paymentServices.getPaymentByIdServices(payment_id);
        if (checkExists === null) {
            return c.json({ error: "Payment not found" }, 404);
        }

        const result = await paymentServices.updatePaymentService(
            payment_id,
            body.booking_id,
            body.amount,
            body.payment_status,
            body.payment_date,
            body.payment_method,
            body.transaction_id
        );

        if (result === null) {
            return c.json({ error: "Failed to update payment" }, 404);
        }

        return c.json({ message: "Payment updated successfully" }, 200);
    } catch (error) {
        console.error("Error updating payment:", error);
        return c.json({ error: "Failed to update payment" }, 500);
    }
};

//delete
export const deletePayment = async (c: Context) => {
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
    } catch (error) {
        console.error("Error deleting payment:", error);
        return c.json({ error: "Failed to delete payment" }, 500);
    }
};

//initialize payment
export const initializePayment = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { email, amount, booking_id, method } = body;

    if (!email || !amount || !booking_id) {
      return c.json(
        { error: "Missing required fields: email, amount, booking_id" },
        400
      );
    }

    // check if booking exists
    const booking = await getBookingByIdService(booking_id);
    if (booking === null) {
      return c.json({ error: "Booking not found" }, 404);
    }

    // initialize Paystack Payment (FIXED)
    const transaction: any = await paymentServices.initializePaymentServices(
      email,
      amount,
      booking_id
    );

    if (!transaction?.data?.reference) {
      return c.json({ error: "Failed to initialize payment" }, 500);
    }

    // create payment record
    const paymentCreated = await paymentServices.createPaymentRecord(
      booking_id,
      amount,
      method || "Paystack",
      transaction.data.reference
    );


    if (paymentCreated === null) {
      return c.json(
        { error: "Failed to create payment record" },
        500
      );
    }

    return c.json(
      {
        message: "Payment initialized successfully",
        authorization_url: transaction.data.authorization_url,
        reference: transaction.data.reference,
      },
      200
    );

  } catch (error) {
    console.error("Error initializing payment:", error);
    return c.json({ error: "Payment initialization failed" }, 500);
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
export const paymentWebhook = async (c: Context) => {
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
  } else {
    console.warn(`Unhandled webhook event type: ${eventType}`);
    return c.json({ status: "ignored", message: `Event type ${eventType} not handled` }, 200);
  }
};

export const verifyPayment = async (c: Context) => {
  try {
    const reference = c.req.query("reference");

    if (!reference) {
      return c.json({ error: "Missing reference" }, 400);
    }

    const result = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = result.data.data;

    if (data.status === "success") {
      const booking_id = data.metadata.booking_id;

      await paymentServices.markPaymentSuccessful(reference);
      await markBookingPaid(booking_id);

      return c.json(
        {
          status: "success",
          message: "Payment verified successfully",
          booking_id,
        },
        200
      );
    }

    return c.json(
      {
        status: "failed",
        message: "Payment not successful",
      },
      400
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return c.json({ error: "Verification failed" }, 500);
  }
};

export const paymentStatus = async (c: Context) => {
  try {
    const statusCounts = await paymentServices.paymentStatus();
    return c.json(statusCounts, 200);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return c.json({ error: "Failed to fetch payment status" }, 500);
  }
}