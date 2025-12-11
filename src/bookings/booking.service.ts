import { getDbPool } from "../database/configDB.js";


interface BookingResponse{
    booking_id: number;
    user_id : number; 
    vehicle_id: number; 
    booking_date: string; 
    return_date: string; 
    total_amount: number; 
    booking_status: string;
    created_at: string; 
    updated_at: string;
}

export const getAllBookingsService = async (): Promise<BookingResponse[]> => {
    const db = getDbPool();
    const result = await db.request().query('SELECT * FROM Bookings');
    return result.recordset;
};

export const getBookingByIdService = async (booking_id: number): Promise<BookingResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('booking_id', booking_id)
         .query(`
      SELECT 
        b.booking_id, 
        b.total_amount, 
        u.email AS user_email
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      WHERE b.booking_id = @booking_id
    `);
    return result.recordset[0] || null;
};

export const createBookingService = async (
  user_id: number,
  vehicle_id: number,
  booking_date: string,
  return_date: string,
  booking_status: string = "Pending"
): Promise<string> => {
  const db = getDbPool();

  // Calculate days dynamically in SQL
  const result = await db.request()
    .input("user_id", user_id)
    .input("vehicle_id", vehicle_id)
    .input("booking_date", booking_date)
    .input("return_date", return_date)
    .input("booking_status", booking_status)
    .query(`
      INSERT INTO Bookings (user_id, vehicle_id, booking_date, return_date, total_amount, booking_status)
      OUTPUT INSERTED.booking_id
      VALUES (
        @user_id,
        @vehicle_id,
        @booking_date,
        @return_date,
        (SELECT rental_rate * DATEDIFF(DAY, @booking_date, @return_date) 
         FROM Vehicle WHERE vehicle_id = @vehicle_id),
        @booking_status
      );
    `);

  return result.rowsAffected[0] === 1 ? "Booking Created Successfully" : "Failed to create booking, try again";
};


// export const updateBookingService = async (booking_id: number,user_id: number,vehicle_id: number,booking_date: string,return_date: string,total_amount: number,booking_status: string): Promise<string> => {
//     const db = getDbPool();
//     const result = await db.request()
//         .input("booking_id", booking_id)
//         .input("user_id", user_id)
//         .input("vehicle_id", vehicle_id)
//         .input("booking_date", booking_date)
//         .input("return_date", return_date)
//         .input("total_amount", total_amount)
//         .input("booking_status", booking_status)
//         .query(`UPDATE Bookings SET user_id = @user_id,vehicle_id = @vehicle_id,booking_date = @booking_date,return_date = @return_date,total_amount = @total_amount,booking_status = @booking_status OUTPUT INSERTED.*WHERE booking_id = @booking_id`);

//     return result.rowsAffected[0] === 1 ? "Booking Updated Successfully": "Failed to update booking, try again";
// };

export const updateBookingService = async (
  booking_id: number,
  user_id: number,
  vehicle_id: number,
  booking_date: string,
  return_date: string,
  booking_status: string
) => {
  const db = getDbPool();

  const result = await db.request()
    .input("booking_id", booking_id)
    .input("user_id", user_id)
    .input("vehicle_id", vehicle_id)
    .input("booking_date", booking_date)
    .input("return_date", return_date)
    .input("booking_status", booking_status)
    .query(`
      UPDATE Bookings
      SET 
        user_id = @user_id,
        vehicle_id = @vehicle_id,
        booking_date = @booking_date,
        return_date = @return_date,
        total_amount = (SELECT rental_rate * DATEDIFF(DAY, @booking_date, @return_date) 
                        FROM Vehicle WHERE vehicle_id = @vehicle_id),
        booking_status = @booking_status,
        updated_at = GETDATE()
      WHERE booking_id = @booking_id;

      SELECT * FROM Bookings WHERE booking_id = @booking_id;
    `);

  if (result.rowsAffected[0] === 0) return null;
  return result.recordset[0];
};


