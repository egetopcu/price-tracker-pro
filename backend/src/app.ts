import express from 'express';
import priceRoutes from './routes/prices.js';
import productRoutes from './routes/products.js';

export const app = express();
app.use(express.json());

app.use('/products', productRoutes);
app.use('/prices', priceRoutes);