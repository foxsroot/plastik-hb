import { Request, Response } from 'express';
import { Achievement } from '../models/Achievement';
import { Content } from '../models/Content';

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = await Achievement.findAll({
      include: [
        { model: Content }
      ]
    });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

export const createAchievement = async (req: Request, res: Response) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json(achievement);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create achievement', details: err });
  }
};
