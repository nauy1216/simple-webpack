const Tapable = require('tapable');
const NormalModule = require('./NormalModule');
const async = require('async');
const path = require('path');

class NormalModuleFactory extends Tapable {
    constructor(props) {
        super(props);
        const {context, resolver, parser, options} = props;
        this.resolver = resolver;
        this.parser = parser;
        this.options = options;
        this.context = context;
    }

    create(context, dependency, callback) { // 调用create加载指定模块
        debugger
        const request = dependency.request; // require的模块地址
        const {resolver} = this;    
        const loader = request.split('!'); // 内联loader
        const req = loader.pop(); // 请求的实际地址
        context = context || this.context;
        this.applyPluginsAsyncWaterfall('before-resolve', {}, () => { // 在resolve一个模块之前会触发before-resolve事件
            const contextInfo = {
                issuer: ''
            };
            async.parallel([
                (callback) => {
                    this.requestResolverArray(context, loader, resolver, callback)
                },
                (callback) => {
                    resolver.normal.resolve({}, context, req, function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, result)
                        }
                    });
                },
            ], (err, result) => {
                let loaders = result[0];
                const resource = result[1];

                const preLoader = this.split(resource);
                const splittedResource = resource.split('?');
                const _resource = splittedResource && splittedResource[0];
                this.requestResolverArray(context, preLoader, resolver, (err, res) => {
                    if (!err) {
                        loaders = loaders.concat(res);
                        const module = new NormalModule({
                            parser: this.parser,
                            request: _resource,
                            loaders,
                            rawRequest: req,
                            fileName: path.basename(_resource)
                        });
                        callback(module)
                    }
                });

            })
        })
    }

    split(resource) {
        let loaders = [];
        this.options.module.rules.forEach(rule => {
            const {test, use} = rule;
            if (test.test(resource)) {
                loaders = loaders.concat(use.split('!'));
            }
        });
        return loaders;
    }

    requestResolverArray(context, array, resolver, callback) {
        if (array.length === 0) {
            callback(null, []);
            return;
        }
        async.map(array, function (item, callback) {
            resolver.loader.resolve({}, context, item, callback);
        }, callback)
    }
}

module.exports = NormalModuleFactory;
