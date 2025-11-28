import { getDbPool } from "../database/configDB.js";

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
    interior_image_url?: string;// front, back, side, interior
}
interface VehicleUpdateData {
  vehicle_spec_id: number;
  rental_rate: number;
  availability: boolean;
  front_image_url?: string;
  back_image_url?: string;
  side_image_url?: string;
  interior_image_url?: string;
}
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

                vs.model,
                vs.brand,
                vs.transmission,
                vs.fuel_type,
                vs.seating_capacity,
                vs.color,
                vs.features
            FROM Vehicle v
            INNER JOIN VehicleSpec vs 
                ON v.vehicle_spec_id = vs.vehicle_spec_id
            WHERE v.vehicle_id = @vehicle_id
        `);

    return result.recordset[0] || null;
};

//create
// Define a clear interface for the input data structure
interface VehicleCreationData {
  vehicle_spec_id: number;
  rental_rate: number;
  availability: boolean;
  front_image_url?: string;
  back_image_url?: string;
  side_image_url?: string;
  interior_image_url?: string;
}

// Function now accepts a destructured object directly
export const createVehicleService = async ({
  vehicle_spec_id,
  rental_rate,
  availability,
  front_image_url,
  back_image_url,
  side_image_url,
  interior_image_url,
}: VehicleCreationData): Promise<string> => { 

    const db = getDbPool();

    await db.request()
        .input("vehicle_spec_id", vehicle_spec_id)
        .input("rental_rate", rental_rate)
        .input("availability", availability)
        .input("front_image_url", front_image_url || null)
        .input("back_image_url", back_image_url || null)
        .input("side_image_url", side_image_url || null)
        .input("interior_image_url", interior_image_url || null)
        .query(`
            INSERT INTO Vehicle (
                vehicle_spec_id,
                rental_rate,
                availability,
                front_image_url,
                back_image_url,
                side_image_url,
                interior_image_url
            )
            VALUES (
                @vehicle_spec_id,
                @rental_rate,
                @availability,
                @front_image_url,
                @back_image_url,
                @side_image_url,
                @interior_image_url
            )
        `);

    return "Vehicle created successfully";
};

//update
export const updateVehicleService = async (
  vehicle_id: number,
  data: VehicleUpdateData 
): Promise<string> => {

    const db = getDbPool();

    await db.request()
        .input("vehicle_id", vehicle_id)
        .input("vehicle_spec_id", data.vehicle_spec_id)
        .input("rental_rate", data.rental_rate)
        .input("availability", data.availability)
        .input("front_image_url", data.front_image_url || null)
        .input("back_image_url", data.back_image_url || null)
        .input("side_image_url", data.side_image_url || null)
        .input("interior_image_url", data.interior_image_url || null)
        .query(`
            UPDATE Vehicle
            SET
                vehicle_spec_id = @vehicle_spec_id,
                rental_rate = @rental_rate,
                availability = @availability,
                front_image_url = @front_image_url,
                back_image_url = @back_image_url,
                side_image_url = @side_image_url,
                interior_image_url = @interior_image_url
            WHERE vehicle_id = @vehicle_id
        `);

    return "Vehicle updated successfully";
};
//delete
export const deleteVehicleService = async (
    vehicle_id: number
): Promise<string> => {

    const db = getDbPool();

    const result = await db.request()
        .input("vehicle_id", vehicle_id)
        .query(`DELETE FROM Vehicle WHERE vehicle_id = @vehicle_id`);

    return result.rowsAffected[0] === 1
        ? "Vehicle deleted"
        : "Vehicle not found";
};
