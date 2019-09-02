const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry : './dist/instagram-api-media.js',
    output: {
        filename: './instagram-api-media.min.js'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
            }),
        ],
    },
};
