import { Request, Response } from 'express';
import { Paragraph } from '../models/Paragraph';
import { Content } from '../models/Content';

export const getParagraphs = async (req: Request, res: Response) => {
  try {
    const paragraphs = await Paragraph.findAll({
      include: [
        { model: Content }
      ]
    });
    res.json(paragraphs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch paragraphs' });
  }
};

export const createParagraph = async (req: Request, res: Response) => {
  try {
    const paragraph = await Paragraph.create(req.body);
    res.status(201).json(paragraph);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create paragraph', details: err });
  }
};
