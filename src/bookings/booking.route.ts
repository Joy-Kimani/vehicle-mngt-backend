import * as bookingControllers from './booking.controller.js'
import {Hono} from 'hono'

const bookingRoutes = new Hono()

//get all  bookings
bookingRoutes.get('/bookings', bookingControllers.getAllBookings)

bookingRoutes.get('/bookings/:booking_id', bookingControllers.getBookingById)

bookingRoutes.post('/bookings/', bookingControllers.createBooking)

bookingRoutes.put('/bookings/:booking_id', bookingControllers.updateBooking)

bookingRoutes.delete('/bookings/:booking_id', bookingControllers.deleteBooking)

export default bookingRoutes