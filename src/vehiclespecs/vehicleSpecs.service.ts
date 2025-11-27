import { getDbPool } from "../database/configDB.js";

interface VehicleSpecsResponse {
    vehicle_spec_id: number;
    manufacturer: string;
    model: string;
    year: number;
    fuel_type: string;
    engine_capacity: string;
    transmission: string;
    seating_capacity: number;
    color: string;
    features: string;
}

// get all vehicle specs
export const getAllVehicleSpecsService = async (): Promise<VehicleSpecsResponse[]> => {
    const db = getDbPool();
    const result = await db.request().query("SELECT * FROM VehicleSpecs");
    return result.recordset;
};

// get by ID
export const getVehicleSpecsByIdService = async ( vehicle_spec_id: number ): Promise<VehicleSpecsResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_spec_id", vehicle_spec_id)
        .query("SELECT * FROM VehicleSpecs WHERE vehicle_spec_id = @vehicle_spec_id");
    return result.recordset[0] || null;
};

// create vehicle specs
export const createVehicleSpecsService = async ( manufacturer: string, model: string, year: number, fuel_type: string, engine_capacity: string, transmission: string, seating_capacity: number, color: string, features: string): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("manufacturer", manufacturer)
        .input("model", model)
        .input("year", year)
        .input("fuel_type", fuel_type)
        .input("engine_capacity", engine_capacity)
        .input("transmission", transmission)
        .input("seating_capacity", seating_capacity)
        .input("color", color)
        .input("features", features)
        .query(`INSERT INTO VehicleSpecs (manufacturer, model, year, fuel_type,engine_capacity, transmission, seating_capacity,color, features) OUTPUT INSERTED.* VALUES ( @manufacturer, @model, @year, @fuel_type, @engine_capacity, @transmission, @seating_capacity, @color, @features)`);

    return result.rowsAffected[0] === 1 ? "Vehicle specs created successfully" : "Failed to create vehicle specs";
};

// update vehicle specs
export const updateVehicleSpecsService = async ( vehicle_spec_id: number, manufacturer: string, model: string, year: number, fuel_type: string, engine_capacity: string, transmission: string, seating_capacity: number, color: string, features: string): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_spec_id", vehicle_spec_id)
        .input("manufacturer", manufacturer)
        .input("model", model)
        .input("year", year)
        .input("fuel_type", fuel_type)
        .input("engine_capacity", engine_capacity)
        .input("transmission", transmission)
        .input("seating_capacity", seating_capacity)
        .input("color", color)
        .input("features", features)
        .query(` UPDATE VehicleSpecs SET manufacturer = @manufacturer, model = @model, year = @year, fuel_type = @fuel_type, engine_capacity = @engine_capacity, transmission = @transmission, seating_capacity = @seating_capacity, color = @color, features = @features OUTPUT INSERTED.* WHERE vehicle_spec_id = @vehicle_spec_id`);

    return result.rowsAffected[0] === 1 ? "Vehicle specs updated successfully" : "Failed to update vehicle specs";
};

//delete vehicle specs
export const deleteVehicleSpecsService = async (
    vehicle_spec_id: number
): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_spec_id", vehicle_spec_id)
        .query(` DELETE FROM VehicleSpecs OUTPUT DELETED.* WHERE vehicle_spec_id = @vehicle_spec_id`);
    return result.rowsAffected[0] === 1 ? "Vehicle specs deleted successfully" : "Failed to delete vehicle specs";
};
