import { Request, Response } from 'express';
import { Content } from '../models/Content';

export const getContents = async (req: Request, res: Response) => {
  try {
    const contents = await Content.findAll();
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contents' });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const content = await Content.create(req.body);
    res.status(201).json(content);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create content', details: err });
  }
};