export const deleteBookingService = async (booking_id: number): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("booking_id", booking_id)
        .query(`DELETE FROM Bookings OUTPUT DELETED.* WHERE booking_id = @booking_id`);
    return result.rowsAffected[0] === 1 ? "Booking deleted successfully" : "Failed to delete booking";
};

export const getBookingByUserService = async (user_id: number): Promise<BookingResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('user_id', user_id)
        .query('SELECT * FROM Bookings WHERE user_id = @user_id');
    return result.recordset[0] || null;
};

//get booking and payment details 
export const bookingPaymentService = async (booking_id:number) => {
    const db = getDbPool();
    const result = await db.request()
        .input('booking_id',booking_id)
        .query(`
      SELECT      
        b.booking_id, b.user_id, b.vehicle_id, b.booking_date, b.return_date,
        b.total_amount, b.booking_status,

        v.rental_rate, v.front_image_url, v.back_image_url, 
        v.side_image_url, v.interior_image_url,

        s.manufacturer, s.model, s.year, 
        s.transmission, s.fuel_type, s.seating_capacity, 
        s.color, s.features,

        p.payment_id, p.amount AS payment_amount, 
        p.payment_status, p.payment_date, 
        p.payment_method, p.transaction_id

      FROM Bookings b
      JOIN Vehicle v ON b.vehicle_id = v.vehicle_id
      JOIN VehicleSpecs s ON v.vehicle_spec_id = s.vehicle_spec_id
      LEFT JOIN Payments p ON b.booking_id = p.booking_id
      WHERE b.booking_id = @booking_id`)
    const row = result.recordset[0];

    if(!row) return null;

    return{
        booking: {
        booking_id: row.booking_id,
        user_id: row.user_id,
        vehicle_id: row.vehicle_id,
        booking_date: row.booking_date,
        return_date: row.return_date,
        total_amount: row.total_amount,
        booking_status: row.booking_status,
      },
      vehicle: {
        vehicle_id: row.vehicle_id,
        manufacturer: row.manufacturer,
        model: row.model,
        year: row.year,
        transmission: row.transmission,
        fuel_type: row.fuel_type,
        seating_capacity: row.seating_capacity,
        color: row.color,
        features: row.features,
        front_image_url: row.front_image_url,
        back_image_url: row.back_image_url,
        side_image_url: row.side_image_url,
        interior_image_url: row.interior_image_url,
      },
      payment: row.payment_id
        ? {
            payment_id: row.payment_id,
            booking_id: row.booking_id,
            amount: row.payment_amount,
            payment_status: row.payment_status,
            payment_date: row.payment_date,
            payment_method: row.payment_method,
            transaction_id: row.transaction_id,
          }
        : null,
    };
}

// extend booking
export const extendBookingService = async (booking_id: number, new_return_date: string) => {
  const db = getDbPool();
  await db.request()
    .input("booking_id", booking_id)
    .input("new_return_date", new_return_date)
    .query(`
      UPDATE Bookings
      SET return_date = @new_return_date,
          total_amount = (SELECT rental_rate * DATEDIFF(DAY, booking_date, @new_return_date) 
                          FROM Vehicle WHERE vehicle_id = vehicle_id),
          updated_at = GETDATE()
      WHERE booking_id = @booking_id
    `);

  return { success: true, message: "Booking extended successfully" };
};


//cancel booking
export const cancelBookingService = async(booking_id:number) => {
    const db = getDbPool();
    const result = await db.request()
        .input('booking_id',booking_id)
        .query(`
            UPDATE Bookings
            SET booking_status = 'Cancelled', updated_at = GETDATE()
            WHERE booking_id = @booking_id
            `)
        return { success: true, message: "Booking cancelled" };
}

export const getBookingsByUserService = async (user_id: number): Promise<BookingResponse[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('user_id', user_id)
        .query(` SELECT * FROM Bookings WHERE user_id = @user_id ORDER BY created_at DESC`);

    return result.recordset;
};

interface BookingPayload {
  id: number;
  property: string;
  user: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
}


