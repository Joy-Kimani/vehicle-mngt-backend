import * as ticketControllers from './ticket.controller.js';
import { Hono } from 'hono';
const ticketRoutes = new Hono();
//get all  bookings
ticketRoutes.get('/tickets', ticketControllers.getAllTickets);
ticketRoutes.get('/tickets/:ticket_id', ticketControllers.getTicketById);
ticketRoutes.post('/tickets', ticketControllers.createTicket);
ticketRoutes.put('/tickets:ticket_id', ticketControllers.updateTicket);
ticketRoutes.delete('/tickets/ticket_id', ticketControllers.deleteTicket);
//admin get all
ticketRoutes.get("admin/tickets", ticketControllers.getAllTicketsController);
// User-specific tickets
ticketRoutes.get("/user/:user_id", ticketControllers.getUserTicketsController);
// Create ticket
ticketRoutes.post("tickets/create", ticketControllers.createTicketController);
// Get conversation for ticket
ticketRoutes.get("tickets/:ticket_id/messages", ticketControllers.getTicketMessagesController);
// Send message
ticketRoutes.post("tickets/:ticket_id/messages", ticketControllers.sendMessageController);
// Resolve ticket
ticketRoutes.put("/tickets/:ticket_id/resolve", ticketControllers.resolveTicketController);
export default ticketRoutes;
