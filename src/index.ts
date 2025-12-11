import { serve } from '@hono/node-server';
import { Hono, type Context } from 'hono';
import initDatabaseConnection from './database/configDB.js';
import { cors } from 'hono/cors';
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
import { swaggerUI } from '@hono/swagger-ui';
import { readFile } from 'fs/promises';


// OpenAPI Spec for Swagger UI

const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Vintage Car Rental API',
    version: '1.0.0',
    description: 'API for managing vintage car rentals',
    contact: { name: 'API Support', email: 'support@vintagecarrental.com' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' }
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    }
  },
  tags: [
    { name: 'Authentication', description: 'User authentication' },
    { name: 'Users', description: 'User management' },
    { name: 'Bookings', description: 'Booking management' },
    { name: 'Tickets', description: 'Support tickets' },
    { name: 'Payments', description: 'Payment operations' },
    { name: 'Vehicles', description: 'Vehicle management' },
    { name: 'VehicleSpecs', description: 'Vehicle specifications' },
    { name: 'Dashboard', description: 'User dashboard data' },
    { name: 'Chat', description: 'AI Chatbot' }
  ],
  paths: {
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'List of users' } }
      }
    },
    '/api/vehicles': {
      get: { tags: ['Vehicles'], summary: 'Get all vehicles', responses: { '200': { description: 'List of vehicles' } } }
    },
    '/api/bookings': {
      get: { tags: ['Bookings'], summary: 'Get all bookings', responses: { '200': { description: 'List of bookings' } } }
    },
    '/api/chat': {
      get: { tags: ['Chat'], summary: 'Check Chatbot status', responses: { '200': { description: 'Chatbot running' } } }
    }
  }
};


// Initialize Hono App

const app = new Hono();


// Middleware

app.use('*', cors());            // CORS
app.use('*', logger());          // Logging
app.use(limiter);                // Rate Limiter

// Prometheus metrics
const { printMetrics, registerMetrics } = prometheus();
app.use('*', registerMetrics);
app.get('/metrics', printMetrics);


// Default & Root Routes

app.get('/', async (c: Context) => {
  try {
    const html = await readFile('./index.html', 'utf-8');
    return c.html(html);
  } catch (err: any) {
    return c.text(err.message, 500);
  }
});
app.get('/api/chat', (c) => c.text("Car Rental AI Chatbot is running 🚗🤖"));


// Swagger UI

app.get('/doc', (c) => c.json(openApiDoc));
app.get('/api/docs', swaggerUI({ url: '/doc' }));


// Mount API Routes

app.route('/api', authRoutes);
app.route('/api', userRoutes);
app.route('/api', bookingRoutes);
app.route('/api', ticketRoutes);
app.route('/api', paymentRoutes);
app.route('/api', vehicleRoutes);
app.route('/api', vehicleSpecRoutes);
app.route('/api', dashboardRoutes);
app.route('/api/chat', chatRoute);


// 404 Handler

app.notFound((c: Context) => {
  return c.json({
    success: false,
    message: 'Route not found',
    path: c.req.path,
    method: c.req.method,
    suggestion: 'Check the API documentation at /api/docs for available endpoints'
  }, 404);
});

const port = Number(process.env.PORT) || 3000;
initDatabaseConnection()
  .then(() => {
    serve({ fetch: app.fetch, port }, (info) => {
      console.log(` Server running at http://localhost:${info.port}`);
      console.log(` Swagger Docs at http://localhost:${info.port}/api/docs`);
      console.log(` Metrics at http://localhost:${info.port}/metrics`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database connection:', error);
  });
