import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+hashedPassword').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(data: {
    email: string;
    name: string;
    hashedPassword?: string;
    googleId?: string;
    industry?: string;
  }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<UserDocument> {
    const byGoogleId = await this.userModel
      .findOne({ googleId: data.googleId })
      .select('+googleId')
      .exec();
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.userModel.findOne({ email: data.email }).exec();
    if (byEmail) {
      return this.userModel
        .findByIdAndUpdate(byEmail._id, { googleId: data.googleId }, { new: true })
        .exec() as Promise<UserDocument>;
    }

    return this.create({ email: data.email, name: data.name, googleId: data.googleId });
  }

  async markOnboarded(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { onboarded: true }, { new: true })
      .exec();
  }

  async updateIndustry(
    userId: string,
    industry: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { industry }, { new: true })
      .exec();
  }
}
