const path = require("path");

const babelLoader = {
    loader: "babel-loader",
    options: {
        presets: ["@babel/preset-env"],
        plugins: [
            // "@babel/plugin-transform-runtime",
            "@babel/plugin-syntax-dynamic-import",
            "@babel/plugin-proposal-class-properties",
        ],
    },
};

module.exports = {
    entry: {
        index: path.resolve("./lib", "eventLogger/index.js"),
    },
    output: {
        path: path.resolve("./lib/eventLogger"),
        filename: "[name].es5.js",
        clean: false,
        crossOriginLoading: "anonymous",
        // convert to es5
        // add sentry tree shaking
        module: false,
        environment: {
            arrowFunction: false,
            bigIntLiteral: false,
            const: false,
            destructuring: false,
            dynamicImport: false,
            forOf: true,
        },
        library: {
            name: "EventLogger",
            type: "var",
            export: "default",
        },
    },
    module: {
        rules: [
            {
                // Only run `.js` files through Babel
                test: /\.m?js$/,
                // exclude: /(node_modules)/,
                use: [babelLoader],
            },
        ],
    },
    mode: "production",

    // плагином сделать replace в logger html

    plugins: [
        // new webpack.DefinePlugin({
        //     __SENTRY_DEBUG__: false,
        //     __SENTRY_TRACING__: false,
        //     __RRWEB_EXCLUDE_IFRAME__: true,
        //     __RRWEB_EXCLUDE_SHADOW_DOM__: true,
        //     __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
        // }),
        // ... other plugins
    ],
};
