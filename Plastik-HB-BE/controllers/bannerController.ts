import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { Image } from '../models/Image';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.findAll({
      include: [
        { model: Image }
      ]
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create banner', details: err });
  }
};
