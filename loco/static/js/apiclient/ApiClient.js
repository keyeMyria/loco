import superagent from 'superagent';
import cookie from 'react-cookie'

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
    this._pendingRequests = {}

    Object.keys(hosts).forEach((host) => {
      this[host] = {};
      methods.forEach((method) =>
        this[host][method] = (path, { params, data, json, form,cancelPrevious } = {}) => new Promise((resolve, reject) => {
          var request;
          try{
            var request = superagent[method](formatUrl(host, path)).buffer(true);
          } catch(err){
            var request = superagent[method](formatUrl(host, path));
          }

          if (params) {
            request.query(params);
          }

          var csrftoken = cookie.load("csrftoken");
          request.set('X-CSRFToken', csrftoken);

          if (data) {
            request.send(data);
          }else if(json){
            request.send(json).set('Content-Type', 'application/json');
          }else if(form){
            Object.keys(form).forEach((key) => {
              request.field(key, form[key]);
            });
          }


          var url = formatUrl(host, path)
          url = url.split("?")[0];
          this._pendingRequests[url] = this._pendingRequests[url] || []
          if(cancelPrevious){
            for(var i=0; i<this._pendingRequests[url].length; i++){
              if(this._pendingRequests[url][i]){
                this._pendingRequests[url][i]._callback = () => {}
                this._pendingRequests[url][i].abort()
                this._pendingRequests[url][i] = null
              }
            }
          }

          this._pendingRequests[url].push(
            request.end((err, res) => {
                           if(err || res == undefined)
               return err ? reject(err) : reject('{"type": "connection_error", "error": "Please check your internet connection"}');
             else
               return resolve(res.text);
                  })
          )
        })
      );
    });
  }
  empty() {}
}
