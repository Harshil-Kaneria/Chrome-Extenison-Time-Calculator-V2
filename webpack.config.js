const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.jsx", // Change the entry file extension to .jsx
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.jsx?$/, // Change the file extension to .jsx
                use: [
                    {
                        loader: "babel-loader", // Use babel-loader for JSX
                        options: {
                            presets: ["@babel/preset-react"], // Add React preset
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: "../manifest.json" },
                { from: "icon.png", to: "../icon.png" },
            ],
        }),
        ...getHtmlPlugins(["index"]),
    ],
    resolve: {
        extensions: [".jsx", ".js"], // Update extensions to include .jsx
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
    },
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HTMLPlugin({
                title: "Time Calculator V2",
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}