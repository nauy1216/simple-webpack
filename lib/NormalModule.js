const Module = require('./Module');
const RawSource = require('./RawSource');
const OriginalSource = require('./OriginalSource');
const ReplaceSource = require('./ReplaceSource');
const CachedSource = require('./CachedSource');
const path = require('path');

class NormalModule extends Module {
    constructor(props) {
        super(props);
        const {parser, request, loaders, fileName, rawRequest} = props;
        this.parser = parser;
        this.fileDependencies = [request];
        this.loaders = loaders; // loader 数组
        this.request = request; // 模块请求路径，带盘符的绝对路径
        this.rawRequest = rawRequest; // 在代码中rquire()的地址
        this.fileName = fileName;   // 模块名称
        this.context = request ? path.dirname(request) : null;
        this.meta = {};
        this.built = false;
    }

    doBuild(compilation,fs, callback) {
        this.built = true;
        const {request, loaders, fileName} = this;
        // 使用loaders处理
        this.runLoaders({
            context: this.context,
            request,
            loaders,
            fileName,
            fs,
        }, (err) => {
            if (!err) {

                const source = this._source;
                
                // loaders 处理完之后解析代码
                this.parser.parse(source.source(), {
                    current: this,
                    module: this,
                    compilation
                });
                callback();
            }
        })
    }

    runLoaders(options, callback) {
        const {request, fileName, loaders, fs, context} = options;
        const loadersFunction = loaders.map(loader => require(loader)); // loader地址
        const loadersArray = loaders.map(this.createLoaderObject);
        const _loadersFunction = loadersFunction.slice();
            
        console.log('使用loader处理文件 ', request)
        fs.readFile(request, (err, content) => { //读取文件内容

            const source = content.toString();

            const nextLoader = contents => {
                let async = false;
                if (_loadersFunction.length > 0) { // 如果有定义loader
                    const loaderFun = _loadersFunction.pop(); // 去最后一个loader
                    const loaderContext = {
                        fileName,
                        options,
                        loaders: loadersArray,
                        context,
                        debug: options.debug,
                        async: function () { // 异步，不执行
                            async = true;
                            return nextLoader;
                        },
                        callback: function () { // 异步， 执行
                            async = true;
                            nextLoader.apply(null, arguments)
                        }
                    };
                    const _source = loaderFun.apply(loaderContext, [contents]);
                    if (!async) { // 如果不是异步执行的loader将会执行下一个loader
                        nextLoader.apply(null, [_source]);
                    }
                } else {
                    this._source = new OriginalSource(contents, request);
                    callback()
                }
            };
            nextLoader(source);
        })
    }

    createLoaderObject(loader) {
        var obj = {
            path: loader,
            query: null,
            options: null,
            ident: null,
            pitch: null,
            raw: null,
            data: null,
            request: loader,
            pitchExecuted: false,
            normalExecuted: false,
            normal: require(loader)
        };
        return obj
    }

    //replace require&dependencies
    source(dependencyTemplates) {
        const _source = new ReplaceSource(this._source);

        function dealDependency(dependency) {
            const deal = dependencyTemplates.get(dependency.constructor);
            deal.apply(dependency, _source)
        }

        function dealRequire(req) {
            _source.replace(req[0], req[1], '__webpack_require__');
        }

        this.blocks.forEach(block => {
            const {beforeRange, afterRange, chunk} = block;
            _source.replace(beforeRange[0], beforeRange[1], `__webpack_require__.e(${chunk.id}).then(`);
            _source.replace(afterRange[0], afterRange[1], '');
            block.dependencies.forEach(dealDependency);
            block.requires.forEach(dealRequire);
        });

        this.dependencies.forEach(dealDependency);

        return new CachedSource(_source)
    }

    updateHashWithSource(hash) {
        if (!this._source) {
            hash.update('null');
            return
        }
        hash.update('source');
        this._source.updateHash(hash);
    }

    updateHashWithMeta(hash) {
        hash.update("meta");
        hash.update(JSON.stringify(this.meta));
    }

    updateHash(hash) {
        this.updateHashWithSource(hash);
        this.updateHashWithMeta(hash);
        super.updateHash(hash);
    }
}

module.exports = NormalModule;
