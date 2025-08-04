import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ username, email, password: hashedPassword });
    return { message: 'User registered successfully!' };
};
