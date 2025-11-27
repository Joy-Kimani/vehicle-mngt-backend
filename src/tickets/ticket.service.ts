import { getDbPool } from "../database/configDB.js";

interface TicketResponse {
    ticket_id: number;
    user_id: number;
    subject: string;
    description: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

///get all
export const getAllTicketsService = async (): Promise<TicketResponse[]> => {
    const db = getDbPool();
    const result = await db.request()
        .query("SELECT * FROM Tickets");
    return result.recordset;
};

//get ticket by id
export const getTicketsByIdService = async (ticket_id: number): Promise<TicketResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input("ticket_id", ticket_id)
        .query("SELECT * FROM Tickets WHERE ticket_id = @ticket_id");
    return result.recordset[0] || null;
};

//create ticket
export const createTicketService = async (
    description: string,
    user_id: number,
    subject: string,
    status: boolean
): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("user_id", user_id)
        .input("description", description)
        .input("subject", subject)
        .input("status", status)
        .query(`INSERT INTO Tickets (user_id, description, subject, status)OUTPUT INSERTED.*VALUES (@user_id, @description, @subject, @status)`);
    return result.rowsAffected[0] === 1 ? "Ticket Created Successfully": "Failed to create ticket";};

//update
export const updateTicketService = async (
    ticket_id: number,
    description: string,
    user_id: number,
    subject: string,
    status: boolean,
    updated_at: string
): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("ticket_id", ticket_id)
        .input("user_id", user_id)
        .input("description", description)
        .input("subject", subject)
        .input("status", status)
        .input("updated_at", updated_at)
        .query(`UPDATE Tickets SET user_id = @user_id, description = @description, subject = @subject, status = @status, updated_at = @updated_at OUTPUT INSERTED.* WHERE ticket_id = @ticket_id`);

    return result.rowsAffected[0] === 1 ? "Ticket Updated Successfully": "Failed to update ticket";};

//delete ticket
export const deleteTicketService = async (ticket_id: number): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("ticket_id", ticket_id)
        .query(`DELETE FROM Tickets OUTPUT DELETED.* WHERE ticket_id = @ticket_id`);
    return result.rowsAffected[0] === 1 ? "Ticket deleted successfully" : "Failed to delete ticket";
};
