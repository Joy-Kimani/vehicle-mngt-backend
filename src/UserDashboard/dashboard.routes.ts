import { Hono } from "hono";
import * as dashboardControllers from'./dashboard.controller.js'

const dashboardRoutes = new Hono()

//get active
dashboardRoutes.get('/dashboard/active/:user_id', dashboardControllers.getActiveBookings)

//get pending
dashboardRoutes.get('/dashboard/pending/:user_id', dashboardControllers.getPendingPayments)

//get total
dashboardRoutes.get('/dashboard/total/:user_id',dashboardControllers.getTotalRentalsDone)

//upcoming returns
dashboardRoutes.get('/dashboard/returns/:user_id', dashboardControllers.getUpcomingReturnsController)


export default dashboardRoutes