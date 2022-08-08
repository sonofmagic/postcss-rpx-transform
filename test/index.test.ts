import * as filterPropList from '../src/filter-prop-list'
import type { Postcss } from 'postcss'
import type { PostcssRpxTransform } from '../src/type'

let postcss: Postcss
let rpxTransform: PostcssRpxTransform

if (process.env.PostcssVersion === '7') {
  postcss = require('postcss7')
  // ../src/index.postcss7
  rpxTransform = require('../postcss7.js')
} else {
  postcss = require('postcss')
  rpxTransform = require('..')
}

const basicCSS = '.rule { font-size: 32rpx }'

describe('rpxTransform', function () {
  it('should work on the readme example', function () {
    const input = 'h1 { margin: 0 0 20rpx; }'
    const output = 'h1 { margin: 0 0 10px; }'
    const processed = postcss(rpxTransform()).process(input).css

    expect(processed).toBe(output)
  })

  it('should replace the rem unit with px', function () {
    const processed = postcss(rpxTransform()).process(basicCSS).css
    const expected = '.rule { font-size: 16px }'

    expect(processed).toBe(expected)
  })

  it('should ignore non rem properties', function () {
    const expected = '.rule { font-size: 2em }'
    const processed = postcss(rpxTransform()).process(expected).css

    expect(processed).toBe(expected)
  })

  it('should handle < 1 values and values without a leading 0', function () {
    const rules = '.rule { margin: 32rpx .03125rem -0.0125rem -.2em }'
    const expected = '.rule { margin: 16px .03125rem -0.0125rem -.2em }'
    const options = {
      propList: ['margin']
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should not add properties that already exist', function () {
    const expected = '.rule { font-size: 1rem; font-size: 32rpx; }'
    const processed = postcss(rpxTransform()).process(expected).css

    expect(processed).toBe('.rule { font-size: 1rem; font-size: 16px; }')
  })

  it('should remain unitless if 0', function () {
    const expected = '.rule { font-size: 0rem; font-size: 0; }'
    const processed = postcss(rpxTransform()).process(expected).css

    expect(processed).toBe(expected)
  })

  it('should unit be rpx', function () {
    const input =
      'h1 { margin: 0 0 20px; font-size: 32rpx; line-height: 1.2; letter-spacing: 4rpx; }'
    const output =
      'h1 { margin: 0 0 20px; font-size: 16px; line-height: 1.2; letter-spacing: 2px; }'
    const processed = postcss(
      rpxTransform({
        transformUnit: 'px'
      })
    ).process(input).css

    expect(processed).toBe(output)
  })
})

describe('value parsing', function () {
  it('should not replace values in double quotes or single quotes', function () {
    const options = {
      propList: ['*']
    }
    const rules =
      '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 32rpx; }'
    const expected =
      '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 16px; }'
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should not replace values in `url()`', function () {
    const options = {
      propList: ['*']
    }
    const rules = '.rule { background: url(1rem.jpg); font-size: 32rpx; }'
    const expected = '.rule { background: url(1rem.jpg); font-size: 16px; }'
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should not replace values with an uppercase R or REM', function () {
    const options = {
      propList: ['*']
    }
    const rules =
      '.rule { margin: 0.75rem calc(100% - 14REM); height: calc(100% - 40rpx); font-size: 12Rem; line-height: 32rpx; }'
    const expected =
      '.rule { margin: 0.75rem calc(100% - 14REM); height: calc(100% - 20px); font-size: 12Rem; line-height: 16px; }'
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('rootValue', function () {
  it('should replace using a root value of 10', function () {
    const expected = '.rule { font-size: 51.2px }'
    const options = {
      rootValue: 10
    }
    const processed = postcss(rpxTransform(options)).process(basicCSS).css

    expect(processed).toBe(expected)
  })
})

describe('unitPrecision', function () {
  it('should replace using a decimal of 2 places', function () {
    const rules = '.rule { font-size: 0.534375rpx }'
    const expected = '.rule { font-size: 0.27px }'
    const options = {
      unitPrecision: 2
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('propList', function () {
  it('should only replace properties in the prop list', function () {
    const rules =
      '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }'
    const expected =
      '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }'
    const options = {
      propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad']
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should only replace properties in the prop list with wildcard', function () {
    const rules =
      '.rule { font-size: 1rem; margin: 32rpx; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }'
    const expected =
      '.rule { font-size: 1rem; margin: 16px; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }'
    const options = {
      propList: ['*', '!margin-left', '!*padding*', '!font*']
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should replace all properties when white list is wildcard', function () {
    const rules = '.rule { margin: 1rem; font-size: 0.9375rem }'
    const expected = '.rule { margin: 1rem; font-size: 0.9375rem }'
    const options = {
      propList: ['*']
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('selectorBlackList', function () {
  it('should ignore selectors in the selector black list', function () {
    const rules = '.rule { font-size: 0.9375rem } .rule2 { font-size: 15rem }'
    const expected =
      '.rule { font-size: 0.9375rem } .rule2 { font-size: 15rem }'
    const options = {
      selectorBlackList: ['.rule2']
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should ignore every selector with `body$`', function () {
    const rules =
      'body { font-size: 1rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1rem; }'
    const expected =
      'body { font-size: 1rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1rem; }'
    const options = {
      selectorBlackList: ['body$']
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  it('should only ignore exactly `body`', function () {
    const rules =
      'body { font-size: 16rem; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }'
    const expected =
      'body { font-size: 16rem; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }'
    const options = {
      selectorBlackList: [/^body$/]
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('replace', function () {
  it('should leave fallback pixel unit with root em value', function () {
    const options = {
      replace: false
    }
    const expected = '.rule { font-size: 32rpx; font-size: 16px }'
    const processed = postcss(rpxTransform(options)).process(basicCSS).css

    expect(processed).toBe(expected)
  })
})

describe('mediaQuery', function () {
  it('should replace rem in media queries', function () {
    const rules = '@media (min-width: 3200rpx) { .rule { font-size: 32rpx } }'
    const expected = '@media (min-width: 1600px) { .rule { font-size: 16px } }'
    const options = {
      mediaQuery: true
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('minRemValue', function () {
  it('should not replace values below minRemValue', function () {
    const rules =
      '.rule { border: 0.0625rem solid #000; font-size: 32rpx; margin: 0.0625rem 16rpx; }'
    const expected =
      '.rule { border: 0.0625rem solid #000; font-size: 16px; margin: 0.0625rem 8px; }'
    const options = {
      propList: ['*'],
      minRemValue: 0.5
    }
    const processed = postcss(rpxTransform(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('filter-prop-list', function () {
  it('should find "exact" matches from propList', function () {
    const propList = [
      'font-size',
      'margin',
      '!padding',
      '*border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'font-size,margin'
    expect(filterPropList.exact(propList).join()).toBe(expected)
  })

  it('should find "contain" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      '*border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'margin,border'
    expect(filterPropList.contain(propList).join()).toBe(expected)
  })

  it('should find "start" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      'border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'border'
    expect(filterPropList.startWith(propList).join()).toBe(expected)
  })

  it('should find "end" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      'border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'y'
    expect(filterPropList.endWith(propList).join()).toBe(expected)
  })

  it('should find "not" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      'border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'padding'
    expect(filterPropList.notExact(propList).join()).toBe(expected)
  })

  it('should find "not contain" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      '!border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'font'
    expect(filterPropList.notContain(propList).join()).toBe(expected)
  })

  it('should find "not start" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      '!border*',
      '*',
      '*y',
      '!*font*'
    ]
    const expected = 'border'
    expect(filterPropList.notStartWith(propList).join()).toBe(expected)
  })

  it('should find "not end" matches from propList and reduce to string', function () {
    const propList = [
      'font-size',
      '*margin*',
      '!padding',
      '!border*',
      '*',
      '!*y',
      '!*font*'
    ]
    const expected = 'y'
    expect(filterPropList.notEndWith(propList).join()).toBe(expected)
  })
})
