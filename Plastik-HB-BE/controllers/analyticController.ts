import { Request, Response } from 'express';
import { Analytic } from '../models/Analytic';
import { Button } from '../models/Button';
import { Page } from '../models/Page';
import { Product } from '../models/Product';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await Analytic.findAll({
      include: [
        { model: Button },
        { model: Page },
        { model: Product }
      ]
    });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const createAnalytic = async (req: Request, res: Response) => {
  try {
    const analytic = await Analytic.create(req.body);
    res.status(201).json(analytic);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create analytic', details: err });
  }
};
