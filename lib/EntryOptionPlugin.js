const SingleEntryPlugin = require('./SingleEntryPlugin');
const MultiEntryPlugin = require('./MultiEntryPlugin');
const { console } = require('node-libs-browser');

function itemToPlugin(context, entry, name) {
    if (Array.isArray(entry)) {
        return new MultiEntryPlugin({context, name, dependencies: entry})
    }
    return new SingleEntryPlugin(context, entry, name)
}

function EntryOptionPlugin() {

}

EntryOptionPlugin.prototype.apply = function (compiler) {
    compiler.plugin("entry-option", function (context, entry) {
        // 处理入口
        if (typeof entry === 'string') {
            // 如果entry只是一个字符串，则入口名默认为main
            compiler.apply(itemToPlugin(context, entry, 'main'))
        } else if (typeof entry === 'object') {
            // 如果定义的是一个对象， 则可能是多入口
            Object.keys(entry).forEach(name => {
                const entryPath = entry[name];
                compiler.apply(itemToPlugin(context, entryPath, name))
            });
        }
    })
};


module.exports = EntryOptionPlugin;
