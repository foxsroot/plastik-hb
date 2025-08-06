import { Request, Response } from 'express';
import { ProductImage } from '../models/ProductImage';
import { Product } from '../models/Product';

export const getProductImages = async (req: Request, res: Response) => {
  try {
    const images = await ProductImage.findAll({
      include: [
        { model: Product }
      ]
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
};

export const createProductImage = async (req: Request, res: Response) => {
  try {
    const image = await ProductImage.create(req.body);
    res.status(201).json(image);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product image', details: err });
  }
};
