import mongoose, { Schema, type Document } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: string;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  personId?: mongoose.Types.ObjectId;
  personName?: string;
  relatedItem?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, default: '09:00' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending', index: true },
    personId: { type: Schema.Types.ObjectId, ref: 'Person', default: null },
    personName: { type: String, default: '' },
    relatedItem: { type: String, default: '' },
  },
  { timestamps: true }
);

ReminderSchema.index({ userId: 1, status: 1, date: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
