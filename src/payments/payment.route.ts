import { Hono } from "hono";
import * as paymentController from "./payment.controller.js";

export const paymentRoutes = new Hono();

paymentRoutes.get("payment/", paymentController.getAllPayments);

paymentRoutes.get("payment/:payment_id", paymentController.getPaymentById);

paymentRoutes.post("payment/", paymentController.createPayment);


paymentRoutes.put("payment/:payment_id", paymentController.updatePayment);


paymentRoutes.delete("payment/:payment_id", paymentController.deletePayment);

export default paymentRoutes