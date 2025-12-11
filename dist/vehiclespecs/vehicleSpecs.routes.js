import { Hono } from 'hono';
import * as vehicleSpecControllers from './vehicleSpecs.controller.js';
const vehicleSpecRoutes = new Hono();
// Get all 
vehicleSpecRoutes.get('/vehiclespec', vehicleSpecControllers.getAllVehicleSpecs);
// Get by id
vehicleSpecRoutes.get('/vehiclespec/:vehicle_spec_id', vehicleSpecControllers.getVehicleSpecsById);
// Create 
vehicleSpecRoutes.post('/vehiclespec', vehicleSpecControllers.createVehicleSpecs);
// Update 
vehicleSpecRoutes.put('/vehiclespec/:vehicle_spec_id', vehicleSpecControllers.updateVehicleSpecs);
// Delete 
vehicleSpecRoutes.delete('/vehiclespec/:vehicle_spec_id', vehicleSpecControllers.deleteVehicleSpecs);
export default vehicleSpecRoutes;
