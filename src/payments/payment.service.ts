import { getDbPool } from "../database/configDB.js";
import axios from "axios";

export interface PaymentResponse {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_status: string;
  payment_date: string | null;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  updated_at: string | null;
}

/** get all payments */
export const getAllpaymentServices = async (): Promise<PaymentResponse[]> => {
  const db = getDbPool();
  const result = await db.request().query("SELECT * FROM Payments");
  return result.recordset;
};

/** get by id */
export const getPaymentByIdServices = async (
  payment_id: number
): Promise<PaymentResponse | null> => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("payment_id", payment_id)
    .query("SELECT * FROM Payments WHERE payment_id = @payment_id");
  return result.recordset[0] || null;
};

export const createPaymentService = async (
  booking_id: number,
  amount: number,
  payment_status: string,
  payment_date: string | null,
  payment_method: string,
  transaction_id: string
): Promise<any> => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("booking_id", booking_id)
    .input("amount", amount)
    .input("payment_status", payment_status)
    .input("payment_date", payment_date)
    .input("payment_method", payment_method)
    .input("transaction_id", transaction_id)
    .query(
      `INSERT INTO Payments (booking_id, amount, payment_status, payment_date, payment_method, transaction_id)
       OUTPUT INSERTED.*
       VALUES (@booking_id, @amount, @payment_status, @payment_date, @payment_method, @transaction_id)`
    );

  return result.recordset[0] || null;
};

/** update */
export const updatePaymentService = async (
  payment_id: number,
  booking_id: number,
  amount: number,
  payment_status: string,
  payment_date: string | null,
  payment_method: string,
  transaction_id: string
): Promise<any> => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("payment_id", payment_id)
    .input("booking_id", booking_id)
    .input("amount", amount)
    .input("payment_status", payment_status)
    .input("payment_date", payment_date)
    .input("payment_method", payment_method)
    .input("transaction_id", transaction_id)
    .query(
      `UPDATE Payments
       SET booking_id = @booking_id,
           amount = @amount,
           payment_status = @payment_status,
           payment_date = @payment_date,
           payment_method = @payment_method,
           transaction_id = @transaction_id,
           updated_at = GETDATE()
       OUTPUT INSERTED.*
       WHERE payment_id = @payment_id`
    );

  return result.recordset[0] || null;
};

/** delete */
export const deletePaymentService = async (payment_id: number): Promise<any> => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("payment_id", payment_id)
    .query("DELETE FROM Payments OUTPUT DELETED.* WHERE payment_id = @payment_id");
  return result.recordset[0] || null;
};


// export const createPaymentRecord = async (
//   booking_id: number,
//   amount: number,
//   payment_method: string,
//   transaction_id: string
// ) => {
//   const db = getDbPool();
//   const result = await db
//     .request()
//     .input("booking_id", booking_id)
//     .input("amount", amount)
//     .input("payment_method", payment_method)
//     .input("transaction_id", transaction_id)
//     .query(
//       `INSERT INTO Payments (booking_id, amount, payment_status, payment_date, payment_method, transaction_id, created_at)
//        OUTPUT INSERTED.*
//        VALUES (@booking_id, @amount, 'Pending', GETDATE(), @payment_method, @transaction_id, GETDATE())`
//     );

//   return result.recordset[0] || null;
// };

/** mark payment successful by transaction id (reference) */
// export const markPaymentSuccessful = async (transaction_id: string) => {
//   const db = getDbPool();
//   const result = await db
//     .request()
//     .input("transaction_id", transaction_id)
//     .query(
//       `
//    UPDATE Payments
//    SET payment_status = 'Success', updated_at = GETDATE()
//    WHERE transaction_id = @transaction_id
   
//   `
//     );

//   return result.rowsAffected[0];
// };



