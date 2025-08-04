import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { ProductImage } from '../models/ProductImage';
import { Analytic } from '../models/Analytic';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductImage },
        { model: Analytic }
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product', details: err });
  }
};
