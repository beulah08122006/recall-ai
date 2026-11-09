import mongoose, { Schema, type Document } from 'mongoose';

export interface IRoutine extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  activity: string;
  destination?: string;
  items: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineSchema = new Schema<IRoutine>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    activity: { type: String, default: 'General' },
    destination: { type: String, default: '' },
    items: [{ type: String, required: true, trim: true }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

RoutineSchema.index({ userId: 1, name: 1 });

export const Routine = mongoose.model<IRoutine>('Routine', RoutineSchema);
