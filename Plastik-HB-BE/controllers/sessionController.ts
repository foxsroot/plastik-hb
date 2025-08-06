import { Request, Response } from 'express';
import { Session } from '../models/Session';

export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.findAll();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create session', details: err });
  }
};
