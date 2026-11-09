import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: mongoose.Types.ObjectId;
  sender: 'user' | 'assistant';
  text: string;
  sources?: {
    type: string;
    id?: string;
    title: string;
    detail?: string;
  }[];
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    sources: [
      {
        type: { type: String, required: true },
        id: { type: String },
        title: { type: String, required: true },
        detail: { type: String },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ChatMessageSchema.index({ userId: 1, createdAt: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
