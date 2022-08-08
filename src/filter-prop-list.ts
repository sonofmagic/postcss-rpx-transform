/* eslint-disable no-useless-escape */
export function exact (list: string[]) {
  return list.filter((m) => {
    return m.match(/^[^\*\!]+$/)
  })
}

export function contain (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^\*.+\*$/)
    })
    .map(function (m) {
      return m.slice(1, m.length - 1)
    })
}

export function endWith (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^\*[^\*]+$/)
    })
    .map(function (m) {
      return m.slice(1)
    })
}
export function startWith (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^[^\*\!]+\*$/)
    })
    .map(function (m) {
      return m.slice(0, m.length - 1)
    })
}
export function notExact (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^\![^\*].*$/)
    })
    .map(function (m) {
      return m.slice(1)
    })
}
export function notContain (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^\!\*.+\*$/)
    })
    .map(function (m) {
      return m.slice(2, m.length - 1)
    })
}
export function notEndWith (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^\!\*[^\*]+$/)
    })
    .map(function (m) {
      return m.slice(2)
    })
}
export function notStartWith (list: string[]) {
  return list
    .filter(function (m) {
      return m.match(/^\![^\*]+\*$/)
    })
    .map(function (m) {
      return m.slice(1, m.length - 1)
    })
}