//get booking + vehicle + payment details
export const getBookingManagementService = async (booking_id: number) => {
    const db = await getDbPool();
    const query = `
      SELECT 
        b.booking_id, b.user_id, b.vehicle_id, b.booking_date, b.return_date,
        b.total_amount, b.booking_status,

        v.rental_rate, v.front_image_url, v.back_image_url, 
        v.side_image_url, v.interior_image_url,

        s.manufacturer, s.model, s.year, 
        s.transmission, s.fuel_type, s.seating_capacity, 
        s.color, s.features,

        p.payment_id, p.amount AS payment_amount, 
        p.payment_status, p.payment_date, 
        p.payment_method, p.transaction_id

      FROM Bookings b
      JOIN Vehicle v ON b.vehicle_id = v.vehicle_id
      JOIN VehicleSpecs s ON v.vehicle_spec_id = s.vehicle_spec_id
      LEFT JOIN Payments p ON b.booking_id = p.booking_id
      WHERE b.booking_id = @booking_id
    `;      
    const result = await db
      .request()
      .input("booking_id", booking_id)
      .query(query);

    const row = result.recordset[0];
    if (!row) return null;

    return {
      booking: {
        booking_id: row.booking_id,
        user_id: row.user_id,
        vehicle_id: row.vehicle_id,
        booking_date: row.booking_date,
        return_date: row.return_date,
        total_amount: row.total_amount,
        booking_status: row.booking_status,
      },
      vehicle: {
        vehicle_id: row.vehicle_id,
        manufacturer: row.manufacturer,
        model: row.model,
        year: row.year,
        transmission: row.transmission,
        fuel_type: row.fuel_type,
        seating_capacity: row.seating_capacity,
        color: row.color,
        features: row.features,
        front_image_url: row.front_image_url,
        back_image_url: row.back_image_url,
        side_image_url: row.side_image_url,
        interior_image_url: row.interior_image_url,
      },
      payment: row.payment_id
        ? {
            payment_id: row.payment_id,
            booking_id: row.booking_id,
            amount: row.payment_amount,
            payment_status: row.payment_status,
            payment_date: row.payment_date,
            payment_method: row.payment_method,
            transaction_id: row.transaction_id,
          }
        : null,
    };
};  


