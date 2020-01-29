import Moment from 'moment'

/**
 * @param duration
 * @param unit
 * @returns {number}
 */
export default (duration, unit = 'days') => {
  let now = Moment()
  let past = Moment().subtract(duration, 's')
  let diff = now.diff(past, unit)
  return diff
}
