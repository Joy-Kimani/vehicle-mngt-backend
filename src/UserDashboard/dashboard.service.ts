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
export const getRecentActivityService = async (user_id: number) => {

  try {
  const pool = await getDbPool();

  const query = ` SELECT TOP 50 *
    FROM (
        /* 1. BOOKING CREATED */
        SELECT 
            B.booking_id AS id,
            'booking_created' AS activity_type,
            CONCAT('Booking #', B.booking_id, ' created for vehicle ', B.vehicle_id) AS description,
            B.booking_date AS activity_date,
            B.booking_status AS status
        FROM Bookings B
        WHERE B.user_id = @user_id
    
        UNION ALL
    
        /* 2. BOOKING STATUS UPDATES */
        SELECT 
            B.booking_id AS id,
            'booking_status' AS activity_type,
            CONCAT('Booking #', B.booking_id, ' updated to ', B.booking_status) AS description,
            B.updated_at AS activity_date,
            B.booking_status AS status
        FROM Bookings B
        WHERE B.user_id = @user_id
          AND B.updated_at IS NOT NULL
    
        UNION ALL
    
        /* 3. PAYMENTS */
        SELECT 
            P.payment_id AS id,
            CASE 
                WHEN P.payment_status = 'Completed' THEN 'payment_completed'
                WHEN P.payment_status = 'Failed' THEN 'payment_failed'
                ELSE 'payment_pending'
            END AS activity_type,
            CONCAT('Payment of ', P.amount, ' for booking #', P.booking_id) AS description,
            P.payment_date AS activity_date,
            P.payment_status AS status
        FROM Payments P
        INNER JOIN Bookings B ON P.booking_id = B.booking_id
        WHERE B.user_id = @user_id
    
        UNION ALL
    
        /* 4. UPCOMING RETURNS (Next 7 days) */
        SELECT
            B.booking_id AS id,
            'upcoming_return' AS activity_type,
            CONCAT('Vehicle ', B.vehicle_id, ' is due for return') AS description,
            B.return_date AS activity_date,
            'Due Soon' AS status
        FROM Bookings B
        WHERE B.user_id = @user_id
          AND B.booking_status = 'Active'
          AND B.return_date BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE())
    ) AS UnifiedActivity
    ORDER BY activity_date DESC;
    `
  const result = await pool.request()
    .input("user_id", user_id)
    .query(query);
  return result.recordset;

    } catch (error) {
        console.error("Error fetching upcoming returns:", error);
        throw new Error("Failed to fetch upcoming returns");
    }

}