/** mark booking as paid / approved */
// export const markBookingPaid = async (booking_id: number) => {
//   const db = getDbPool();
//   const result = await db
//     .request()
//     .input("booking_id", booking_id)
//     .query(
//       `
//     UPDATE Bookings
//     SET booking_status = 'Approved', updated_at = GETDATE()
//     WHERE booking_id = @booking_id
//   `
//     );
//   return result.rowsAffected[0];
// };


// export const initializePaymentServices = async (
//   email: string,
//   amount: number,
//   booking_id: number
// ) => {
//   try {
//     const paystackAmount = Math.round(amount * 100); // kobo / cents
//     const payload = {
//       email,
//       amount: paystackAmount,
//       metadata: { booking_id },
//     };

//     const response = await axios.post("https://api.paystack.co/transaction/initialize", payload, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     });

//     return response.data; // paystack response
//   } catch (error: any) {
//     console.error("Paystack init error:", error?.response?.data ?? error);
//     throw error;
//   }
// };
// export const initializePaymentServices = async (
//   email: string,
//   amount: number,
//   booking_id: number
// ) => {
//   const payload = {
//     email,
//     amount: amount * 100,
//     metadata: { booking_id },
//     callback_url: "http://localhost:5173/dashboard/payments"
//   };

//   const response = await axios.post(
//     "https://api.paystack.co/transaction/initialize",
//     payload,
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       },
//     }
//   );

//   return response.data;
// };


// export const initializePaymentServices = async ({
//   email,
//   amount,
//   booking_id,
//   callback_url,
// }: {
//   email: string;
//   amount: number;
//   booking_id: number;
//   callback_url: string;
// }) => {
//   // Paystack expects amount in kobo
//   const paystackAmount = Math.round(amount * 100);

//   const payload = {
//     email,
//     amount: paystackAmount,
//     metadata: { booking_id },
//     callback_url,
//   };

//   const res = await axios.post(
//     "https://api.paystack.co/transaction/initialize",
//     payload,
//     {
//       headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
//     }
//   );

//   const { reference } = res.data.data;

//   // Create payment record in DB as PENDING
//   await createPaymentRecord(booking_id, amount, "Paystack", reference);

//   return res.data.data; // returns authorization_url, reference, etc
// };


export const initializePaymentServices = async ({
  email,
  amount,
  booking_id,
  callback_url,
}: {
  email: string;
  amount: number;
  booking_id: number;
  callback_url: string;
}) => {
  const paystackAmount = Math.round(amount * 100); // Convert KES to kobo

  const payload = {
    email,
    amount: paystackAmount,
    metadata: { booking_id },
    callback_url,
  };

  const res = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    payload,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );

  const { reference, authorization_url } = res.data.data;

  // Save PENDING payment
  await createPaymentRecord(booking_id, amount, "Paystack", reference);

  return { reference, authorization_url };
};


/** payment status grouped */
export const paymentStatus = async () => {
  const db = getDbPool();
  const result = await db
    .request()
    .query("SELECT payment_status, COUNT(*) AS count FROM Payments GROUP BY payment_status");
  return result.recordset;
};


// export const getPaymentsByUserService = async (user_id: number): Promise<PaymentResponse[]> => {
//   const db = getDbPool();
//   const result = await db
//     .request()
//     .input("user_id", user_id)
//     .query(`
//       SELECT p.* 
//       FROM Payments p
//       INNER JOIN Bookings b ON p.booking_id = b.booking_id
//       WHERE b.user_id = @user_id
//       ORDER BY p.created_at DESC
//     `);

//   return result.recordset;
// };


// src/services/payment.service.ts

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";
const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

/** --- DB services --- */

export const getAllPaymentsService = async (): Promise<PaymentResponse[]> => {
  const db = getDbPool();
  const result = await db.request().query("SELECT * FROM Payments ORDER BY created_at DESC");
  return result.recordset;
};

export const getPaymentByIdService = async (payment_id: number): Promise<PaymentResponse | null> => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("payment_id", payment_id)
    .query("SELECT * FROM Payments WHERE payment_id = @payment_id");
  return result.recordset[0] || null;
};

