import {} from "hono";
import * as dashboardServices from './dashboard.service.js';
export const getActiveBookings = async (c) => {
    const user_id = parseInt(c.req.param("user_id"));
    try {
        const activeBookings = await dashboardServices.getActiveBookingsService(user_id);
        if (!activeBookings)
            return c.json({ error: 'Error getting booking' });
        return c.json(activeBookings, 200);
    }
    catch (error) {
        console.error("Error fetching active booking", error);
        return c.json({ error: "Failed to fetch active bookings" });
    }
};
export const getPendingPayments = async (c) => {
    const user_id = parseInt(c.req.param("user_id"));
    try {
        const pendingPayments = await dashboardServices.getPendingPaymentsService(user_id);
        if (!pendingPayments)
            return c.json({ error: 'error getting pending payments' });
        return c.json(pendingPayments, 200);
    }
    catch (error) {
        console.error("Error fetching pending payments", error);
        return c.json({ error: "Failed to fetch pending payments" });
    }
};
export const getTotalRentalsDone = async (c) => {
    const user_id = parseInt(c.req.param("user_id"));
    try {
        const totalRentalsDone = await dashboardServices.getTotalRentalsDoneService(user_id);
        if (totalRentalsDone === undefined || totalRentalsDone === null) {
            return c.json({ error: "error getting rentals" }, 500);
        }
        return c.json(totalRentalsDone, 200);
    }
    catch (error) {
        console.error("Error fetching total rentals done", error);
        return c.json({ error: "Failed to fetch rentals" });
    }
};
export const getUpcomingReturnsController = async (c) => {
    try {
        const user_id = c.req.param("user_id");
        const days = Number(c.req.query("days")) || 7;
        if (!user_id) {
            return c.json({ error: "user_id is required" }, 400);
        }
        const upcomingReturns = await dashboardServices.getUpcomingReturnsService(Number(user_id), days);
        return c.json({
            count: upcomingReturns.length,
            upcoming: upcomingReturns
        });
    }
    catch (error) {
        console.error("Error fetching upcoming returns", error);
        return c.json({ error: "Server error" }, 500);
    }
};
export const getRecentActivity = async (c) => {
    try {
        const user_id = c.req.param("user_id");
        if (!user_id) {
            return c.json({ error: "User ID is required" }, 400);
        }
        const recentActivity = await dashboardServices.getRecentActivityService(Number(user_id));
        return c.json(recentActivity, 200);
    }
    catch (error) {
        console.error("Error fetching recent activity:", error);
        return c.json({ error: "Failed to fetch recent activity" }, 500);
    }
};
