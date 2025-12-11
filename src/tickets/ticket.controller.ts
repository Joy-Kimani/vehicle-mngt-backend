import { type Context } from "hono";
import * as ticketServices from "./ticket.service.js";
import { getDbPool } from "../database/configDB.js";

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


// Get all tickets
// export const getAllTicketsController = async (c:Context) => {
//   try {
//     const pool = await getDbPool();
//     const result = await pool
//       .request()
//       .query("SELECT * FROM tickets ORDER BY created_at DESC");

//     c.json(result.recordset);
//   } catch (error) {
//     console.error("Error getting ticket:", error);
//         return c.json({ error: "Failed to get ticket" }, 500);
//   }
// };
export const getAllTicketsController = async (c: Context) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query("SELECT * FROM tickets ORDER BY created_at DESC");
    return c.json(result.recordset); 
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to get tickets" }, 500);
  }
};



// export const getAllTicketsController = async (c:Context) => {
//   try {
//     const pool = await getDbPool();
//     const result = await pool
//       .request()
//       .query(`SELECT t.ticket_id, t.user_id, t.subject, t.status, t.created_at,
//        COALESCE(um.unread_count, 0) AS unread_count
//        FROM tickets t
//        LEFT JOIN (
//            SELECT ticket_id, COUNT(*) AS unread_count
//            FROM ticket_messages
//            WHERE from_admin = 0
//            GROUP BY ticket_id
//        ) um ON t.ticket_id = um.ticket_id
//        ORDER BY t.created_at DESC;
// `);

//     c.json(result.recordset);
//   } catch (error) {
//     console.error("Error getting ticket:", error);
//         return c.json({ error: "Failed to get ticket" }, 500);
//   }
// };


//
// ✔ Get tickets for a specific user
//
export const getUserTicketsController = async (c: Context) => {
  const user_id = c.req.param("user_id");

  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("user_id", user_id)
      .query("SELECT * FROM tickets WHERE user_id=@user_id");

    return c.json(result.recordset);
  } catch (error) {
    console.error("Error getting tickets:", error);
    return c.json({ error: "Failed to get tickets" }, 500);
  }
};

//
// ✔ Create new ticket
//
export const createTicketController = async (c: Context) => {
  const { user_id, subject, description } = await c.req.json();

  if (!user_id || !subject || !description) {
    return c.json({ error: "Missing fields" }, 400);
  }

  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("user_id", user_id)
      .input("subject", subject)
      .input("description", description)
      .query(`
        INSERT INTO tickets (user_id, subject, description, status, created_at)
        VALUES (@user_id, @subject, @description, 1, GETDATE())
      `);

    return c.json({ message: "Ticket created" });
  } catch (error) {
    console.error("Create ticket error:", error);
    return c.json({ error: "Failed to create ticket" }, 500);
  }
};

//
// ✔ Get messages for ticket (conversation)
//
export const getTicketMessagesController = async (c: Context) => {
  const ticket_id = c.req.param("ticket_id");

  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("ticket_id", ticket_id)
      .query(`
        SELECT * FROM ticket_messages 
        WHERE ticket_id=@ticket_id 
        ORDER BY created_at ASC
      `);

    return c.json(result.recordset);
  } catch (err) {
    console.error("Fetch messages error:", err);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
};

//
// ✔ Send message (admin or user)
//
export const sendMessageController = async (c: Context) => {
  const ticket_id = c.req.param("ticket_id");
  const { message, from_admin } = await c.req.json();

  if (!message) {
    return c.json({ error: "Message is required" }, 400);
  }

  try {
    const pool = await getDbPool();

    await pool
      .request()
      .input("ticket_id", ticket_id)
      .input("message", message)
      .input("from_admin", from_admin ? 1 : 0)
      .query(`
        INSERT INTO ticket_messages (ticket_id, message, from_admin, created_at)
        VALUES (@ticket_id, @message, @from_admin, GETDATE())
      `);

    return c.json({ message: "Message sent" });
  } catch (err) {
    console.error("Send message error:", err);
    return c.json({ error: "Failed to send message" }, 500);
  }
};

//
// ✔ Admin resolves ticket
//
export const resolveTicketController = async (c: Context) => {
  const ticket_id = c.req.param("ticket_id");

  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("ticket_id", ticket_id)
      .query(`
        UPDATE tickets 
        SET status = 0, updated_at = GETDATE() 
        WHERE ticket_id=@ticket_id
      `);

    return c.json({ message: "Ticket resolved" });
  } catch (err) {
    console.error("Resolve ticket error:", err);
    return c.json({ error: "Failed to resolve ticket" }, 500);
  }
};
