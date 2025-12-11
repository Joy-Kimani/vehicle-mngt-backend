import { Hono } from 'hono';
import * as vehicleControllers from './vehicles.controller.js';
const vehicleRoutes = new Hono();
// Get all 
vehicleRoutes.get('/vehicles', vehicleControllers.getAllVehicles);
// Get by id
vehicleRoutes.get('/vehicles/:vehicle_id', vehicleControllers.getVehicleById);
// Create 
//vehicleRoutes.post('/vehicles', vehicleControllers.createVehicle)
// Update 
vehicleRoutes.put('/vehicles/:vehicle_id', vehicleControllers.updateVehicle);
// Delete 
vehicleRoutes.delete('/vehicles/:vehicle_id', vehicleControllers.deleteVehicle);
//create with specs
vehicleRoutes.post('/vehicles/specs', vehicleControllers.createVehicleWithSpecs);
export default vehicleRoutes;
