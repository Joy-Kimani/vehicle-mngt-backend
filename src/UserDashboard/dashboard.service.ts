import { getDbPool } from "../database/configDB.js";

//get all active bookings
export const getActiveBookingsService = async (user_id: number) => {
  const pool = await getDbPool();
  const query = `
      SELECT b.*, v.vehicle_id
      FROM Bookings b
      JOIN Vehicle v ON b.vehicle_id = v.vehicle_id
      WHERE b.user_id = @user_id
      AND b.status = 'active';
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
      SELECT p.*, b.booking_id, v.model
      FROM Payments p
      JOIN Bookings b ON p.booking_id = b.booking_id
      JOIN VehicleSpecs v ON b.vehicle_spec_id = v.vehicle_spec_id
      WHERE b.user_id = @user_id
      AND p.status = 'pending';
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
      SELECT COUNT(*) AS total_completed
      FROM Bookings
      WHERE user_id = @user_id
      AND status = 'completed';
  `;

  const result = await pool
    .request()
    .input("user_id", user_id)
    .query(query);

  return result.recordset[0].total_completed;
};


//suggest car based on history
