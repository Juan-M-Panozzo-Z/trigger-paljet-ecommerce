import { Injectable } from '@nestjs/common';
import * as firebird from 'node-firebird';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './models/article.model';
import { ListPrice } from './models/listPrice.model';
import { Stock } from './models/stock.model';

@Injectable()
export class PaljetSyncService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(ListPrice.name)
    private readonly listPriceModel: Model<ListPrice>,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>,
  ) {}

  options: firebird.Options = {
    host: 'rigelec.com.ar',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  async syncArticles() {
    // Lógica para sincronizar artículos
  }

  async syncPriceList() {
    // Lógica para sincronizar lista de precios
  }

  async syncStock() {
    // Lógica para sincronizar stock
  }

  async getStockCount() {
    // Lógica para obtener el conteo de stock
  }
}
