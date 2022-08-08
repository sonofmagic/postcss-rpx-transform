# postcss-rpx-transform

- [postcss-rpx-transform](#postcss-rpx-transform)
  - [何时使用？](#何时使用)
  - [如何使用](#如何使用)
    - [Postcss8](#postcss8)
    - [Postcss7](#postcss7)
  - [配置项](#配置项)

> 反向转化，最为致命!

`postcss-pxtransform` 的反向版本，用来反向把小程序的 `rpx` 单位，转化为 `px`，`rem`，`vw` 等单位。

let's make rpx great again! LOL

## 何时使用？

有些项目，是从小程序为主体的设计稿，来兼容app和h5这类的其他平台的，此时全局更改rpx到其他单位成本比较高，所以需要反向转化

## 如何使用

### Postcss8

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-rpx-transform')(),
  ],
}
```

### Postcss7

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-rpx-transform/postcss7')(),
  ],
}
```

## 配置项

```ts
export interface UserDefinedOptions {
  // 反向转化的基准单位，默认是32，即 32rpx = 16px = 1rem = 32/750 * 100vw
  rootValue?: number | ((input: Input) => number)
  // 四舍五入后保留小数
  unitPrecision?: number
  // 选择器黑名单，会直接跳过黑名单内的处理
  selectorBlackList?: (string | RegExp)[]
  // 处理的 css 属性列表
  propList?: string[]
  // 处理策略为直接覆盖原先 replace，还是添加覆盖 appned
  replace?: boolean
  // 是否处理媒体查询
  mediaQuery?: boolean
  // 最小值以下不处理
  minValue?: number
  // 排除指定路径不处理
  exclude?: string | RegExp | ((filePath: string) => boolean)
  // 转化的目标单位，支持 rpx2px,rpx2rem,rpx2vw
  transformUnit?: 'px' | 'rem' | 'vw'
}
// 默认值
export const defaultOptions: Required<UserDefinedOptions> = {
  // 32rpx = 16px = 1rem = 32/750 * 100vw
  rootValue: 32,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['*'],
  replace: true,
  mediaQuery: false,
  minValue: 0,
  exclude: /node_modules/i,
  transformUnit: 'px'
}
```
