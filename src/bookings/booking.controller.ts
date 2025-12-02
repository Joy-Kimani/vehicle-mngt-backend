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
        console.error('Error fetching bookings:', error); 
        return c.json({ error: "Internal server error" }, 500);
    }
};

// //get by id
// export const getBookingById = async (c: Context) => {
//     const booking_id = parseInt(c.req.param('booking_id'))
//     try {
//         const result = await bookingServices.getAllBookingsService();
//         if (result === null) {
//             return c.json({ error: 'Booking not found' }, 404);
//         }
//         return c.json(result);
//     } catch (error) {
//         console.error('Error fetching Booking:', error);
//         return c.json({ error: 'Failed to fetch booking' }, 500);
//     }
// }

// GET /bookings/:booking_id
export const getBookingById = async (c: Context) => {
    const booking_id = parseInt(c.req.param('booking_id'));

    if (isNaN(booking_id)) {
        return c.json({ error: 'Invalid booking_id parameter' }, 400);
    }

    try {
        const booking = await bookingServices.getBookingByIdService(booking_id);

        if (!booking) {
            return c.json({ error: 'Booking not found' }, 404);
        }

        return c.json(booking, 200);

    } catch (error) {
        console.error('Error fetching Booking:', error);
        return c.json({ error: 'Failed to fetch booking' }, 500);
    }
};

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
        const user_id = Number(c.req.param("user_id"));
        const body = await c.req.json();
        const { booking_id } = body;

        if (!booking_id || !user_id) {
            return c.json({ error: "booking_id and user_id are required" }, 400);
        }

        const existingBooking = await bookingServices.getBookingByIdService(booking_id);
        if (!existingBooking) {
            return c.json({ error: "Booking not found" }, 404);
        }
        if (existingBooking.user_id !== user_id) {
            return c.json({ error: "Booking does not belong to this user" }, 403);
        }

        const updatedBooking = await bookingServices.updateBookingService( booking_id, body.user_id, body.vehicle_id, body.booking_date, body.return_date, body.total_amount, body.booking_status );

        if (!updatedBooking) {
            return c.json({ error: "Failed to update booking" }, 500);
        }

        const updatedTime = new Date(updatedBooking.updated_at);
        const formattedTime = `${updatedTime.getHours().toString().padStart(2,'0')}:${updatedTime.getMinutes().toString().padStart(2,'0')}`;

        return c.json({
            message: "Booking updated successfully",
            updated_booking: updatedBooking,
            updated_at: updatedBooking.updated_at,
            formatted_updated_at: formattedTime
        });

    } catch (error) {
        console.error("Error updating booking:", error);
        return c.json({ error: "Server error" }, 500);
    }
};



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

export const bookingPayment = async(c:Context) => {
    const booking_id = Number(c.req.param("booking_id"));
    try{        
        const result = await bookingServices.bookingPaymentService(booking_id);
        if (result === null) {
            return c.json({ error: 'Booking and payment not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching Booking and payment:', error);
        return c.json({ error: 'Failed to fetch booking and payment' }, 500);
    }
}

export const extendBooking = async(c:Context) => {
    const body = await c.req.json() as  {user_id: number,new_return_date: string}
    try {
        const result = await bookingServices.extendBookingService(body.user_id, body.new_return_date)
        if (!result === null) {
            return c.json({ message: result }, 201);
        }else {
            return c.json({ error: 'Failed to extend booking' }, 500);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        return c.json({ error: 'Failed to extend booking' }, 500);
    }
}

export const cancelBooking = async (c: Context) => {
    const booking_id = parseInt(c.req.param('booking_id'))
    try {
        //check if it exists
        const check = await bookingServices.getBookingByIdService(booking_id);
        if (check === null) {
            return c.json({ error: 'Booking not found' }, 404);
        }

        //delete if exists
        const result = await bookingServices.cancelBookingService(booking_id);
        if (result === null) {
            return c.json({ error: 'Failed to cancel booking' }, 404);
        }

        return c.json({ message: 'Booking cancelled successfully', deleted_user: result }, 200);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return c.json({ error: 'Failed to cancel booking' }, 500);
    }
}


// GET /bookings/user/:user_id
export const getBookingsByUser = async (c: Context) => {
    const user_id = parseInt(c.req.param('user_id'));

    try {
        const bookings = await bookingServices.getBookingsByUserService(user_id);

        if (!bookings || bookings.length === 0) {
            return c.json({ message: "No bookings found for this user" }, 404);
        }

        return c.json(bookings, 200);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return c.json({ error: "Failed to fetch bookings" }, 500);
    }
};
