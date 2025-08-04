import { Request, Response } from 'express';
import { Heading } from '../models/Heading';
import { Content } from '../models/Content';

export const getHeadings = async (req: Request, res: Response) => {
  try {
    const headings = await Heading.findAll({
      include: [
        { model: Content }
      ]
    });
    res.json(headings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch headings' });
  }
};

export const createHeading = async (req: Request, res: Response) => {
  try {
    const heading = await Heading.create(req.body);
    res.status(201).json(heading);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create heading', details: err });
  }
};
