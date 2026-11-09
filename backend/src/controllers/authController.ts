import type { Response } from 'express';
import { User } from '../models/User.ts';
import { hashPassword, verifyPassword } from '../utils/password.ts';
import { signToken } from '../utils/jwt.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function register(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({
      success: false,
      error: 'An account with this email already exists',
    });
    return;
  }

  const passwordHash = hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  const token = signToken({ userId: user._id.toString(), email: user.email });

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
    return;
  }

  const token = signToken({ userId: user._id.toString(), email: user.email });

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, user });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, preferences } = req.body;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (preferences) updateData.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.user!.userId, updateData, { new: true }).select(
    '-passwordHash'
  );

  res.json({ success: true, user });
}
