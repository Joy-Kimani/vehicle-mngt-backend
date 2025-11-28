import { Hono } from "hono";
import * as dashboardControllers from'./dashboard.controller.js'

const dashboardRoutes = new Hono()

//get active
dashboardRoutes.get('/dashboard/active/:user_id', dashboardControllers.getActiveBookings)

//get pending
dashboardRoutes.get('/dashboard/:user_id', dashboardControllers.getPendingPayments)

//get total
dashboardRoutes.get('/dashboard/:user_id',dashboardControllers.getTotalRentalsDone)

export default dashboardRoutes