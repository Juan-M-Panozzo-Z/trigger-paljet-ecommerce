import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema()
export class Article extends Document {
    @Prop({required: true})
    _id: number;

    @Prop()
    EAN: string;

    @Prop({required: true})
    DESCRIPCION: string;

    @Prop()
    MOD: string;

    @Prop()
    MED: string;

    @Prop()
    MARCA_ID: number;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);