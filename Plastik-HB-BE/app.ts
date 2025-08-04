import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import dotenv from 'dotenv';
import { Dialect } from 'sequelize';
import { Achievement } from './models/Achievement';
import { Analytic } from './models/Analytic';
import { Banner } from './models/Banner';
import { Button } from './models/Button';
import { Content } from './models/Content';
import { Heading } from './models/Heading';
import { Page } from './models/Page';
import { Paragraph } from './models/Paragraph';
import { Product } from './models/Product';
import { ProductImage } from './models/ProductImage';
import { Session } from './models/Session';
import { Shop } from './models/Shop';
import { User } from './models/User';
import { Image } from './models/Image';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    models: [Achievement, Analytic, Banner, Button, Content, Heading, Image, Page, Paragraph, Product, ProductImage, Session, Shop, User],
});

// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully!'))
    .catch(err => {
        console.error('Database connection failed. Please check the credentials and database server:', err);
        process.exit(1);
    });

// API routes

app.get('/', (req, res) => {
  res.send('Backend is running!');
});


// ENDS HERE

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://${process.env.DB_HOST}:${port}`);
  console.log(`You can also access it at http://localhost:${port}`);
});