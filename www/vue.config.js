
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
        },

        devServer : {
            // watchOptions : {
            //     ignored : ["/node_modules/", "/../rust"],
            // },
            hot : false,
            liveReload : false,
            watchFiles : {
                paths : [],
            }
        },
    },
    chainWebpack: (config) => {
        // rust wasm bindgen https://github.com/rustwasm/wasm-bindgen
        config
            .plugin("wasm-pack_sphk")
            .use(WasmPackPlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        crateDirectory: path.resolve(__dirname, "../rust/sparrowhawk"),
                        // args: '-t wasm64-unknown-unknown',
                        // extraArgs: "--features wasm --release",
                        extraArgs: "--features wasm",
//                        extraArgs: "--features wasm --target wasm64-unknown-unknown",
                        outDir: path.resolve(__dirname, "./src/pkg"),
                        // forceMode: "development",
                        forceMode: "production",
                    })
            )
            .end()
        config
            .plugin("wasm-pack_ska")
            .use(WasmPackPlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        crateDirectory: path.resolve(__dirname, "../rust/ska.rust"),
                        // args: '-t wasm64-unknown-unknown',
//                        extraArgs: "--target wasm64-unknown-unknown",
                        outDir: path.resolve(__dirname, "./src/pkg_ska"),
                        // forceMode: "development",
                        forceMode: "production",
                    })
            )
            .end()
        config
            .plugin("wasm-pack_sketchlib")
            .use(WasmPackPlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        crateDirectory: path.resolve(__dirname, "../rust/sketchlib.rust"),
                        // args: '-t wasm64-unknown-unknown',
//                        extraArgs: "--target wasm64-unknown-unknown",
                        outDir: path.resolve(__dirname, "./src/pkg_sketchlib"),
                        // forceMode: "development",
                        forceMode: "production",
                    })
            )
            .end()
        config
            .plugin("wasm-pack_orphos-bridge")
            .use(WasmPackPlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        crateDirectory: path.resolve(__dirname, "../rust/orphos-bridge"),
                        outDir: path.resolve(__dirname, "./src/pkg_orphos-bridge"),
                        // forceMode: "development",
                        forceMode: "production",
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
