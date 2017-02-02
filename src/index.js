import BaseController from './lib/base.controller';
import BaseService from './lib/base.service';
import BaseMapper from './lib/base.mapper';
import BaseModel from './lib/base.model';

import HTTPMapper from './lib/http.mapper';
import MySQLMapper from './lib/mysql.mapper';
import RedisMapper from './lib/redis.mapper';

export default {
  BaseController,
  BaseService,
  BaseMapper,
  BaseModel,
  HTTPMapper,
  MySQLMapper,
  RedisMapper
};
