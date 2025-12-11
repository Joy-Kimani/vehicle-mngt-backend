import * as bookingControllers from './booking.controller.js';
import { Hono } from 'hono';
const bookingRoutes = new Hono();
//get all  bookings
bookingRoutes.get('/bookings', bookingControllers.getAllBookings);
bookingRoutes.get('/bookings/user/:user_id', bookingControllers.getBookingsByUser);
bookingRoutes.get('/bookings/:bookingId', bookingControllers.getBookingById);
bookingRoutes.post('/bookings', bookingControllers.createBooking);
bookingRoutes.put('/bookings/:user_id', bookingControllers.updateBooking);
bookingRoutes.delete('/bookings/:user_id/:booking_id', bookingControllers.deleteBooking);
bookingRoutes.get('/bookings/dashboard/:booking_id', bookingControllers.bookingPayment);
bookingRoutes.put('/bookings/dashboard/extend/:booking_id', bookingControllers.extendBooking);
bookingRoutes.put('/bookings/dashboard/cancel/:booking_id', bookingControllers.cancelBooking);
bookingRoutes.get('/bookings/vehicle/:vehicle_id', bookingControllers.getBookingManagement);
bookingRoutes.post('/bookings/management', bookingControllers.getFetchBookingsMangement);
export default bookingRoutes;
