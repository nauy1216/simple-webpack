function HelloWorldPlugin(options) {
}

HelloWorldPlugin.prototype.apply = function (compiler) {
    debugger
    compiler.plugin('done', function (stats) {
        console.log('Hello World!');
    });
    // 
    compiler.plugin('run', function(compiler, next) {
        debugger
        next()
    })
    compiler.plugin('compile', function(compile) {
        debugger
    })
    compiler.plugin('make', function(compile) {
        debugger
    })
    compiler.plugin('this-compilation', function(compile) {
        debugger
    })
    compiler.plugin('compilation', function(compilation) {
        debugger
        compilation.plugin('record', function (compilation, records) {
            debugger
        })
        compilation.plugin('additional-chunk-assets', function () {
            debugger
        })
        compilation.mainTemplate.plugin('bootstrap', function (source, chunk, hash) {
            debugger
            return source
        });
        // compilation.mainTemplate.plugin('module-require', (_, chunk, hash, varModuleId) => {
        //     return `hotCreateRequire(${varModuleId})`
        // });
    })
};

module.exports = HelloWorldPlugin;
