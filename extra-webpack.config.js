module.exports = {
    module: {
        rules: [
            {
                test: /(\.scss|\.css)$/,
                use: [
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [require("tailwindcss")("./tailwind.config.js")]
                        }
                    }
                ]
            },
            // {
            //     test: /\.less$/,
            //     loader: 'less-loader',
            //     options: {
            //         modifyVars: { // 修改主题变量
            //             'primary-color': '#00AF66',
            //         },
            //         javascriptEnabled: true
            //     }
            // }
        ]
    }
};
