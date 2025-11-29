import { getDbPool } from "../database/configDB.js";

//get all active bookings
export const getActiveBookingsService = async (user_id: number) => {
  const pool = await getDbPool();
  const query = `
      SELECT 
          b.booking_id,
          b.user_id,
          b.vehicle_id,
          b.booking_date,
          b.return_date,
          b.total_amount,
          b.booking_status,
          b.created_at,
          b.updated_at
      FROM Bookings b
      WHERE b.user_id = @user_id
        AND b.booking_status = 'Active';
  `;

  const result = await pool
    .request()
    .input("user_id", user_id)
    .query(query);

  return result.recordset;
};


//get pending payments
export const getPendingPaymentsService = async (user_id: number) => { 
  const pool = await getDbPool();

  const query = `
    SELECT 
        p.payment_id,
        p.amount,
        p.payment_status,
        p.payment_date,
        p.payment_method,
        p.transaction_id,
        p.created_at,
        p.updated_at,
        b.booking_id AS booking_id,
        v.model
    FROM Payments p
    JOIN Bookings b ON p.booking_id = b.booking_id
    JOIN VehicleSpecs v ON b.vehicle_id = v.vehicle_spec_id
    WHERE b.user_id = @user_id
      AND p.payment_status = 'Pending';
`;


  const result = await pool
    .request()
    .input("user_id", user_id)
    .query(query);

  return result.recordset;
};

//total rentals done
export const getTotalRentalsDoneService = async (user_id: number) => {
  const pool = await getDbPool();

  const query = `
      SELECT COUNT(*) AS total_completed,
      SUM(total_amount) AS total_amount
      FROM Bookings
      WHERE user_id = @user_id
      AND booking_status = 'Completed';
  `;

  const result = await pool.request()
    .input("user_id", user_id)
    .query(query);

  return {total_completed: result.recordset[0].total_completed,
    total_amount: result.recordset[0].total_amount 
};
}


export const getUpcomingReturnsService = async (user_id: number, days = 7) => {
    try {
        const pool = await getDbPool();

        const query = `
            SELECT 
                booking_id,
                user_id,
                vehicle_id,
                booking_date,
                return_date,
                booking_status,
                total_amount
            FROM Bookings
            WHERE 
                user_id = @user_id
                AND booking_status = 'Active'
                AND return_date BETWEEN GETDATE() AND DATEADD(DAY, @days, GETDATE())
            ORDER BY return_date ASC;
        `;

        const result = await pool
            .request()
            .input("user_id", user_id)
            .input("days", days)
            .query(query);

        return result.recordset;

    } catch (error) {
        console.error("Error fetching upcoming returns:", error);
        throw new Error("Failed to fetch upcoming returns");
    }
};

//suggest car based on history
