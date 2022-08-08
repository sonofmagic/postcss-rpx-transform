import type { Input, PluginCreator } from 'postcss'

export interface UserDefinedOptions {
  rootValue?: number | ((input: Input) => number)
  unitPrecision?: number
  selectorBlackList?: (string | RegExp)[]
  propList?: string[]
  replace?: boolean
  mediaQuery?: boolean
  minValue?: number
  exclude?: string | RegExp | ((filePath: string) => boolean)
  // 32rpx = 16px = 1rem = 32/750 * 100vw
  transformUnit?: 'px' | 'rem' | 'vw'
}

export type PostcssRpxTransform = PluginCreator<UserDefinedOptions>
