import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Article extends Document {
  @Prop({ required: true })
  _id: number;

  @Prop()
  COD_ART: number;

  @Prop()
  EAN: string;

  @Prop({ required: true })
  DESCRIPCION: string;

  @Prop()
  MOD: string;

  @Prop()
  MED: string;

  @Prop()
  URL_ARCHIVO: string;

  @Prop()
  MARCA_ID: number;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
