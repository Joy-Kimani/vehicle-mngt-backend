import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import initDatabaseConnection from './database/configDB.js'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger';
import { prometheus } from '@hono/prometheus';
import { limiter } from './middlewares/rateLimiter.js';
import authRoutes from './auth/auth.route.js';
import bookingRoutes from './bookings/booking.route.js';
import userRoutes from './users/user.routes.js';
import ticketRoutes from './tickets/ticket.route.js';
import paymentRoutes from './payments/payment.route.js';
import vehicleRoutes from './vehicles/vehicles.route.js';
import vehicleSpecRoutes from './vehiclespecs/vehicleSpecs.routes.js';
import dashboardRoutes from './UserDashboard/dashboard.routes.js';
import chatRoute from './routes/chat.routes.js';
// import { createServer } from 'http';
// import { Server } from 'socket.io';


const app = new Hono()

//add cors
app.use('*', cors());

//Prometheus Middleware
const { printMetrics, registerMetrics } = prometheus();
app.use('*', registerMetrics);
app.get('/metrics', printMetrics);

app.use('*', logger());   // Request logging
app.use(limiter);         // Rate limiter

//default routes
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.get("/api/chat", (c) => c.text("Car Rental AI Chatbot is running 🚗🤖"));

//mount routes
app.route('/api', authRoutes)
app.route('/api',userRoutes)
app.route('/api', bookingRoutes)
app.route('/api', ticketRoutes)
app.route('/api', paymentRoutes)
app.route('/api', vehicleRoutes)
app.route('/api', vehicleSpecRoutes)
app.route('api', dashboardRoutes)

app.route("/api/chat", chatRoute);

// 404 Handler
app.notFound((c: Context) => {
  return c.json({
    success: false,
    message: 'Route not found',
    path: c.req.path
  }, 404);
});


//connect to DB
initDatabaseConnection()
  .then(() => {
    serve({
      fetch: app.fetch,
      port: 3000
    }, (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    })
  }).catch((error) => {
    console.error('Failed to initialize database connection:', error);
 
  });

