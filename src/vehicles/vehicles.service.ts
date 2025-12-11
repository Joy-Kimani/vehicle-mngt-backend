import { getDbPool } from "../database/configDB.js";
import type{ Context } from "hono";

interface VehicleResponse {
    vehicle_id: number;
    vehicle_spec_id: number;
    rental_rate: number;
    availability: boolean;

    manufacturer: string;
    model: string;
    year: number;
    fuel_type: string;
    engine_capacity: string;
    transmission: string;
    seating_capacity: string;
    color: string;
    features: string;

    front_image_url?: string;
    back_image_url?: string;
    side_image_url?: string;
    interior_image_url?: string;
}

interface VehicleCreationData {
    vehicle_spec_id: number;
    rental_rate: number;
    availability: boolean;
    front_image_url?: string;
    back_image_url?: string;
    side_image_url?: string;
    interior_image_url?: string;
}

interface VehicleUpdateData extends VehicleCreationData {}
//get all
export const getAllVehicleServices = async (): Promise<VehicleResponse[]> => {
    const db = getDbPool();

    const result = await db.request().query(`
        SELECT
            v.vehicle_id,
            v.vehicle_spec_id,
            v.rental_rate,
            v.availability,
            v.front_image_url,
            v.back_image_url,
            v.side_image_url,
            v.interior_image_url,

            vs.manufacturer,
            vs.model,
            vs.year,
            vs.fuel_type,
            vs.engine_capacity,
            vs.transmission,
            vs.seating_capacity,
            vs.color,
            vs.features
        FROM Vehicle v
        INNER JOIN VehicleSpecs vs 
            ON v.vehicle_spec_id = vs.vehicle_spec_id
        ORDER BY v.vehicle_id
    `);

    return result.recordset;
};

//get by id
export const getVehicleByIdServices = async (
    vehicle_id: number
): Promise<VehicleResponse | null> => {
    const db = getDbPool();

    const result = await db.request()
        .input("vehicle_id", vehicle_id)
        .query(`
            SELECT
                v.vehicle_id,
                v.vehicle_spec_id,
                v.rental_rate,
                v.availability,
                v.front_image_url,
                v.back_image_url,
                v.side_image_url,
                v.interior_image_url,

                vs.manufacturer,
                vs.model,
                vs.year,
                vs.fuel_type,
                vs.engine_capacity,
                vs.transmission,
                vs.seating_capacity,
                vs.color,
                vs.features
            FROM Vehicle v
            INNER JOIN VehicleSpecs vs 
                ON v.vehicle_spec_id = vs.vehicle_spec_id
            WHERE v.vehicle_id = @vehicle_id
        `);

    return result.recordset[0] || null;
};

//create
export const createVehicleSpecController = async (c: Context) => {
  const body = await c.req.json();
   const db = getDbPool();

  const query = `
    INSERT INTO VehicleSpec (
      manufacturer, model, year, fuel_type, engine_capacity,
      seating_capacity, transmission, color, features
    )
    OUTPUT INSERTED.vehicle_spec_id
    VALUES (
      @manufacturer, @model, @year, @fuel_type, @engine_capacity,
      @seating_capacity, @transmission, @color, @features
    )
  `;

  

  const result = await db.request()
    .input("manufacturer", body.manufacturer)
    .input("model", body.model)
    .input("year", body.year)
    .input("fuel_type", body.fuel_type)
    .input("engine_capacity", body.engine_capacity)
    .input("seating_capacity", body.seating_capacity)
    .input("transmission", body.transmission)
    .input("color", body.color)
    .input("features", body.features)
    .query(query);

  return c.json({ id: result.recordset[0].vehicle_spec_id }, 201);
};


// update
// export const updateVehicleService = async (
//     vehicle_id: number,
//     data: VehicleUpdateData
// ): Promise<string> => {

//     const db = getDbPool();

//     await db.request()
//         .input("vehicle_id", vehicle_id)
//         .input("vehicle_spec_id", data.vehicle_spec_id)
//         .input("rental_rate", data.rental_rate)
//         .input("availability", data.availability)
//         .input("front_image_url", data.front_image_url || null)
//         .input("back_image_url", data.back_image_url || null)
//         .input("side_image_url", data.side_image_url || null)
//         .input("interior_image_url", data.interior_image_url || null)
//         .query(`
//             UPDATE Vehicle
//             SET
//                 vehicle_spec_id = @vehicle_spec_id,
//                 rental_rate = @rental_rate,
//                 availability = @availability,
//                 front_image_url = @front_image_url,
//                 back_image_url = @back_image_url,
//                 side_image_url = @side_image_url,
//                 interior_image_url = @interior_image_url
//             WHERE vehicle_id = @vehicle_id
//         `);

//     return "Vehicle updated successfully";
// };

// delete
export const deleteVehicleService = async (vehicle_id: number): Promise<string> => {
    const db = getDbPool();

    const result = await db.request()
        .input("vehicle_id", vehicle_id)
        .query(`DELETE FROM Vehicle WHERE vehicle_id = @vehicle_id`);

    return result.rowsAffected[0] === 1 ? "Vehicle deleted" : "Vehicle not found";
};



