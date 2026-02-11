import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/auth.route.js'
import restaurantRouter from './routes/restaurant.route.js';
import tableRouter from './routes/table.route.js';
import reservationRouter from './routes/reservation.route.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Gursha';
const app = express();

// Middleware
app.use(express.json());

//use routes
app.use('/api/auth', authRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/tables', tableRouter);
app.use('/api/reservations', reservationRouter);

//connect to database
connectDB(MONGO_URI);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});