import { Request, Response } from 'express';
import { Shop } from '../models/Shop';

export const getShops = async (req: Request, res: Response) => {
  try {
    const shops = await Shop.findAll();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
};

export const createShop = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json(shop);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create shop', details: err });
  }
};
