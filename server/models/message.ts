import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const messageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String, required: true },
    body: { type: String, required: true },
    /** SHA-256 of the sender's IP, kept only to rate-limit; never the IP itself. */
    ipHash: { type: String, required: true, index: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type Message = InferSchemaType<typeof messageSchema>;

// Reuse the compiled model when a warm serverless instance loads this file again.
export const MessageModel: Model<Message> =
  (mongoose.models.Message as Model<Message> | undefined) ??
  mongoose.model<Message>('Message', messageSchema);
