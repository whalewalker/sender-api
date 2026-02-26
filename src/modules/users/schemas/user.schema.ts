import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface UserInterface extends Document {
  email: string;
  name: string;
  hashedPassword?: string;
  googleId?: string;
  plan: string;
  industry?: string;
  onboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = UserInterface;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ required: false, select: false })
  hashedPassword?: string;

  @Prop({ required: false, select: false, sparse: true, unique: true })
  googleId?: string;

  @Prop({ type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' })
  plan: string;

  @Prop({ required: false })
  industry?: string;

  @Prop({ default: false })
  onboarded: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
