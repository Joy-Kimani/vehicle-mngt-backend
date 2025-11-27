import {Hono} from 'hono'
import * as vehicleControllers from './vehicles.controller.js'

const vehicleRoutes = new Hono()

// Get all 
vehicleRoutes.get('/vehicle',vehicleControllers.getAllVehicles)

// Get by id
vehicleRoutes.get('/vehicle/:vehicle_id', vehicleControllers.getVehicleById)

// Create 
vehicleRoutes.post('/vehicle', vehicleControllers.createVehicle)

// Update 
vehicleRoutes.put('/vehicle/:vehicle_id', vehicleControllers.updateVehicle)

// Delete 
vehicleRoutes.delete('/vehicle/:vehicle_id', vehicleControllers.deleteVehicle)

export default vehicleRoutes