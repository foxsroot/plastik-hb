import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import config from '../Plastik-HB-BE/config/config.json';
import { Dialect } from 'sequelize';

const app = express();

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(express.json());


const sequelize = new Sequelize({
    ...config.development,
    dialect: config.development.dialect as Dialect, // Cast dialect to Dialect type
    models: [],
});