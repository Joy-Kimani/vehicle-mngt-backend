import { type Context } from "hono";
import * as vehicleServices from "./vehicles.service.js";

//get all
export const getAllVehicles = async (c: Context) => {
    try {
        const vehicles = await vehicleServices.getAllVehicleServices();

        if (vehicles.length === 0) {
            return c.json({ message: "No vehicles found" }, 404);
        }

        return c.json(vehicles, 200);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};

//get by id
export const getVehicleById = async (c: Context) => {
    const vehicle_id = parseInt(c.req.param("vehicle_id"));

    try {
        const result = await vehicleServices.getVehicleByIdServices(vehicle_id);

        if (result === null) {
            return c.json({ error: "Vehicle not found" }, 404);
        }

        return c.json(result, 200);
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return c.json({ error: "Failed to fetch vehicle" }, 500);
    }
};

//create
export const createVehicle = async (c: Context) => {
    try {
        const body = await c.req.json() as {
            vehicle_spec_id: number;
            rental_rate: number;
            availability: boolean;
        };

        const result = await vehicleServices.createVehicleService(
            body.vehicle_spec_id,
            body.rental_rate,
            body.availability
        );

        if (result === "Vehicle Created Successfully") {
            return c.json({ message: result }, 201);
        }

        return c.json({ error: "Failed to create vehicle" }, 500);
    } catch (error) {
        console.error("Error creating vehicle:", error);
        return c.json({ error: "Failed to create vehicle" }, 500);
    }
};

//update
export const updateVehicle = async (c: Context) => {
    try {
        const vehicle_id = parseInt(c.req.param("vehicle_id"));

        const body = await c.req.json() as {
            vehicle_spec_id: number;
            rental_rate: number;
            availability: boolean;
        };

        // Check existence
        const checkExists = await vehicleServices.getVehicleByIdServices(vehicle_id);
        if (checkExists === null) {
            return c.json({ error: "Vehicle not found" }, 404);
        }

        const result = await vehicleServices.updateVehicleService(
            vehicle_id,
            body.vehicle_spec_id,
            body.rental_rate,
            body.availability
        );

        return c.json({ message: result }, 200);
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return c.json({ error: "Failed to update vehicle" }, 500);
    }
};

//delete
export const deleteVehicle = async (c: Context) => {
    const vehicle_id = parseInt(c.req.param("vehicle_id"));

    try {
        const check = await vehicleServices.getVehicleByIdServices(vehicle_id);
        if (check === null) {
            return c.json({ error: "Vehicle not found" }, 404);
        }

        const result = await vehicleServices.deleteVehicleService(vehicle_id);

        return c.json({ message: result }, 200);
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return c.json({ error: "Failed to delete vehicle" }, 500);
    }
};