/**
 * Get payments for a user via booking relationship
 */
export const getPaymentsByUserService = async (user_id: number): Promise<PaymentResponse[]> => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("user_id", user_id)
    .query(`
      SELECT p.* 
      FROM Payments p
      INNER JOIN Bookings b ON p.booking_id = b.booking_id
      WHERE b.user_id = @user_id
      ORDER BY p.created_at DESC
    `);
  return result.recordset;
};

/** create payment record (pending) */
export const createPaymentRecord = async (
  booking_id: number,
  amount: number,
  payment_method: string,
  transaction_id: string
) => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("booking_id", booking_id)
    .input("amount", amount)
    .input("payment_method", payment_method)
    .input("transaction_id", transaction_id)
    .query(
      `INSERT INTO Payments (booking_id, amount, payment_status, payment_date, payment_method, transaction_id, created_at)
       OUTPUT INSERTED.*
       VALUES (@booking_id, @amount, 'Pending', GETDATE(), @payment_method, @transaction_id, GETDATE())`
    );

  return result.recordset[0] || null;
};

/** mark payment successful by transaction id (reference) */
// export const markPaymentSuccessful = async (transaction_id: string) => {
//   const db = getDbPool();
//   const result = await db
//     .request()
//     .input("transaction_id", transaction_id)
//     .query(
//       `
//     UPDATE Payments
//     SET payment_status = 'Success', updated_at = GETDATE()
//     WHERE transaction_id = @transaction_id
//   `
//     );

//   return result.rowsAffected[0];
// };



/** initialize payment with Paystack */
export const initializePaymentService = async (opts: {
  email: string;
  amount: number;
  booking_id: number;
  callback_url?: string;
}) => {
  const { email, amount, booking_id, callback_url } = opts;

  // Paystack expects amount in kobo (or cents) — multiply by 100
  const paystackAmount = Math.round(Number(amount) * 100);

  const payload: any = {
    email,
    amount: paystackAmount,
    metadata: { booking_id },
  };

  if (callback_url) payload.callback_url = callback_url;

  try {
    const res = await axios.post(PAYSTACK_INIT_URL, payload, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    // Optionally create a pending payment row with transaction id = reference (Paystack gives reference in response.data.data.reference)
    const data = res.data?.data;
    if (data) {
      // store a pending record with the reference as transaction_id
      await createPaymentRecord(booking_id, Number(amount), "Paystack", data.reference);
    }

    return res.data;
  } catch (err: any) {
    console.error("Paystack initialize error:", err?.response?.data ?? err);
    throw err;
  }
};

/** verify payment on Paystack */
export const verifyPaymentService = async (reference: string) => {
  try {
    const res = await axios.get(`${PAYSTACK_VERIFY_URL}/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });
    return res.data.data; // raw paystack payload data
  } catch (err: any) {
    console.error("Paystack verify error:", err?.response?.data ?? err);
    throw err;
  }
};


/** Mark a payment as successful */
export const markPaymentSuccessful = async (reference: string) => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("reference", reference)
    .query(`
      UPDATE Payments
      SET payment_status = 'Success', updated_at = GETDATE()
      WHERE transaction_id = @reference
    `);
  return result.rowsAffected[0];
};

/** Mark a booking as paid/approved */
export const markBookingPaid = async (booking_id: number) => {
  const db = getDbPool();
  const result = await db
    .request()
    .input("booking_id", booking_id)
    .query(`
      UPDATE Bookings
      SET booking_status = 'Approved', updated_at = GETDATE()
      WHERE booking_id = @booking_id
    `);
  return result.rowsAffected[0];
};

/** Verify payment with Paystack */
export const verifyPaystackPayment = async (reference: string) => {
  const res = await axios.get(`${PAYSTACK_VERIFY_URL}/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });

  const data = res.data.data;
  return data;
};