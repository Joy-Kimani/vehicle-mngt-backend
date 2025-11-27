import { type Context } from "hono";
import * as paymentServices from "./payment.service.js";

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

// =============================
// UPDATE PAYMENT
// =============================
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

// =============================
// DELETE PAYMENT
// =============================
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
