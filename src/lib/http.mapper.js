/* globals Promise */
import HTTP from 'http';
import QueryString from 'querystring';

import BaseMapper from './base.mapper';
import BaseModel from './base.model';

class HTTPMapper extends BaseMapper {
  constructor(di) {
    super(di);
    this.host = '127.0.0.1';
    this.port = 80;
    this.path = '';
    this.headers = {};
    this.provider = HTTP;
    this.defaultHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    this.Model = BaseModel;
  }
  get(params) {
    return this.request('GET', params);
  }
  load(params) {
    return this.request('GET', params);
  }

  create(params, postData) {
    return this.request('POST', params, postData);
  }

  update(params, putData) {
    return this.request('PUT', params, putData);
  }

  del(params) {
    return this.request('DELETE', params);
  }

  status(params) {
    return this.request('HEAD', params);
  }

  request(method, params, postData) {
    const data = QueryString.stringify(postData);
    const headers = {
      'Content-Length': Buffer.byteLength(data),
      ...this.defaultHeaders,
      ...this.headers
    };
    const options = {
      hostname: this.host,
      port: this.port,
      path: this.path + '?' + QueryString.stringify(params),
      method,
      headers
    };
    let result = '';
    return new Promise((resolve, reject) => {
      const request = this.provider.request(options, (response) => {
        // console.log(`STATUS: ${response.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          result += chunk;
        });
        response.on('end', () => {
          try {
            if (response.headers['content-type'].indexOf('json') !== -1) {
              result = JSON.parse(result);
            }
            if (response.statusCode > 199 && response.statusCode < 301) {
              resolve(this.buildCollection(result));
            } else {
              reject({ message: 'Remote server error', stack: result });
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      request.on('error', (error) => {
        reject(Error(error));
      });

      if (postData) {
        request.write(data);
      }
      request.end();
      return request;
    });
  }
}

export default HTTPMapper;
