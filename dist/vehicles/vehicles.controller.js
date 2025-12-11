import {} from "hono";
import * as vehicleServices from "./vehicles.service.js";
// get all
export const getAllVehicles = async (c) => {
    try {
        const vehicles = await vehicleServices.getAllVehicleServices();
        if (!vehicles.length) {
            return c.json({ message: "No vehicles found" }, 404);
        }
        return c.json(vehicles, 200);
    }
    catch (error) {
        console.error("Error fetching vehicles:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};
// get by id
export const getVehicleById = async (c) => {
    const vehicle_id = parseInt(c.req.param("vehicle_id"));
    try {
        const vehicle = await vehicleServices.getVehicleByIdServices(vehicle_id);
        if (!vehicle)
            return c.json({ error: "Vehicle not found" }, 404);
        return c.json(vehicle, 200);
    }
    catch (error) {
        console.error("Error fetching vehicle:", error);
        return c.json({ error: "Failed to fetch vehicle" }, 500);
    }
};
// // create vehicle with images
// export const createVehicle = async (c: Context) => {
//   try {   
//     const body = await c.req.json() as {
//       vehicle_spec_id: number;
//       rental_rate: number;
//       availability: boolean;
//       front_image_url?: string;
//       back_image_url?: string;
//       side_image_url?: string;
//       interior_image_url?: string;
//     };
//     const result = await vehicleServices.createVehicleService(body); 
//     return c.json({ message: result }, 201);
//   } catch (error) {
//     console.error("Error creating vehicle:", error);
//     return c.json({ error: "Failed to create vehicle" }, 500);
//   }
// };
// update vehicle with images
export const updateVehicle = async (c) => {
    try {
        const vehicle_id = parseInt(c.req.param("vehicle_id"));
        // Extract request body exactly as service expects
        const body = await c.req.json();
        // Check if vehicle id in param matches what was sent in body
        if (body.vehicle.vehicle_id !== vehicle_id) {
            return c.json({ error: "Vehicle ID mismatch" }, 400);
        }
        // Check if vehicle exists
        const checkExists = await vehicleServices.getVehicleByIdServices(vehicle_id);
        if (!checkExists)
            return c.json({ error: "Vehicle not found" }, 404);
        // Call service with the body
        const result = await vehicleServices.updateVehicleService(c);
        return c.json({ message: "Vehicle and specs updated successfully" }, 200);
    }
    catch (error) {
        console.error("Error updating vehicle:", error);
        return c.json({ error: "Failed to update vehicle" }, 500);
    }
};
// delete vehicle
export const deleteVehicle = async (c) => {
    const vehicle_id = parseInt(c.req.param("vehicle_id"));
    try {
        const check = await vehicleServices.getVehicleByIdServices(vehicle_id);
        if (!check)
            return c.json({ error: "Vehicle not found" }, 404);
        const result = await vehicleServices.deleteVehicleService(vehicle_id);
        return c.json({ message: result }, 200);
    }
    catch (error) {
        console.error("Error deleting vehicle:", error);
        return c.json({ error: "Failed to delete vehicle" }, 500);
    }
};
// create vehicle with specs
export const createVehicleWithSpecs = async (c) => {
    try {
        const result = await vehicleServices.createVehicleWithSpec(c);
        return result;
    }
    catch (error) {
        console.error("Error creating vehicle with specs:", error);
        return c.json({ error: "Failed to create vehicle with specs" }, 500);
    }
};
