import { Controller, Get } from '@nestjs/common';
import * as firebird from 'node-firebird';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './models/article.model';

@Controller('paljet-sync')
export class PaljetSyncController {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

  @Get('sync')
  async syncData() {
    const query =
      'SELECT ART_ID, EAN, DESCRIPCION, MOD, MED, MARCA_ID FROM ARTICULOS WHERE MARCA_ID IS NOT NULL';
    const options: firebird.Options = {
      host: 'rigelec.com.ar',
      port: 3050,
      database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
      user: 'SYSDBA',
      password: 'masterkey',
    };

    return new Promise<string>((resolve, reject) => {
      firebird.attach(options, (err, db) => {
        if (err) {
          reject(err);
          return;
        }

        db.query(query, [], async (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          let newArticleCount = 0;

          for (const item of result) {
              console.log(`Cantidad de artículos sincronizados: ${newArticleCount} de ${result.length}`);
            const existingArticle = await this.articleModel.findOne({
              ART_ID: item.ART_ID,
            });

            if (!existingArticle) {
              const newArticle = new this.articleModel({
                _id: item.ART_ID,
                EAN: item.EAN,
                DESCRIPCION: item.DESCRIPCION,
                MOD: item.MOD,
                MED: item.MED,
                MARCA_ID: item.MARCA_ID,
              });

              await newArticle.save();
              newArticleCount++;
            }
          }

          resolve(`Sincronización funcionando correctamente. Se agregaron ${newArticleCount} nuevos artículos.`);
        });
      });
    });
  }
}