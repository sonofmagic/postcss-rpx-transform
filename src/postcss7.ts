import postcss from 'postcss7'
import pxRegex from './pixel-unit-regex'
import type { UserDefinedOptions } from './type'
import {
  createPropListMatcher,
  createPxReplace,
  blacklistedSelector,
  declarationExists,
  getConfig
} from './shared'
export default postcss.plugin(
  'postcss-rpx-transform',
  function (options: UserDefinedOptions = {}) {
    const transUnits = ['rpx']

    const opts = getConfig(options)

    const pxRgx = pxRegex(transUnits)

    const satisfyPropList = createPropListMatcher(opts.propList)

    return function (css) {
      const pxReplace = createPxReplace(
        opts.rootValue,
        opts.unitPrecision,
        opts.minValue,
        opts.transformUnit
      )(css.source.input)

      for (let i = 0; i < css.nodes.length; i++) {
        if (css.nodes[i].type === 'comment') {
          if (css.nodes[i].text === 'postcss-rpx-transform disable') {
            return
          } else {
            break
          }
        }
      }

      css.walkDecls(function (decl, i) {
        // This should be the fastest test and will remove most declarations
        if (decl.value.indexOf('rpx') === -1) return

        if (!satisfyPropList(decl.prop)) return

        if (blacklistedSelector(opts.selectorBlackList, decl.parent.selector)) {
          return
        }

        const value = decl.value.replace(pxRgx, pxReplace)

        // if rem unit already exists, do not add or replace
        if (declarationExists(decl.parent, decl.prop, value)) return

        if (opts.replace) {
          decl.value = value
        } else {
          decl.parent.insertAfter(i, decl.clone({ value }))
        }
      })

      if (opts.mediaQuery) {
        css.walkAtRules('media', function (rule) {
          if (rule.params.indexOf('rpx') === -1) return
          rule.params = rule.params.replace(pxRgx, pxReplace)
        })
      }
    }
  }
)