export const createVehicleWithSpec = async (c: Context) => {
  const body = await c.req.json();
  const db = getDbPool();

  const { vehicle_spec, vehicle } = body;

  try {
    // Create Vehicle Specification
    const specResult = await db.request()
      .input("manufacturer", vehicle_spec.manufacturer)
      .input("model", vehicle_spec.model)
      .input("fuel_type", vehicle_spec.fuel_type)
      .input("engine_capacity", vehicle_spec.engine_capacity)
      .input("year", vehicle_spec.year)
      .input("color", vehicle_spec.color)
      .input("features", vehicle_spec.features)
      .input("transmission", vehicle_spec.transmission)
      .input("seating_capacity", vehicle_spec.seating_capacity)
      .query(`
        INSERT INTO VehicleSpecs
        (manufacturer, model, fuel_type, engine_capacity, year, color, features, transmission, seating_capacity)
        OUTPUT inserted.vehicle_spec_id
        VALUES (@manufacturer, @model, @fuel_type, @engine_capacity, @year, @color, @features, @transmission, @seating_capacity)
      `);

    const vehicle_spec_id = specResult.recordset[0].vehicle_spec_id;

    // Create Vehicle
    await db.request()
      .input("vehicle_spec_id", vehicle_spec_id)
      .input("rental_rate", vehicle.rental_rate)
      .input("availability", vehicle.availability)
      .input("front_image_url", vehicle.front_image_url)
      .input("back_image_url", vehicle.back_image_url)
      .input("side_image_url", vehicle.side_image_url)
      .input("interior_image_url", vehicle.interior_image_url)
      .query(`
        INSERT INTO Vehicle 
        (vehicle_spec_id, rental_rate, availability, front_image_url, back_image_url, side_image_url, interior_image_url)
        VALUES 
        (@vehicle_spec_id, @rental_rate, @availability, @front_image_url, @back_image_url, @side_image_url, @interior_image_url)
      `);

    return c.json({ message: "Vehicle and specs created successfully" });
  } catch (err) {
    console.log("Error creating vehicle:", err);
    return c.json({ error: "Failed to create vehicle" }, 500);
  }
};


//update
export const updateVehicleService = async (c: Context) => {
  const body = await c.req.json();
  const db = getDbPool();

  const { vehicle_spec, vehicle } = body;

  try {
    // Update Vehicle Specification
    const specResult = await db.request()
      .input("vehicle_spec_id", vehicle_spec.vehicle_spec_id)
      .input("manufacturer", vehicle_spec.manufacturer)
      .input("model", vehicle_spec.model)
      .input("fuel_type", vehicle_spec.fuel_type)
      .input("engine_capacity", vehicle_spec.engine_capacity)
      .input("year", vehicle_spec.year)
      .input("color", vehicle_spec.color)
      .input("features", vehicle_spec.features)
      .input("transmission", vehicle_spec.transmission)
      .input("seating_capacity", vehicle_spec.seating_capacity)
      .query(`
          SET NOCOUNT ON;
        
          UPDATE VehicleSpecs
          SET 
            manufacturer = @manufacturer,
            model = @model,
            fuel_type = @fuel_type,
            engine_capacity = @engine_capacity,
            year = @year,
            color = @color,
            features = @features,
            transmission = @transmission,
            seating_capacity = @seating_capacity
          OUTPUT inserted.vehicle_spec_id
          WHERE vehicle_spec_id = @vehicle_spec_id
        `);
        

    // Ensure spec updated
    const vehicle_spec_id = specResult.recordset?.[0]?.vehicle_spec_id;

    if (!vehicle_spec_id) {
      return c.json({ error: "Vehicle spec not found" }, 404);
    }

    // Update Vehicle
    const vehicleResult = await db.request()
      .input("vehicle_id", vehicle.vehicle_id)
      .input("vehicle_spec_id", vehicle_spec_id)
      .input("rental_rate", vehicle.rental_rate)
      .input("availability", vehicle.availability)
      .input("front_image_url", vehicle.front_image_url)
      .input("back_image_url", vehicle.back_image_url)
      .input("side_image_url", vehicle.side_image_url)
      .input("interior_image_url", vehicle.interior_image_url)
      .query(`
          SET NOCOUNT ON;
        
          UPDATE Vehicle
          SET 
            vehicle_spec_id = @vehicle_spec_id,
            rental_rate = @rental_rate,
            availability = @availability,
            front_image_url = @front_image_url,
            back_image_url = @back_image_url,
            side_image_url = @side_image_url,
            interior_image_url = @interior_image_url
          OUTPUT inserted.vehicle_id
          WHERE vehicle_id = @vehicle_id
`);
    if (!vehicleResult.recordset?.[0]) {
      return c.json({ error: "Vehicle not found" }, 404);
    }

    return c.json({ message: "Vehicle and specs updated successfully" });

  } catch (err) {
    console.log("Error updating vehicle:", err);
    return c.json({ error: "Failed to update vehicle" }, 500);
  }
};
    