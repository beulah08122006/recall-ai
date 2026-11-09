import mongoose, { Schema, type Document } from 'mongoose';

export interface IPerson extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  contact?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

PersonSchema.index({ userId: 1, name: 1 });

export const Person = mongoose.model<IPerson>('Person', PersonSchema);
