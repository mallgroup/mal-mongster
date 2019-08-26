import numeral from 'numeral'

numeral.localeData().delimiters.thousands = ' '

/**
 * @param number
 * @returns {string}
 */
export default (number) => {
  return numeral(number).format('0,0')
}
