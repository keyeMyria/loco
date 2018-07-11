import superagent from 'superagent';

const hosts = {'local': ''};
const methods = ['get', 'post', 'put', 'patch', 'del'];

function formatUrl(host, path) {
  if (path.substring(0, 4) == 'http' || host == 'local')
    return path;
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  return hosts[host] + adjustedPath;
}

export default class ApiClient {
  constructor(req) {
    Object.keys(hosts).forEach((host) => {
      this[host] = {};
      methods.forEach((method) =>
        this[host][method] = (path, { params, data, json, form } = {}) => new Promise((resolve, reject) => {
          var request;
          try{
            var request = superagent[method](formatUrl(host, path)).buffer(true);
          } catch(err){
            var request = superagent[method](formatUrl(host, path));
          }

          if (params) {
            request.query(params);
          }

          if (data) {
            request.send(data);
          }else if(json){
            request.send(json).set('Content-Type', 'application/json');
          }else if(form){
            Object.keys(form).forEach((key) => {
              request.field(key, form[key]);
            });
          }

          request.end((err, res) => {
                         if(err || res == undefined)
             return err ? reject(err) : reject('{"type": "connection_error", "error": "Please check your internet connection"}');
           else
             return resolve(res.text);
                });
        })
      );
    });
  }
  empty() {}
}
