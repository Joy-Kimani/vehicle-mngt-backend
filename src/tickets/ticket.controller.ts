import { type Context } from "hono";
import * as ticketServices from "./ticket.service.js";

//get all
export const getAllTickets = async (c: Context) => {
    try {
        const tickets = await ticketServices.getAllTicketsService();
        if (tickets.length === 0) {
            return c.json({ message: "No tickets found" }, 404);
        }
        return c.json(tickets, 200);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};

//get by id
export const getTicketById = async (c: Context) => {
    const ticket_id = parseInt(c.req.param("ticket_id"));
    try {
        const result = await ticketServices.getTicketsByIdService(ticket_id);
        if (result === null) {
            return c.json({ error: "Ticket not found" }, 404);
        }
        return c.json(result, 200);
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return c.json({ error: "Failed to fetch ticket" }, 500);
    }
};

//create ticket
export const createTicket = async (c: Context) => {
    try {
        const body = await c.req.json() as {user_id: number;subject: string;description: string;status: boolean; };

        const result = await ticketServices.createTicketService( body.description, body.user_id, body.subject, body.status);
        if (result === "Ticket Created Successfully") {
            return c.json({ message: result }, 201);
        } else {
            return c.json({ error: "Failed to create ticket" }, 500);
        }
    } catch (error) {
        console.error("Error creating ticket:", error);
        return c.json({ error: "Failed to create ticket" }, 500);
    }
};

// update
export const updateTicket = async (c: Context) => {
    try {
        const ticket_id = parseInt(c.req.param("ticket_id"));
        const body = await c.req.json() as {user_id: number;subject: string;description: string;status: boolean;updated_at: string;};
        const checkExists = await ticketServices.getTicketsByIdService(ticket_id);
        if (checkExists === null) {
            return c.json({ error: "Ticket not found" }, 404);
        }
        const result = await ticketServices.updateTicketService(ticket_id,body.description,body.user_id,body.subject,body.status,body.updated_at        );

        if (result === null) {
            return c.json({ error: "Failed to update ticket" }, 404);
        }
        return c.json({ message: "Ticket updated successfully" }, 200);
    } catch (error) {
        console.error("Error updating ticket:", error);
        return c.json({ error: "Failed to update ticket" }, 500);
    }
};

//delete
export const deleteTicket = async (c: Context) => {
    const ticket_id = parseInt(c.req.param("ticket_id"));
    try {
        const check = await ticketServices.getTicketsByIdService(ticket_id);
        if (check === null) {
            return c.json({ error: "Ticket not found" }, 404);
        }
        const result = await ticketServices.deleteTicketService(ticket_id);
        if (result === null) {
            return c.json({ error: "Failed to delete ticket" }, 404);
        }
        return c.json({ message: "Ticket deleted successfully" }, 200);
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return c.json({ error: "Failed to delete ticket" }, 500);
    }
};
