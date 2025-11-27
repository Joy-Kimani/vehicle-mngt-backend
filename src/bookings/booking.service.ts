import { getDbPool } from "../database/configDB.js";


interface BookingResponse{
    booking_id: number;
    user_id : number; 
    vehicle_id: number; 
    booking_date: string; 
    return_date: string; 
    total_amount: number; 
    booking_status: string;
    created_at: string; 
    updated_at: string;
}

export const getAllBookingsService = async (): Promise<BookingResponse[]> => {
    const db = getDbPool();
    const result = await db.request().query('SELECT * FROM Bookings');
    return result.recordset;
};

export const getBookingByIdService = async (booking_id: number): Promise<BookingResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('booking_id', booking_id)
        .query('SELECT * FROM Bookings WHERE booking_id = @booking_id');
    return result.recordset[0] || null;
};

export const createBookingService = async (user_id: number,vehicle_id: number,booking_date: string,return_date: string,total_amount: number,booking_status: string): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("user_id", user_id)
        .input("vehicle_id", vehicle_id)
        .input("booking_date", booking_date)
        .input("return_date", return_date)
        .input("total_amount", total_amount)
        .input("booking_status", booking_status)
        .query(`INSERT INTO Bookings (user_id, vehicle_id, booking_date, return_date,total_amount, booking_status) OUTPUT INSERTED.*VALUES (@user_id, @vehicle_id, @booking_date, @return_date, @total_amount, @booking_status)`);
    return result.rowsAffected[0] === 1 ? "Booking Created Successfully": "Failed to create booking, try again";
};

export const updateBookingService = async (booking_id: number,user_id: number,vehicle_id: number,booking_date: string,return_date: string,total_amount: number,booking_status: string): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("booking_id", booking_id)
        .input("user_id", user_id)
        .input("vehicle_id", vehicle_id)
        .input("booking_date", booking_date)
        .input("return_date", return_date)
        .input("total_amount", total_amount)
        .input("booking_status", booking_status)
        .query(`UPDATE Bookings SET user_id = @user_id,vehicle_id = @vehicle_id,booking_date = @booking_date,return_date = @return_date,total_amount = @total_amount,booking_status = @booking_status OUTPUT INSERTED.*WHERE booking_id = @booking_id`);

    return result.rowsAffected[0] === 1 ? "Booking Updated Successfully": "Failed to update booking, try again";
};

export const deleteBookingService = async (booking_id: number): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("booking_id", booking_id)
        .query(`DELETE FROM Bookings OUTPUT DELETED.* WHERE booking_id = @booking_id`);
    return result.rowsAffected[0] === 1 ? "Booking deleted successfully" : "Failed to delete booking";
};

export const getBookingByUserService = async (user_id: number): Promise<BookingResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('user_id', user_id)
        .query('SELECT * FROM Bookings WHERE user_id = @user_id');
    return result.recordset[0] || null;
};