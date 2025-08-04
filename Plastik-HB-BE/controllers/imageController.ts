import { Request, Response } from 'express';
import { Image } from '../models/Image';
import { Content } from '../models/Content';

export const getImages = async (req: Request, res: Response) => {
  try {
    const images = await Image.findAll({
      include: [
        { model: Content }
      ]
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

export const createImage = async (req: Request, res: Response) => {
  try {
    const image = await Image.create(req.body);
    res.status(201).json(image);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create image', details: err });
  }
};
