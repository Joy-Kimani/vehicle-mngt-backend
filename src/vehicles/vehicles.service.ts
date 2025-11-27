import { getDbPool } from "../database/configDB.js";

interface VehicleResponse {
    vehicle_id: number;
    vehicle_spec_id: number;
    rental_rate: number;
    availability: boolean;
}

//get all
export const getAllVehicleServices = async (): Promise<VehicleResponse[]> => {
    const db = getDbPool();
    const result = await db.request()
        .query("SELECT * FROM Vehicles");
    return result.recordset;
};
//get by id 
export const getVehicleByIdServices = async (vehicle_id: number): Promise<VehicleResponse | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_id", vehicle_id)
        .query("SELECT * FROM Vehicles WHERE vehicle_id = @vehicle_id");
    return result.recordset[0] || null;
};

//create vehicle
export const createVehicleService = async (
    vehicle_spec_id: number,
    rental_rate: number,
    availability: boolean
): Promise<string> => {

    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_spec_id", vehicle_spec_id)
        .input("rental_rate", rental_rate)
        .input("availability", availability)
        .query(` INSERT INTO Vehicles (vehicle_spec_id, rental_rate, availability) OUTPUT INSERTED.* VALUES (@vehicle_spec_id, @rental_rate, @availability)`);
    return result.rowsAffected[0] === 1 ? "Vehicle Created Successfully" : "Failed to create vehicle. Try again.";
};

//update
export const updateVehicleService = async (
    vehicle_id: number,
    vehicle_spec_id: number,
    rental_rate: number,
    availability: boolean
): Promise<string> => {

    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_id", vehicle_id)
        .input("vehicle_spec_id", vehicle_spec_id)
        .input("rental_rate", rental_rate)
        .input("availability", availability)
        .query(`
            UPDATE Vehicles SET vehicle_spec_id = @vehicle_spec_id, rental_rate = @rental_rate, availability = @availability OUTPUT INSERTED.* WHERE vehicle_id = @vehicle_id`);
    return result.rowsAffected[0] === 1? "Vehicle Updated Successfully": "Failed to update vehicle. Try again.";};

//delete
export const deleteVehicleService = async (vehicle_id: number): Promise<string> => {
    const db = getDbPool();
    const result = await db.request()
        .input("vehicle_id", vehicle_id)
        .query(` DELETE FROM Vehicles  OUTPUT DELETED.* WHERE vehicle_id = @vehicle_id`);
    return result.rowsAffected[0] === 1 ? "Vehicle deleted successfully" : "Failed to delete vehicle";
};

