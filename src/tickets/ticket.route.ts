import * as ticketControllers from './ticket.controller.js'
import {Hono} from 'hono'

const ticketRoutes = new Hono()

//get all  bookings
ticketRoutes.get('/tickets', ticketControllers.getAllTickets)

ticketRoutes.get('/tickets/:ticket_id', ticketControllers.getTicketById)

ticketRoutes.post('/tickets', ticketControllers.createTicket)

ticketRoutes.put('/tickets:ticket_id', ticketControllers.updateTicket)

ticketRoutes.delete('/tickets/ticket_id', ticketControllers.deleteTicket)

export default ticketRoutes