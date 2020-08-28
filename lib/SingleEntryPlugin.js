const SingleEntryDependency = require('./dependencies/SingleEntryDependency');

class SingleEntryPlugin { // 单一入口
    constructor(context, entry, name) {
        this.context = context;
        this.name = name;
        this.entry = entry;
    }

    apply(compiler) {
        compiler.plugin('compilation', function (compilation, params) { // 监听compilation事件
            const normalModuleFactory = params.normalModuleFactory;
            compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
        });

        compiler.plugin('make', (compilation, callback) => { // make事件触发后，compilation添加入口
            compilation.addEntry(this.context, new SingleEntryDependency({request: this.entry}), this.name, callback);
        })
    }
}

module.exports = SingleEntryPlugin;
