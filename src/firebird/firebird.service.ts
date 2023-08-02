import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebird from 'node-firebird';
import * as fs from 'fs';

@Injectable()
export class FirebirdService implements OnModuleInit {
  private options = {
    host: '10.16.10.16',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  onModuleInit() {
    this.listenToChanges();
  }

  listenToChanges() {
    firebird.attach(this.options, function (err, db) {
      const query = 'SELECT * FROM DB_NOTIF WHERE TABLA_ID IN (1, 214, 88)';
      setInterval(() => {
        db.query(query, [], function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            fs.readFile('log.json', function (err, data) {
              if (err) throw err;

              let logObject = {};

              try {
                logObject = JSON.parse(data.toString());
              } catch (e) {
                console.log('Error al leer el archivo log.json', e);
              }

              result.forEach((item) => {
                if (!logObject[item.DB_NOTIF_ID]) {
                  logObject[item.DB_NOTIF_ID] = [];
                }
                // Si result es un array, guardar solo el primer elemento
                const newItem = Array.isArray(result) ? result[0] : result;
                logObject[item.DB_NOTIF_ID].push(newItem);
              });

              fs.writeFile(
                'log.json',
                JSON.stringify(logObject),
                function (err) {
                  if (err) throw err;
                  console.log('Eventos guardados en log.json');
                },
              );
            });
          }
        });
      }, 100);
    });
  }
}
