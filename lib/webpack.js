const Compiler = require('./Compiler');
const WebpackOptionsApply = require('./WebpackOptionsApply');
const WebpackOptionsDefaulter = require('./WebpackOptionsDefaulter');
const validateSchema = require('./validateSchema');

function webpack(options) {
    // 创建编译器对象
    const compiler = new Compiler();
    // 处理options
    options = new WebpackOptionsDefaulter().process(options);
    // 编译器的上下文，
    compiler.context = options.context;
    compiler.options = options;
    new WebpackOptionsApply().process(options, compiler);
    return compiler
}

exports = module.exports = webpack;

function exportPlugins(obj, mapping) {
    Object.keys(mapping).forEach(key => {
        Object.defineProperty(obj, key, {
            configurable: false,
            enumerable: true,
            get: mapping[key],
        })
    })
}

exportPlugins(exports, {
    "SourceMapDevToolPlugin": () => require("./SourceMapDevToolPlugin"),
    "HotModuleReplacementPlugin": () => require("./HotModuleReplacementPlugin")
});

webpack.validateSchema = validateSchema;
