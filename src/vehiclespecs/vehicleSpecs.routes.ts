import {Hono} from 'hono'
import * as vehicleSpecControllers from './vehicleSpecs.controller.js'

const vehicleSpecRoutes = new Hono()

// Get all 
vehicleSpecRoutes.get('/vehicle',vehicleSpecControllers.getAllVehicleSpecs)

// Get by id
vehicleSpecRoutes.get('/vehicle/:vehicle_spec_id', vehicleSpecControllers.getVehicleSpecsById)

// Create 
vehicleSpecRoutes.post('/vehicle', vehicleSpecControllers.createVehicleSpecs)

// Update 
vehicleSpecRoutes.put('/vehicle/:vehicle_spec_id', vehicleSpecControllers.updateVehicleSpecs)

// Delete 
vehicleSpecRoutes.delete('/vehicle/:vehicle_spec_id', vehicleSpecControllers.deleteVehicleSpecs)

export default vehicleSpecRoutes