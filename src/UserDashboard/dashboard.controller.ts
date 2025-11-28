import { type Context } from "hono";
import * as  dashboardServices from './dashboard.service.js'

export const getActiveBookings = async(c: Context) =>{
    const user_id = parseInt(c.req.param("user_id"))
    try {
        const activeBookings = await dashboardServices.getActiveBookingsService(user_id);
        
        if (!activeBookings) return c.json({error:'Error getting booking'})

        return c.json(activeBookings, 200)    
    } catch (error) {
        console.error("Error fetching active booking", error);
        return c.json({error: "Failed to fetch active bookings"})
    }
}

export const getPendingPayments =  async(c:Context) => {
     const user_id = parseInt(c.req.param("user_id"))
     try {
        const pendingPayments = await dashboardServices.getPendingPaymentsService(user_id);
        
        if (!pendingPayments) return c.json({error:'error getting pending payments'})

        return c.json(pendingPayments, 200)    
    } catch (error) {
        console.error("Error fetching pending payments", error);
        return c.json({error: "Failed to fetch pending payments"})
    }
}

export const getTotalRentalsDone = async(c:Context) => {
     const user_id = parseInt(c.req.param("user_id"))
     try {
        const totalRentalsDone = await dashboardServices.getTotalRentalsDoneService(user_id);
        
        if (!totalRentalsDone) return c.json({error:'error getting rentals'})

        return c.json(totalRentalsDone, 200)    
    } catch (error) {
        console.error("Error fetching total rentals done", error);
        return c.json({error: "Failed to fetch rentals"})
    }
}