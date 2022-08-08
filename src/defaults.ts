import type { UserDefinedOptions } from './type'

export const defaultOptions: Required<UserDefinedOptions> = {
  rootValue: 32,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
  replace: true,
  mediaQuery: false,
  minValue: 0,
  exclude: /node_modules/i,
  transformUnit: 'px'
}
