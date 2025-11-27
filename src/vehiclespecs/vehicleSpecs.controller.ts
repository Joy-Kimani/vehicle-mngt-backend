import { type Context } from "hono";
import * as vehicleSpecsServices from "./vehicleSpecs.service.js";

//get all
export const getAllVehicleSpecs = async (c: Context) => {
  try {
    const specs = await vehicleSpecsServices.getAllVehicleSpecsService();
    if (specs.length === 0) {
      return c.json({ message: "No vehicle specs found" }, 404);
    }
    return c.json(specs, 200);
  } catch (error) {
    console.error("Error fetching vehicle specs:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

//get by id
export const getVehicleSpecsById = async (c: Context) => {
  const vehicle_spec_id = parseInt(c.req.param("vehicle_spec_id"));
  try {
    const result = await vehicleSpecsServices.getVehicleSpecsByIdService(vehicle_spec_id);

    if (result === null) {
      return c.json({ error: "Vehicle specs not found" }, 404);
    }
    return c.json(result, 200);
  } catch (error) {
    console.error("Error fetching vehicle specs:", error);
    return c.json({ error: "Failed to fetch vehicle specs" }, 500);
  }
};

//create
export const createVehicleSpecs = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { manufacturer, model, year, fuel_type, engine_capacity, transmission, seating_capacity, color, features} = body;

    if (!manufacturer ||!model ||!year ||!fuel_type ||!engine_capacity ||!transmission ||!seating_capacity ||!color ||!features) 
    {
      return c.json({ error: "All fields are required" }, 400);
    }
    const result = await vehicleSpecsServices.createVehicleSpecsService( manufacturer, model, year, fuel_type, engine_capacity, transmission, seating_capacity, color, features
    );
    return c.json({ message: result }, 201);
  } catch (error) {
    console.error("Error creating vehicle specs:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

//update
export const updateVehicleSpecs = async (c: Context) => {
  try {
    const vehicle_spec_id = parseInt(c.req.param("vehicle_spec_id"));
    const body = await c.req.json();

    // check if exists
    const exists = await vehicleSpecsServices.getVehicleSpecsByIdService(vehicle_spec_id);
    if (exists === null) {
      return c.json({ error: "Vehicle specs not found" }, 404);
    }
    const result = await vehicleSpecsServices.updateVehicleSpecsService(vehicle_spec_id, body.manufacturer, body.model, body.year, body.fuel_type, body.engine_capacity, body.transmission, body.seating_capacity, body.color, body.features);

    return c.json({ message: "Vehicle specs updated successfully", updated_specs: result }, 200);
  } catch (error) {
    console.error("Error updating vehicle specs:", error);
    return c.json({ error: "Failed to update vehicle specs" }, 500);
  }
};

//delete
export const deleteVehicleSpecs = async (c: Context) => {
  const vehicle_spec_id = parseInt(c.req.param("vehicle_spec_id"));
  try {
    const check = await vehicleSpecsServices.getVehicleSpecsByIdService(vehicle_spec_id);
    if (check === null) {
      return c.json({ error: "Vehicle specs not found" }, 404);
    }
    const result = await vehicleSpecsServices.deleteVehicleSpecsService(vehicle_spec_id);
    if (result === null) {
      return c.json({ error: "Failed to delete vehicle specs" }, 400);
    }
    return c.json({ message: "Vehicle specs deleted successfully", deleted_specs: result }, 200);
  } catch (error) {
    console.error("Error deleting vehicle specs:", error);
    return c.json({ error: "Failed to delete vehicle specs" }, 500);
  }
};
