import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { comparePassword, generateToken } from '../utils/auth';

export const login = async (req: Request, res: Response) => {
  console.log('Login request received for:', req.body.username);
  const { username, password } = req.body;

  try {
    console.log('Fetching profile from database...');
    const profile = await prisma.profile.findUnique({
      where: { username },
      include: { roles: true },
    });

    if (!profile) {
      console.log('Login attempt failed: User not found:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('Comparing passwords...');
    const isValid = await comparePassword(password, profile.password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('Determining user role...');
    const list = profile.roles.map((r: any) => r.role);
    const role = list.includes('SuperAdmin') ? 'SuperAdmin' : list.includes('Admin') ? 'Admin' : 'Staff';
    console.log('Assigned role:', role);

    console.log('Generating token...');
    const token = generateToken(profile.id, role);

    console.log('Logging activity...');
    // Log the activity
    await prisma.activityLog.create({
      data: {
        module: 'Auth',
        action: 'Login',
        userId: profile.id,
        username: profile.username,
        detail: `User ${profile.username} logged in successfully`,
      }
    }).catch((err) => {
        console.error('Activity log failed:', err.message);
    });

    console.log('Sending response...');
    res.json({
      token,
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.fullName,
        email: profile.email,
        role,
      },
    });
  } catch (error: any) {
    console.error('CRITICAL LOGIN ERROR:', error);
    res.status(500).json({ 
        error: 'Login failed', 
        message: error.message,
        stack: error.stack 
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    res.json(profile);
  } catch (error: any) {
    console.error('FETCH PROFILE ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
