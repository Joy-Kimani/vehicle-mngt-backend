import { Hono } from "hono";
import * as paymentController from "./payment.controller.js";

export const paymentRoutes = new Hono();

paymentRoutes.get("payment", paymentController.getAllPayments);

paymentRoutes.get("payment/:payment_id", paymentController.getPaymentById);

paymentRoutes.post("payment/", paymentController.createPayment);

paymentRoutes.put("payment/:payment_id", paymentController.updatePayment);

paymentRoutes.delete("payment/:payment_id", paymentController.deletePayment);

paymentRoutes.post("payment/initialize", paymentController.initializePayment);

paymentRoutes.post("payment/webhook", paymentController.paymentWebhook);

paymentRoutes.get("payment/verify", paymentController.verifyPayment);

paymentRoutes.get("payment/status/count", paymentController.paymentStatus);


export default paymentRoutes