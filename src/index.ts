import createRpxRegex from './pixel-unit-regex'
import type { UserDefinedOptions, PostcssRpxTransform } from './type'
import {
  blacklistedSelector,
  createPropListMatcher,
  createPxReplace,
  declarationExists,
  postcssPlugin,
  getConfig
} from './shared'
const plugin: PostcssRpxTransform = (options: UserDefinedOptions = {}) => {
  const opts = getConfig(options)

  const satisfyPropList = createPropListMatcher(opts.propList)
  const exclude = opts.exclude

  let isExcludeFile = false
  let pxReplace: (m: string, $1: string) => string
  const rpxRegex = createRpxRegex(['rpx'])
  return {
    postcssPlugin,
    Once (css) {
      const source = css.source
      const filePath = source!.input.file as string
      if (
        exclude &&
        ((typeof exclude === 'function' && exclude(filePath)) ||
          (typeof exclude === 'string' && filePath.indexOf(exclude) !== -1) ||
          (exclude as RegExp).exec(filePath) !== null)
      ) {
        isExcludeFile = true
      } else {
        isExcludeFile = false
      }

      const rootValue =
        typeof opts.rootValue === 'function'
          ? opts.rootValue(source!.input)
          : opts.rootValue
      pxReplace = createPxReplace(
        rootValue,
        opts.unitPrecision,
        opts.minValue,
        opts.transformUnit
      )(css.source?.input)
    },
    Declaration (decl) {
      if (isExcludeFile) return

      if (
        decl.value.indexOf('rpx') === -1 ||
        !satisfyPropList(decl.prop) ||
        // @ts-ignore
        blacklistedSelector(opts.selectorBlackList, decl.parent!.selector)
      ) {
        return
      }

      const value = decl.value.replace(rpxRegex, pxReplace)

      // if rpx unit already exists, do not add or replace
      // @ts-ignore
      if (declarationExists(decl.parent, decl.prop, value)) return

      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value })
      }
    },
    AtRule (atRule) {
      if (isExcludeFile) return

      if (opts.mediaQuery && atRule.name === 'media') {
        if (atRule.params.indexOf('rpx') === -1) return
        atRule.params = atRule.params.replace(rpxRegex, pxReplace)
      }
    }
  }
}

plugin.postcss = true

export default plugin
