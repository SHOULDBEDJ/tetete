import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  fullName: z.string().min(1),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  role: z.enum(['SuperAdmin', 'Admin', 'Staff']),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.profile.findMany({
      include: { roles: true },
      orderBy: { createdAt: 'desc' },
    });
    
    // Format to match the frontend expectations
    const formatted = users.map((u: any) => {
      const role = u.roles.length > 0 
        ? (u.roles.find((r: any) => r.role === 'SuperAdmin') 
          || u.roles.find((r: any) => r.role === 'Admin') 
          || u.roles[0]).role 
        : 'Staff';
        
      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        role
      };
    });
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  try {
    await prisma.profile.update({
      where: { id },
      data: { status },
    });
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  console.log('[Users]: Creating user', req.body);
  try {
    const { username, password, fullName, email, role } = userSchema.parse(req.body);
    
    if (!password) return res.status(400).json({ error: 'Password is required for new users' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          username,
          password: hashedPassword,
          fullName,
          email: email || null,
        },
      });
      
      await tx.userRole.create({
        data: {
          userId: profile.id,
          role,
          permissions: {}, // Default empty permissions
        },
      });
      
      return profile;
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('[Users]: Create user error', error);
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    if ((error as any).code === 'P2002') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const data = userSchema.partial().parse(req.body);
    const { role, ...profileData } = data;
    
    await prisma.$transaction(async (tx) => {
      if (Object.keys(profileData).length > 0) {
        if (profileData.password) {
          profileData.password = await bcrypt.hash(profileData.password, 10);
        }
        await tx.profile.update({
          where: { id },
          data: profileData as any,
        });
      }
      
      if (role) {
        // Update role - simpler to delete and recreate or just update the first one
        const existingRole = await tx.userRole.findFirst({ where: { userId: id } });
        if (existingRole) {
          await tx.userRole.update({
            where: { id: existingRole.id },
            data: { role },
          });
        } else {
          await tx.userRole.create({
            data: { userId: id, role, permissions: {} },
          });
        }
      }
    });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    // Check if user is trying to delete themselves (should be handled by middleware but extra check here)
    if ((req as any).user?.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.$transaction(async (tx) => {
      // Delete roles first
      await tx.userRole.deleteMany({ where: { userId: id } });
      // Delete profile
      await tx.profile.delete({ where: { id } });
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
