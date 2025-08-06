import { Request, Response } from 'express';
import { Page } from '../models/Page';
import { Content } from '../models/Content';

export const getPages = async (req: Request, res: Response) => {
  try {
    const pages = await Page.findAll({
      include: [
        { model: Content }
      ]
    });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const page = await Page.create(req.body);
    res.status(201).json(page);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create page', details: err });
  }
};
