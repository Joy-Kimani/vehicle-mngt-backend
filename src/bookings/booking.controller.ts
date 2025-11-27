import { type Context } from "hono"
import * as bookingServices from './booking.service.js'

//get all bookings
export const getAllBookings = async(c: Context) => {
    try{
        const booking = await bookingServices.getAllBookingsService();
        if(booking.length === 0){
            return c.json({message:"No bookings found"}, 404)
        }
        return c.json(booking, 200)
    }catch(error){
    console.error('Error fetching users:', error);
    return c.json({ error: "Internal server error" }, 500);
    }
};

//get by id
export const getBookingById = async (c: Context) => {
    const booking_id = parseInt(c.req.param('booking_id'))
    try {
        const result = await bookingServices.getAllBookingsService();
        if (result === null) {
            return c.json({ error: 'Booking not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching Booking:', error);
        return c.json({ error: 'Failed to fetch booking' }, 500);
    }
}

//create booking
export const createBooking = async (c:Context) => {
    
    const body = await c.req.json() as  {user_id: number,vehicle_id: number,booking_date: string,return_date: string,total_amount: number,booking_status: string}
    try {
        const result = await bookingServices.createBookingService(body.user_id,body.vehicle_id, body.booking_date, body.return_date,body.total_amount,body.booking_status);
        if (result === "Booking Created Successfully") {
            return c.json({ message: result }, 201);
        }else {
            return c.json({ error: 'Failed to create booking' }, 500);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        return c.json({ error: 'Failed to create booking' }, 500);
    }
}

//update user by user_id
export const updateBooking = async (c: Context) => {
    try {
        const user_id = parseInt(c.req.param('booking_id'))
        const body = await c.req.json() as {booking_id: number,user_id: number,vehicle_id: number,booking_date: string,return_date: string,total_amount: number,booking_status: string}

        //check if booking exists/ has already been made by a user
        const checkExists = await bookingServices.getBookingByUserService(user_id);
        if (checkExists === null) {
            return c.json({ error: 'Booking not found' }, 404);
        }
        const result = await bookingServices.updateBookingService(body.booking_id, body.user_id,body.vehicle_id, body.booking_date,body.return_date, body.total_amount,body.booking_status);
        if (result === null) {
            return c.json({ error: 'Failed to update booking' }, 404);
        }

        return c.json({ message: 'Booking updated successfully', updated_user: result }, 200);
    } catch (error) {
        console.error('Error updating Booking:', error);
        return c.json({ error: 'Failed to update booking' }, 500);
    }
}


//delete
export const deleteBooking = async (c: Context) => {
    const booking_id = parseInt(c.req.param('booking_id'))
    try {
        //check if it exists
        const check = await bookingServices.getBookingByIdService(booking_id);
        if (check === null) {
            return c.json({ error: 'Booking not found' }, 404);
        }

        //delete if exists
        const result = await bookingServices.deleteBookingService(booking_id);
        if (result === null) {
            return c.json({ error: 'Failed to delete booking' }, 404);
        }

        return c.json({ message: 'Booking deleted successfully', deleted_user: result }, 200);
    } catch (error) {
        console.error('Error deleting booking:', error);
        return c.json({ error: 'Failed to delete booking' }, 500);
    }
}
