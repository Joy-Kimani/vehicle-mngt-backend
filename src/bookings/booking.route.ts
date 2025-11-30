import * as bookingControllers from './booking.controller.js'
import {Hono} from 'hono'

const bookingRoutes = new Hono()

//get all  bookings
bookingRoutes.get('/bookings', bookingControllers.getAllBookings)

bookingRoutes.get('/bookings/:user_id', bookingControllers.getBookingById)

bookingRoutes.post('/bookings', bookingControllers.createBooking)

bookingRoutes.put('/bookings/:user_id', bookingControllers.updateBooking)

bookingRoutes.delete('/bookings/:user_id/:booking_id', bookingControllers.deleteBooking)

export default bookingRoutes