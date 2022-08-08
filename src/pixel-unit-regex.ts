export default (units = ['rpx']) =>
  new RegExp(
    `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${units.join('|')})`,
    'g'
  )
