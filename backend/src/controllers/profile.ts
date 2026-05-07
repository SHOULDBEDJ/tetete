import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    const role = profile.roles.length > 0 ? profile.roles[0].role : 'Staff';
    
    res.json({
      id: profile.id,
      username: profile.username,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      status: profile.status,
      role,
      createdAt: profile.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { fullName, email, password, avatarUrl } = req.body;
  
  try {
    const data: any = {};
    if (fullName) data.fullName = fullName;
    if (email) data.email = email;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    
    const profile = await prisma.profile.update({
      where: { id: userId },
      data,
    });
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
