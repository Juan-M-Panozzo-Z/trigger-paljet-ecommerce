import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ListPrice extends Document {
  @Prop({ required: true })
  _id: number;

  @Prop()
  ART_ID: number;

  @Prop()
  PC_CTO_LISTA: number;

  @Prop()
  PR_VTA: number;

  @Prop()
  PR_FINAL: number;
}

export const ListPriceSchema = SchemaFactory.createForClass(ListPrice);
