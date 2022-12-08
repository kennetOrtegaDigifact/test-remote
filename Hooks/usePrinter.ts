import { useCallback } from 'react'
const ALIGN = {
  LEFT: '\x1B\x61\x30',
  CENTER: '\x1B\x61\x31',
  RIGHT: '\x1B\x61\x32'
}
const BOLD = {
  ON: '\u001BE\u0001',
  OFF: '\u001BE0'
}
const lineSeparatorG = `${BOLD.ON}--------------------------------${BOLD.OFF}`
const lineSeparator = '--------------------------------\n'
export const genericPrintingOptions = {
  encoding: 'UTF-8',
  codepage: 0,
  widthtimes: 0,
  heigthTimes: 0,
  fonttype: 0
}
const usePrinter = () => {
  const printLogo = useCallback(async () => {

  }, [])
  return {
    logo: {
      GT: printLogo,
      PA: printLogo
    }
  }
}
