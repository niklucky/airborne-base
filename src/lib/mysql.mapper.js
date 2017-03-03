import BaseMapper from './base.mapper';
import checkInstall from './installer';

const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const DISCONNECTED = 'disconnected';
const CONNECTION_WAIT_TIMEOUT = 100; // ms
const DEFAULT_CHARSET = 'utf8';
const DEFAULT_PORT = 3306;
const DEFAULT_HOST = 'localhost';
const DEFAULT_USER = 'root';

class MySQLMapper extends BaseMapper {
  constructor(di, db, dbConfig, dbTable) {
    super(di);
    checkInstall('mysql');
    this.db = db;
    this.dbConfig = dbConfig;
    this.dbTable = dbTable;
    this.queryBuilder = null;
    this.initQueryBuilder();
  }
  initQueryBuilder() {
    if (checkInstall('mysql-qb')) {
      const MySQLQueryBuilder = require('mysql-qb');
      this.queryBuilder = new MySQLQueryBuilder();
    }
  }

  checkConnection(cb) {
    if (this.db.state === CONNECTING) {
      return setTimeout(() => {
        this.checkConnection(cb);
      }, CONNECTION_WAIT_TIMEOUT);
    }
    if (this.db.state !== undefined && this.db.state !== DISCONNECTED) {
      return cb(true);
    }
    return this.connect(cb);
  }
  connect(cb) {
    const mysql = require('mysql'); // eslint-disable-line global-require

    this.db.state = CONNECTING;

    const connection = this.dbConfig;

    if (!connection.user) {
      connection.user = DEFAULT_USER;
    }
    if (!connection.host) {
      connection.host = DEFAULT_HOST;
    }
    if (!connection.port) {
      connection.port = DEFAULT_PORT;
    }
    if (connection.charset === undefined) {
      connection.charset = DEFAULT_CHARSET;
    }

    const conn = mysql.createConnection({
      host: connection.host,
      port: connection.port,
      user: connection.user,
      password: connection.password,
      database: connection.database,
      charset: connection.charset,
    });
    conn.connect();
    conn.on('error', (err) => {
      console.log('Connection down. Reconnecting...', err);
      setTimeout(() => {
        this.connect(cb);
      }, 1000);
    });
    conn.on('connect', () => {
      cb(true);
      console.log('MySQL Connected');
    });
    this.db.state = CONNECTED;
    this.db.connection = conn;
  }
  exec(query, cb) {
    this.checkConnection(() => {
      this.db.connection.query(query, cb);
    });
  }
  query(query, cb) {
    this.exec(query, cb);
  }
  get(params) {
    if (params instanceof Object === false) {
      throw new Error('[Fatal] MySQLMapper: you have to provide params for get()');
    }
    return new Promise((resolve, reject) => {
      this.load(params).then((collection) => {
        resolve(collection[0]);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  load(params) {
    return new Promise((resolve, reject) => {
      try {
        this.queryBuilder
          .select('*')
          .from(this.dbTable);

        /* istanbul ignore else */
        if (params !== undefined) {
          this.queryBuilder.where(params);
        }
        const query = this.queryBuilder.build();
        return this.exec(query, (error, rows, fields) => {
          if (error) {
            reject(error, fields);
          }
          if (rows === undefined) {
            resolve(undefined);
          } else {
            resolve(this.buildCollection(rows));
          }
        });
      } catch (e) {
        return reject(e);
      }
    });
  }
  create(params, payload) {
    if (payload instanceof Object === false) {
      throw new Error('[Fatal] MySQLMapper: you have to provide data for create()');
    }
    return new Promise((resolve, reject) => {
      try {
        const model = new this.Model(payload);
        const data = (model.get) ? model.get() : model;
        for (const i in data) {
          if (typeof data[i] === 'string') {
            data[i] = data[i].replace(/'/g, "\\'"); // eslint-disable-line
          }
        }
        const query = this.queryBuilder.insert(this.dbTable, data).build();
        return this.exec(query, (error, result) => {
          if (error) {
            return reject(error);
          }
          data.id = result.insertId;
          for (const i in data) {
            if (typeof data[i] === 'string') {
              data[i] = data[i].replace(/\'/g, "'"); // eslint-disable-line
            }
          }
          return resolve(data);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  update(params, payload) {
    if (params instanceof Object === false) {
      throw new Error('[Fatal] MySQLMapper error: you have to provide params for update(). You cannot update whole table.');
    }
    if (payload instanceof Object === false) {
      throw new Error('[Fatal] MySQLMapper error: you have to provide payload for update(). Nothing to update.');
    }
    return new Promise((resolve, reject) => {
      try {
        const model = new this.Model(payload);
        const data = (model.get) ? model.get() : payload;
        for (const i in data) {
          if (data[i] === undefined) {
            delete data[i];
          }
        }
        const query = this.queryBuilder.update(this.dbTable, data).where(params).build();
        return this.exec(query, (error) => {
          if (error) {
            return reject(error);
          }
          return resolve(data);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  del(params) {
    if (params instanceof Object === false) {
      throw new Error('[Fatal] MySQLMapper error: you have to provide params for del(). You cannot delete the whole table.');
    }
    return new Promise((resolve, reject) => {
      try {
        const query = this.queryBuilder.delete(this.dbTable).where(params).build();
        return this.exec(query, (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export default MySQLMapper;
