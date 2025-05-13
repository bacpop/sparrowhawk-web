
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('@vue/cli-service')

const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
module.exports = defineConfig({
    publicPath: '/',
    transpileDependencies: true,
    configureWebpack: {
        experiments: {
            asyncWebAssembly: true,
        },

        // To fix fallback madness issue
        resolve:{
            fallback: {
                stream: require.resolve('stream-browserify'),
            }
        }
    },
    chainWebpack: (config) => {
        // rust wasm bindgen https://github.com/rustwasm/wasm-bindgen
        config
            .plugin("wasm-pack")
            .use(WasmPackPlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        crateDirectory: path.resolve(__dirname, "../rust/sparrowhawk"),
                        // args: '-t wasm64-unknown-unknown',
                        extraArgs: "--features wasm",
//                        extraArgs: "--features wasm --target wasm64-unknown-unknown",
                        outDir: path.resolve(__dirname, "./src/pkg"),
                        // forceMode: "development",
                        // forceMode: "production",
                    })
            )
            .end()
        config.module.rule("js").exclude.add(/\.worker\.js$/);
        config.module
            .rule("worker")
            .test(/\.worker\.js$/)
            .use("worker-loader")
            .loader("worker-loader")
            .end();
        config.plugin('define').tap((definitions) => {
            Object.assign(definitions[0], {
                __VUE_OPTIONS_API__: 'true',
                __VUE_PROD_DEVTOOLS__: 'false',
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
            })
            return definitions
        })
    },
})
