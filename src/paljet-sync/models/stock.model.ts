import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Stock extends Document {
  @Prop({ required: true })
  _id: number;

  @Prop({ required: true })
  ART_ID: number;

  @Prop({ required: true })
  DISPONIBLE: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
