import { Request, Response } from 'express';
import { Button } from '../models/Button';
import { Content } from '../models/Content';

export const getButtons = async (req: Request, res: Response) => {
  try {
    const buttons = await Button.findAll({
      include: [
        { model: Content }
      ]
    });
    res.json(buttons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buttons' });
  }
};

export const createButton = async (req: Request, res: Response) => {
  try {
    const button = await Button.create(req.body);
    res.status(201).json(button);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create button', details: err });
  }
};
