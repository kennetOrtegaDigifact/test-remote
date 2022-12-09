import { useCallback, useState } from 'react'
import deviceInfoModule from 'react-native-device-info'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { NUC } from '../types'
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer'
import { cleanAccents } from '../Config/utilities'
import SunmiPrinter from '@heasy/react-native-sunmi-printer'

const ALIGN = {
  LEFT: '\x1B\x61\x30',
  CENTER: '\x1B\x61\x31',
  RIGHT: '\x1B\x61\x32'
}
const BOLD = {
  ON: '\u001BE\u0001',
  OFF: '\u001BE0'
}
const tipoPago = [
  { label: 'Crédito', value: '01' },
  { label: 'Efectivo', value: '02' },
  { label: 'Tarjeta Crédito', value: '03' },
  { label: 'Tarjeta Débito', value: '04' },
  { label: 'Tarjeta Fidelización', value: '05' },
  { label: 'Vale', value: '06' },
  { label: 'Tarjeta de Regalo', value: '07' },
  { label: 'Transferencia / Depósito a cta', value: '08' },
  { label: 'Cheque', value: '09' },
  { label: 'Punto de Pago', value: '10' },
  { label: 'Otro', value: '99' }
]
const tipoContribuyente = [
  { name: 'Contribuyente', value: 1 },
  { name: 'CF', value: 2 },
  { name: 'Gobierno', value: 3 },
  { name: 'Extranjero', value: 4 }
]
const tipoContribuyenteG = {
  '01': 'Contribuyente',
  '02': 'CF',
  '03': 'Gobierno',
  '04': 'Extranjero'
}

const taxIdentifier = {
  '01': 'RUC',
  '02': 'Cedula',
  '03': 'RUC',
  '04': 'Pasaporte'
}
const docs = {
  '01': 'Factura de Operacion Interna',
  '02': 'Factura de Importacion',
  '03': 'Factura de Exportacion',
  '04': 'Nota de Credito Referente a una o Varias FE',
  '05': 'Nota de Debito Referente a una o Varias FE',
  '06': 'Nota de Credito Generica',
  '07': 'Nota de Debito Generica',
  '08': 'Nota de Zona Franca',
  '09': 'Reembolso'
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
export const usePrinter = () => {
  const { logos, country = '' } = useSelector((state: ReduxState) => state.userDB)
  const [manufacturer] = useState<string>(deviceInfoModule.getManufacturerSync().toLowerCase())
  const [model] = useState<string>(deviceInfoModule.getModel().toLowerCase())
  console.log('MODELO', model, 'MANUFACTURER', manufacturer)
  const printLogo = useCallback(async (json: NUC) => {
    console.log(`PRINT LOGO FOR ${country}`)
    const code = json?.Seller?.BranchInfo?.Code?.toString()?.length ? json?.Seller?.BranchInfo?.Code?.toString() : ''
    const base64 = logos?.logoPorEstablecimiento?.[code] ? logos?.logoPorEstablecimiento?.[code] : logos?.logoGeneral ? logos?.logoGeneral : ''
    // await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER)
    // let left = 50
    // if (manufacturer === 'topwise') {
    //   left = 0
    // }
    // base64.length > 0 && await BluetoothEscposPrinter.printPic(base64, { width: 256, left })
  }, [logos])

  const printHeader = useCallback(async (json: NUC) => {
    console.log(`PRINT HEADER FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('HEADER GT'),
      PA: cleanAccents('HEADER PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printDocInfo = useCallback(async (json: NUC) => {
    console.log(`PRINT DOC INFO FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('DOC INFO GT'),
      PA: cleanAccents('DOC INFO PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printClientInfo = useCallback(async (json: NUC) => {
    console.log(`PRINT CLIENT FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('CLIENT INFO GT'),
      PA: cleanAccents('CLIENT INFO PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printItems = useCallback(async (json: NUC) => {
    console.log(`PRINT ITEMS FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('ITEMS GT'),
      PA: cleanAccents('ITEMS PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printTotals = useCallback(async (json: NUC) => {
    console.log(`PRINT TOTALS FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('TOTALS GT'),
      PA: cleanAccents('TOTALS PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printExtras = useCallback(async (json: NUC) => {
    console.log(`PRINT EXTRAS FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('EXTRAS GT'),
      PA: cleanAccents('EXTRAS PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printQR = useCallback(async (json: NUC) => {
    console.log(`PRINT QR FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents('QR GT'),
      PA: cleanAccents('QR PA')
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  const printCertInfo = useCallback(async (json: NUC) => {
    console.log(`PRINT CERT INFO FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: `${cleanAccents('CERT INFO GT')}


      `,
      PA: `${cleanAccents('CERT INFO PA')}


      `
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [])

  return {
    logo: {
      GT: printLogo,
      PA: printLogo
    },
    header: {
      GT: printHeader,
      PA: printHeader
    },
    docInfo: {
      GT: printDocInfo,
      PA: printDocInfo
    },
    clientInfo: {
      GT: printClientInfo,
      PA: printClientInfo
    },
    items: {
      GT: printItems,
      PA: printItems
    },
    totals: {
      GT: printTotals,
      PA: printTotals
    },
    extras: {
      GT: printExtras,
      PA: printExtras
    },
    qrcode: {
      GT: printQR,
      PA: printQR
    },
    certInfo: {
      GT: printCertInfo,
      PA: printCertInfo
    }
  }
}
