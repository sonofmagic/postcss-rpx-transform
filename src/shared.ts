import * as filterPropList from './filter-prop-list'
import type { UserDefinedOptions } from './type'
import defu from 'defu'
import { defaultOptions } from './defaults'

export const postcssPlugin = 'postcss-rpx-transform'

export function getConfig (options: UserDefinedOptions) {
  if (typeof options === 'undefined') {
    throw new Error(`${postcssPlugin} plugin does not have the correct options`)
  }
  return defu<UserDefinedOptions, Required<UserDefinedOptions>>(
    options,
    defaultOptions
  )
}

export function toFixed (number: number, precision: number) {
  const multiplier = Math.pow(10, precision + 1)
  const wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

export function declarationExists (decls, prop, value) {
  return decls.some(function (decl) {
    return decl.prop === prop && decl.value === value
  })
}

export function blacklistedSelector (blacklist, selector) {
  if (typeof selector !== 'string') return
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1
    return selector.match(regex)
  })
}

export function createPropListMatcher (propList) {
  const hasWild = propList.indexOf('*') > -1
  const matchAll = hasWild && propList.length === 1
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  }
  return function (prop) {
    if (matchAll) return true
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function (m) {
          return prop.indexOf(m) > -1
        }) ||
        lists.startWith.some(function (m) {
          return prop.indexOf(m) === 0
        }) ||
        lists.endWith.some(function (m) {
          return prop.indexOf(m) === prop.length - m.length
        })) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function (m) {
          return prop.indexOf(m) > -1
        }) ||
        lists.notStartWith.some(function (m) {
          return prop.indexOf(m) === 0
        }) ||
        lists.notEndWith.some(function (m) {
          return prop.indexOf(m) === prop.length - m.length
        })
      )
    )
  }
}

export function getTransformDivider (
  rootValue: number,
  transformUnit: 'px' | 'rem' | 'vw' | string
) {
  switch (transformUnit) {
    case 'px':
      return rootValue / 16
    case 'rem':
      return rootValue
    case 'vw':
      return (rootValue * 7.5) / 32
    default:
      throw new Error(`Unknown transform unit: ${transformUnit}`)
  }
}

export function createPxReplace (
  rootValue,
  unitPrecision,
  minPixelValue,
  transformUnit = 'px'
): (input) => (m: string, $1: string) => string {
  return function (input) {
    return function (m, $1) {
      if (!$1) return m
      const pixels = parseFloat($1)
      if (pixels < minPixelValue) return m
      let fixedVal
      if (typeof rootValue === 'function') {
        fixedVal = toFixed(
          pixels / getTransformDivider(rootValue(input, m, $1), transformUnit),
          unitPrecision
        )
      } else {
        fixedVal = toFixed(
          pixels / getTransformDivider(rootValue, transformUnit),
          unitPrecision
        )
      }
      return fixedVal === 0 ? '0' : fixedVal + transformUnit
    }
  }
}