export const fetchBookingsManagementService = async (payload: BookingPayload[]) => {
  const db = getDbPool();

  const results: any[] = [];

  for (const item of payload) {
    const { user, startDate, endDate, amount, status } = item;

    // Split full name
    const userFullName = user.trim();
    const [firstName, ...last] = userFullName.split(" ");
    const lastName = last.join(" ");

    // Find user_id
    const userQuery = await db.query`
      SELECT user_id 
      FROM Users 
      WHERE first_name = ${firstName} AND last_name = ${lastName}
    `;

    if (userQuery.recordset.length === 0) {
      results.push({
        user,
        success: false,
        error: "User not found",
      });
      continue;
    }

    const user_id = userQuery.recordset[0].user_id;

    // Find a vehicle
    const vehicleQuery = await db.query`
      SELECT TOP 1 vehicle_id 
      FROM Vehicle
      ORDER BY vehicle_id ASC
    `;

    if (vehicleQuery.recordset.length === 0) {
      results.push({
        user,
        success: false,
        error: "No vehicles found",
      });
      continue;
    }

    const vehicle_id = vehicleQuery.recordset[0].vehicle_id;

    // Insert booking
    await db.query`
      INSERT INTO Bookings (user_id, vehicle_id, booking_date, return_date, total_amount, booking_status)
      VALUES (
        ${user_id},
        ${vehicle_id},
        ${startDate},
        ${endDate},
        ${amount},
        ${status || "Pending"}
      )
    `;

    results.push({
      user,
      success: true,
      data: {
        user_id,
        vehicle_id,
        startDate,
        endDate,
        amount,
        status: status || "Pending",
      },
    });
  }

  return {
    message: "Booking processing completed",
    total: payload.length,
    inserted: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
};







// export const bookingService = {
//   /** Get booking + vehicle + payment details */
//   async getBookingDetailsService(booking_id: number) {
//     const db = await getDbPool();

//     const query = `
//       SELECT 
//         b.booking_id, b.user_id, b.vehicle_id, b.booking_date, b.return_date,
//         b.total_amount, b.booking_status,

//         v.rental_rate, v.front_image_url, v.back_image_url, 
//         v.side_image_url, v.interior_image_url,

//         s.manufacturer, s.model, s.year, 
//         s.transmission, s.fuel_type, s.seating_capacity, 
//         s.color, s.features,

//         p.payment_id, p.amount AS payment_amount, 
//         p.payment_status, p.payment_date, 
//         p.payment_method, p.transaction_id

//       FROM Bookings b
//       JOIN Vehicle v ON b.vehicle_id = v.vehicle_id
//       JOIN VehicleSpecs s ON v.vehicle_spec_id = s.vehicle_spec_id
//       LEFT JOIN Payments p ON b.booking_id = p.booking_id
//       WHERE b.booking_id = @booking_id
//     `;

//     const result = await db
//       .request()
//       .input("booking_id", booking_id)
//       .query(query);

//     const row = result.recordset[0];
//     if (!row) return null;

//     return {
//       booking: {
//         booking_id: row.booking_id,
//         user_id: row.user_id,
//         vehicle_id: row.vehicle_id,
//         booking_date: row.booking_date,
//         return_date: row.return_date,
//         total_amount: row.total_amount,
//         booking_status: row.booking_status,
//       },
//       vehicle: {
//         vehicle_id: row.vehicle_id,
//         manufacturer: row.manufacturer,
//         model: row.model,
//         year: row.year,
//         transmission: row.transmission,
//         fuel_type: row.fuel_type,
//         seating_capacity: row.seating_capacity,
//         color: row.color,
//         features: row.features,
//         front_image_url: row.front_image_url,
//         back_image_url: row.back_image_url,
//         side_image_url: row.side_image_url,
//         interior_image_url: row.interior_image_url,
//       },
//       payment: row.payment_id
//         ? {
//             payment_id: row.payment_id,
//             booking_id: row.booking_id,
//             amount: row.payment_amount,
//             payment_status: row.payment_status,
//             payment_date: row.payment_date,
//             payment_method: row.payment_method,
//             transaction_id: row.transaction_id,
//           }
//         : null,
//     };
//   },

//   /** Extend booking */
//   async extendBookingService(booking_id: number, new_return_date: string) {
//     const db = await getDbPool();

//     await db
//       .request()
//       .input("booking_id", booking_id)
//       .input("new_return_date", new_return_date)
//       .query(`
//         UPDATE Bookings
//         SET return_date = @new_return_date, updated_at = GETDATE()
//         WHERE booking_id = @booking_id
//       `);

//     return { success: true, message: "Booking extended successfully" };
//   },

//   /** Cancel booking */
//   async cancelBookingService(booking_id: number) {
//     const db = await getDbPool();

//     await db
//       .request()
//       .input("booking_id", booking_id)
//       .query(`
//         UPDATE Bookings
//         SET booking_status = 'Cancelled', updated_at = GETDATE()
//         WHERE booking_id = @booking_id
//       `);

//     return { success: true, message: "Booking cancelled" };
//   },

//   /** Payment processing */
//   async processPaymentService(booking_id: number, amount: number, method: string) {
//     const db = await getDbPool();

//     const query = `
//       INSERT INTO Payments (
//         booking_id, amount, payment_status, payment_date, payment_method, transaction_id
//       )
//       VALUES (
//         @booking_id, @amount, 'Completed', GETDATE(), @method,
//         CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR(50))
//       );

//       UPDATE Bookings 
//       SET booking_status = 'Approved' 
//       WHERE booking_id = @booking_id;

//       SELECT * FROM Payments WHERE payment_id = SCOPE_IDENTITY();
//     `;

//     const result = await db
//       .request()
//       .input("booking_id", booking_id)
//       .input("amount", amount)
//       .input("method", method)
//       .query(query);

//     return result.recordset[0];
//   },
// };
