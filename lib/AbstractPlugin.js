class AbstractPlugin {
    constructor(props) {
        this._plugins = props || {};
    }

    apply(scope) {
        // 将当前对象上定义的所有插件都注册到scoped上
        Object.keys(this._plugins).forEach(key => {
            scope.plugin(key, this._plugins[key]);
        })
    }
}

module.exports = AbstractPlugin;
