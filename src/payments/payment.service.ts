import { getDbPool } from "../database/configDB.js";
import { paystack } from "./utils/paystackClient.js";
import axios from "axios";

interface PaymentResponse{
    payment_id: number; 
    booking_id: number;
    amount: number;
    payment_status : string; 
    payment_date: string; 
    payment_method: string; 
    transaction_id: number;
    created_at: string;
    updated_at: string;
}

//get all 
export const getAllpaymentServices = async (): Promise<PaymentResponse[]> => {
    const db = getDbPool();
    const result =  await db.request()
         .query('SELECT * FROM Payments')
    return result.recordset;
}
//get by id
export const getPaymentByIdServices = async(payment_id: number): Promise<PaymentResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('payment_id',payment_id)
        .query('SELECT * FROM Payments WHERE payment_id = @payment_id');
    return result.recordset[0] || null;
}
//create 
export const createPaymentService = async(booking_id: number, amount: number,payment_status : string,payment_date: string,payment_method: string,transaction_id: string): Promise<string> =>{
    const db = getDbPool();
    const result = await db.request()
         .input('booking_id', booking_id)
         .input('amount', amount)
         .input('payment_status', payment_status)
         .input('payment_date', payment_date)
         .input('payment_method', payment_method)
         .input('transaction_id', transaction_id)
         .query('INSERT INTO Payments (booking_id, amount, payment_status,payment_date, payment_method,payment_date,payment_method, transaction_id) OUTPUT INSERTED.* VALUES (@booking_id, @amount, @payment_status, @payment_date, @payment_method, @payment_date, @payment_method, @transaction_id)')
    return result.rowsAffected[0] === 1 ? "Payment Created Successfully" : "Failed create payment try again"
}

//update 
export const updatePaymentService = async ( payment_id: number, booking_id: number, amount: number, payment_status : string, payment_date: string, payment_method: string,transaction_id: number): Promise<string> => {
    const  db = getDbPool();
    const result = await db.request()
         .input('payment_id',payment_id)
         .input('booking_id', booking_id)
         .input('amount', amount)
         .input('payment_status', payment_status)
         .input('payment_date', payment_date)
         .input('payment_method', payment_method)
         .input('transcation_id', transaction_id)
         .query('UPDATE Payments SET booking_id = @booking_id,amount = @amount, payment_status= @payment_status,payment_date= @payment_date,payment_method = @payment_method, transaction_id=@transaction_id  OUTPUT INSERTED.* WHERE payment_id= @payment_id');
    return result.rowsAffected[0] === 1 ? "Payment Updated Successfully" : "Failed to update payment try again"
}

//delete by id
export const deletePaymentService = async (payment_id:number): Promise<string> => {
    const db = getDbPool(); 
    const result = await db.request()
        .input('payment_id', payment_id)
        .query('DELETE FROM Payments OUTPUT DELETED.* WHERE payment_id = @payment_id');
    return result.rowsAffected[0] === 1 ? "Payment deleted successfully" : "Failed to delete payment"
}

//create payment record when initializing payment
export const createPaymentRecord = async (booking_id: number,amount: number,payment_method: string,transaction_id: string) => {
  const db = getDbPool();
  const result = await db.request()
    .input("booking_id", booking_id)
    .input("amount", amount)
    .input("payment_method", payment_method)
    .input("transaction_id", transaction_id)
    .query(`
      INSERT INTO Payments (booking_id, amount, payment_status, payment_date, payment_method, transaction_id)
      VALUES (@booking_id, @amount, 'Pending', GETDATE(), @payment_method, @transaction_id)
    `);
};
//mark payment as successful
export const markPaymentSuccessful = async (transaction_id: string) => {
  const db = getDbPool();
  const result = await db.request()
    .input("transaction_id", transaction_id)  
    .query(`
      UPDATE Payments
      SET payment_status = 'Success', updated_at = GETDATE()
      WHERE transaction_id = @transaction_id
    `);
  return result.rowsAffected[0]; 
};

export const markBookingPaid = async (booking_id: number) => {
  const db = getDbPool();
  const result = await db.request()
    .input("booking_id", booking_id)  
    .query(`
      UPDATE Bookings
      SET booking_status = 'Approved', updated_at = GETDATE()
      WHERE booking_id = @booking_id
    `);
  return result.rowsAffected[0]; 
};

export const initializePaymentServices = async (email:string, amount: number, booking_id:number) => {
  try {
    const payload = {
      email,
      amount: amount * 100,
      metadata: { booking_id }
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Paystack init error:", error?.response?.data ?? error);
    return null;
  }
};


export const paymentStatus = async() => {
  const db = getDbPool();
  const result = await db.request()
    .query(`
      SELECT payment_status, COUNT(*) AS count FROM Payments GROUP BY payment_status
    `);
  return result.recordset;
}