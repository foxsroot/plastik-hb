import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import dotenv from 'dotenv';
import authenticationRouter from './routes/authenticationRoutes';
import { errorHandler } from './utils/errorHandler';
import { User } from './models/User';
import { Analytic } from './models/Analytic';
import { Asset } from './models/Asset';
import { Page } from './models/Page';
import { Product } from './models/Product';
import { Section } from './models/Section';
import { Session } from './models/Session';
import pageRouter from './routes/pageRoutes';
import contactRouter from './routes/contactRoutes';
import productRouter from './routes/productRoutes';
import analyticRouter from './routes/analyticRoutes';
import { Category } from './models/Category';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    models: [User, Analytic, Asset, Page, Product, Section, Session, Category],
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

app.use('/api/authentication', authenticationRouter);
app.use('/api/pages', pageRouter);
app.use('/api/contact', contactRouter);
app.use('/api/products', productRouter);
app.use('/api/analytics', analyticRouter);

// ENDS HERE

// Error handling middleware

app.use(errorHandler);
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Something went wrong!' });
// });

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${port}`);
    console.log(`You can also access it at http://localhost:${port}`);
});