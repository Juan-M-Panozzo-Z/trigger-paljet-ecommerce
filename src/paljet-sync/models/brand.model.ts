import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Brand extends Document {
  @Prop({ required: true })
  _id: number;

  @Prop({ required: true })
  MARCA: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
