import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop()
  DB_NOTIF_ID: number;

  @Prop()
  EMP_ID: number;

  @Prop()
  TABLA_ID: number;

  @Prop()
  CAMPO_ID: string;

  @Prop()
  TRANSACTION_ID: number;

  @Prop()
  TIPO_NOVEDAD: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
