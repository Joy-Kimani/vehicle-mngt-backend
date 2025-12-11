import { getDbPool } from "../database/configDB.js";
///get all
export const getAllTicketsService = async () => {
    const db = getDbPool();
    const result = await db.request()
        .query("SELECT * FROM Tickets");
    return result.recordset;
};
//get ticket by id
export const getTicketsByIdService = async (ticket_id) => {
    const db = getDbPool();
    const result = await db.request()
        .input("ticket_id", ticket_id)
        .query("SELECT * FROM Tickets WHERE ticket_id = @ticket_id");
    return result.recordset[0] || null;
};
//create ticket
export const createTicketService = async (description, user_id, subject, status) => {
    const db = getDbPool();
    const result = await db.request()
        .input("user_id", user_id)
        .input("description", description)
        .input("subject", subject)
        .input("status", status)
        .query(`INSERT INTO Tickets (user_id, description, subject, status)OUTPUT INSERTED.*VALUES (@user_id, @description, @subject, @status)`);
    return result.rowsAffected[0] === 1 ? "Ticket Created Successfully" : "Failed to create ticket";
};
//update
export const updateTicketService = async (ticket_id, description, user_id, subject, status, updated_at) => {
    const db = getDbPool();
    const result = await db.request()
        .input("ticket_id", ticket_id)
        .input("user_id", user_id)
        .input("description", description)
        .input("subject", subject)
        .input("status", status)
        .input("updated_at", updated_at)
        .query(`UPDATE Tickets SET user_id = @user_id, description = @description, subject = @subject, status = @status, updated_at = @updated_at OUTPUT INSERTED.* WHERE ticket_id = @ticket_id`);
    return result.rowsAffected[0] === 1 ? "Ticket Updated Successfully" : "Failed to update ticket";
};
//delete ticket
export const deleteTicketService = async (ticket_id) => {
    const db = getDbPool();
    const result = await db.request()
        .input("ticket_id", ticket_id)
        .query(`DELETE FROM Tickets OUTPUT DELETED.* WHERE ticket_id = @ticket_id`);
    return result.rowsAffected[0] === 1 ? "Ticket deleted successfully" : "Failed to delete ticket";
};
