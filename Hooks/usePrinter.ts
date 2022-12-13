import { useCallback, useState } from 'react'
import deviceInfoModule from 'react-native-device-info'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { NUC } from '../types'
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer'
import { calculateLength, cleanAccents, regexDate } from '../Config/utilities'
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
const tipoContribuyenteG: {[key: string]: string} = {
  '01': 'Contribuyente',
  '02': 'CF',
  '03': 'Gobierno',
  '04': 'Extranjero'
}

const taxIdentifier: {[key: string]: string} = {
  '01': 'RUC',
  '02': 'Cedula',
  '03': 'RUC',
  '04': 'Pasaporte'
}
const docs: {[key: string]: string} = {
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

const complementosGT = {
  NumeroAutorizacionDocumentoOrigen: 'Numero Autorizacion Documento Origen: ',
  SerieDocumentoOrigen: 'Serie Documento Origen: ',
  NumeroDocumentoOrigen: 'Numero Documento Origen: ',
  FechaEmisionDocumentoOrigen: 'Fecha Emision Documento Origen: ',
  MotivoAjuste: 'Motivo Ajuste: '
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
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER)
    let left = 50
    if (manufacturer === 'topwise') {
      left = 0
    }
    base64.length > 0 && await BluetoothEscposPrinter.printPic(base64, { width: 256, left })
  }, [country, logos?.logoGeneral, logos?.logoPorEstablecimiento, manufacturer])

  const printHeader = useCallback(async (json: NUC) => {
    console.log(`PRINT HEADER FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents(`${ALIGN.CENTER}
${ALIGN.CENTER}${BOLD.ON}${calculateLength({ string: json.Seller.Name })}
${ALIGN.CENTER}${BOLD.OFF}${calculateLength({ string: json.Seller.BranchInfo?.Name })}
${ALIGN.CENTER}${calculateLength({ string: json.Seller.BranchInfo?.AddressInfo?.Address })}
${lineSeparatorG}
${BOLD.ON}${ALIGN.CENTER}Documento Tributario Electronico${BOLD.OFF}
`),
      PA:
cleanAccents(`${ALIGN.CENTER}${BOLD.ON}${calculateLength({ string: `${json?.Seller?.Name || ''}` })}
RUC. ${json?.Seller?.TaxID} DV. ${json?.Seller?.TaxIDAdditionalInfo?.[0]?.Value}
${ALIGN.CENTER}${calculateLength({ string: `${json?.Seller?.BranchInfo?.AddressInfo?.City}, ${json?.Seller?.BranchInfo?.AddressInfo?.District}, ${json?.Seller?.BranchInfo?.AddressInfo?.State}` })}
${lineSeparatorG}
${ALIGN.CENTER}${BOLD.ON}${calculateLength({ string: `${docs?.[json?.Header?.DocType || '']?.toUpperCase()}` })}
${ALIGN.CENTER}${BOLD.OFF}Comprobante Auxiliar de Factura Electronica\x0D\x20
`)
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [country, manufacturer, model])

  const printDocInfo = useCallback(async (json: NUC) => {
    console.log(`PRINT DOC INFO FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents(`${lineSeparatorG}
${ALIGN.CENTER}${BOLD.ON}${json.Header.DocType}
${ALIGN.LEFT}${calculateLength({ string: `${BOLD.ON}Numero de Serie: ${BOLD.OFF}${json.AdditionalDocumentInfo.Serie}` })}
${calculateLength({ string: `${BOLD.ON}Numero de Autorizacion: ${BOLD.OFF}${json.AdditionalDocumentInfo.NumeroAutorizacion}` })}
${calculateLength({ string: `${BOLD.ON}Numero de Documento: ${BOLD.OFF}${json.AdditionalDocumentInfo.Numero}` })}
${calculateLength({ string: `${BOLD.ON}Fecha y Hora de Emision: ${BOLD.OFF}${regexDate(json?.AdditionalDocumentInfo?.FechaEmi || '--/--/--')}` })}
${calculateLength({ string: `${BOLD.ON}Fecha y Hora de Certificacion: ${BOLD.OFF}${regexDate(json?.AdditionalDocumentInfo?.FechaCert || '--/--/--')}` })}

`),
      PA: cleanAccents(`${lineSeparatorG}
${ALIGN.LEFT}${BOLD.ON}Serie: ${BOLD.OFF}${json?.Header?.AdditionalIssueDocInfo?.find(item => item.Name === 'CodigoSeguridad')?.Value}
${BOLD.ON}Numero: ${BOLD.OFF}${json?.Header?.AdditionalIssueDocInfo?.find(item => item.Name === 'NumeroDF')?.Value}
${BOLD.ON}${BOLD.OFF}${calculateLength({ string: `${BOLD.ON}Fecha de Emision:${BOLD.OFF} ${regexDate(json?.AdditionalDocumentInfo?.FechaEmi || '--/--/--')}` })}
${BOLD.ON}${BOLD.OFF}${calculateLength({ string: `${BOLD.ON}Fecha de Certificacion:${BOLD.OFF} ${regexDate(json?.AdditionalDocumentInfo?.FechaCert || '--/--/--')}` })}
`)
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [country, manufacturer, model])

  const printClientInfo = useCallback(async (json: NUC) => {
    const tc = json?.Buyer?.TaxIDAdditionalInfo?.[0]?.Value
    const taxID = tc === '01' || tc === '03' ? json?.Buyer?.TaxID : tc === '04' ? json?.Buyer?.TaxIDAdditionalInfo?.find(e => e.Name === 'NumPasaporte')?.Value : json?.Buyer?.TaxIDAdditionalInfo?.find(e => e.Name === 'CedulaCF')?.Value || 'CF'
    console.log(`PRINT CLIENT FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents(`${lineSeparatorG}
${ALIGN.CENTER}${BOLD.ON}Datos Cliente
${ALIGN.LEFT}${calculateLength({ string: `${BOLD.ON}NIT: ${BOLD.OFF}${json.Buyer.TaxID}` })}
${ALIGN.LEFT}${calculateLength({ string: `${BOLD.ON}Nombre: ${BOLD.OFF}${json.Buyer.Name}` })}
${ALIGN.LEFT}${calculateLength({ string: `${BOLD.ON}Direccion: ${BOLD.OFF}${json.Buyer.AddressInfo?.Address}` })}

`),
      PA: cleanAccents(`${lineSeparatorG}
${ALIGN.CENTER}${BOLD.ON}Datos Cliente
${ALIGN.LEFT}${BOLD.ON}Tipo: ${BOLD.OFF}${tipoContribuyenteG?.[tc || '02']}
${calculateLength({ string: `${BOLD.ON}${taxIdentifier?.[tc || '01']}:${BOLD.OFF} ${taxID || 'CF'}` })}
${calculateLength({ string: `${BOLD.ON}Cliente:${BOLD.OFF} ${json?.Buyer?.Name || 'CONSUMIDOR FINAL'}` })}
${json?.Buyer?.AddressInfo?.City || json?.Buyer?.AddressInfo?.Address ? calculateLength({ string: `${BOLD.ON}Direccion:${BOLD.OFF} ${json?.Buyer?.AddressInfo?.Address ? `${json?.Buyer?.AddressInfo?.Address}` : ''}${json?.Buyer?.AddressInfo?.City ? ', ' + json?.Buyer?.AddressInfo?.City : ''}${json?.Buyer?.AddressInfo?.District ? ', ' + json?.Buyer?.AddressInfo?.District : ''}${json?.Buyer?.AddressInfo?.State ? ', ' + json?.Buyer?.AddressInfo?.State : ''}` }) : ''}
`)

    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [country, manufacturer, model])

  const printItems = useCallback(async (json: NUC) => {
    console.log(`PRINT ITEMS FOR ${country}`)
    const itemsPA = (): string => {
      let items = `${ALIGN.LEFT}`
      for (const prod of json.Items) {
        items += `${Number(prod?.Qty).toFixed(2)}  -  ${prod?.Description} X B/. ${Number(prod?.Totals?.TotalBTaxes).toFixed(2)}
Total B/. ${Number(prod?.Totals?.TotalWTaxes).toFixed(2)}
`
      }
      return items
    }
    const itemsGT = (): string => {
      let items = ''
      for (const item of json.Items) {
        items = `${ALIGN.LEFT}${BOLD.OFF}${lineSeparator}
${calculateLength({ string: `${BOLD.ON}Cant: ${BOLD.OFF}${Number(item.Qty).toFixed(3)}` })}
${calculateLength({ string: `${BOLD.ON}Descripcion: ${BOLD.OFF}${item.Description}` })}
${calculateLength({ string: `${BOLD.ON}Precio: ${BOLD.OFF}${Number(item.Price).toFixed(2)}` })}
${calculateLength({ string: `${BOLD.ON}Total: ${BOLD.OFF}${Number(item.Totals?.TotalItem).toFixed(2)}` })}
`
      }
      return items
    }
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents(`${lineSeparatorG}
${ALIGN.CENTER}${BOLD.ON}Datos de la Venta
${itemsGT()}
${lineSeparatorG}
`),
      PA: cleanAccents(`${lineSeparatorG}
${ALIGN.CENTER}${BOLD.ON}Datos de la Venta

${ALIGN.LEFT}${BOLD.ON}UND      DESCRIPCION      PRECIO${BOLD.OFF}
${lineSeparatorG}
${itemsPA()}
${lineSeparatorG}
`)
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(headers?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(headers?.[country])
    }
  }, [country, manufacturer, model])

  const printTotals = useCallback(async (json: NUC) => {
    console.log(`PRINT TOTALS FOR ${country}`)
    const totalsPA = (): string => {
      const products = json.Items
      const totals = json.Totals.GrandTotal
      const bDisc = Number(totals?.TotalBDiscounts || 0)
      const wDisc = Number(totals?.TotalWDiscounts || 0)
      let montoITBMS = 0
      let metodosPago = ''
      const payments = json.Payments || []
      for (const pay of payments) {
        if (pay.Type !== 'PLAZO') {
          const formaPago = tipoPago.find(p => p.value === pay.Type)
          metodosPago += `${formaPago?.value === '99' ? cleanAccents(pay.Description) : cleanAccents(formaPago?.label)}: B/.${Number(pay.Amount).toFixed(2)}`
        }
      }
      for (const prod of products) {
        const taxes = prod?.Taxes?.Tax || []
        for (const tax of taxes) {
          if (tax.Description === 'ITBMS') {
            montoITBMS += Number(tax.Amount)
          }
        }
      }
      return `${BOLD.ON}${ALIGN.CENTER}Totales${BOLD.OFF}

${ALIGN.LEFT}SUBTOTAL: B/.${Number(totals.TotalBTaxes).toFixed(2)}
ITBMS: B/.${Number(montoITBMS).toFixed(2)}
TOTAL: B/.${Number(totals.InvoiceTotal).toFixed(2)}
${wDisc < bDisc ? `DESCUENTO: B/.${bDisc - wDisc}` : ''}
${metodosPago}

`
    }
    const totalsGT = (): string => {
      let IVA = 0
      let ITH = 0
      let IDP = 0
      let descuento = 0
      let totalsTXT = ''
      for (const item of json.Items) {
        descuento += Number(item.Discounts || 0)
        for (const taxes of item.Taxes?.Tax || []) {
          if (taxes.Description === 'IVA') {
            IVA += Number(taxes?.Amount || 0)
          }
          if (taxes.Description === 'TURISMO HOSPEDAJE') {
            ITH += Number(taxes?.Amount || 0)
          }
          if (taxes.Description === 'PETROLEO') {
            IDP += Number(taxes?.Amount || 0)
          }
        }
      }
      totalsTXT += `${BOLD.ON}${ALIGN.CENTER}Totales
`
      totalsTXT += IDP > 0 ? `${ALIGN.LEFT}${BOLD.OFF}${IDP > 0 ? `IDP: ${IDP.toFixed(2)}\n` : ''}` : ''
      totalsTXT += ITH > 0 ? `${ALIGN.LEFT}${BOLD.OFF}${ITH > 0 ? `ITH: ${ITH.toFixed(2)}\n` : ''}` : ''
      totalsTXT += IVA > 0 ? `${ALIGN.LEFT}${BOLD.OFF}${IVA > 0 ? `IVA: ${IVA.toFixed(2)}\n` : ''}` : ''
      totalsTXT += descuento > 0 ? `${ALIGN.LEFT}${BOLD.OFF}${descuento > 0 ? `Descuento: ${descuento.toFixed(2)}` : ''}` : ''
      totalsTXT += `${ALIGN.LEFT}${BOLD.OFF}Total: ${Number(json.Totals.GrandTotal.InvoiceTotal).toFixed(2)}\n`
      totalsTXT += `
${BOLD.ON}${ALIGN.CENTER}Moneda en ${json.Header.Currency || 'GTQ'}
`
      return totalsTXT
    }
    const totales: {[key: string]: string} = {
      '': '',
      GT: totalsGT(),
      PA: totalsPA()
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(totales?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(totales?.[country])
    }
  }, [country, manufacturer, model])

  const printExtras = useCallback(async (json: NUC) => {
    console.log(`PRINT EXTRAS FOR ${country}`)
    const extrasGT = (): string => {
      let extras = `${lineSeparatorG}
`
      for (const frase of json?.Seller?.AdditionlInfo || []) {
        if (frase?.Name === 'TipoFrase') {
          extras += `${BOLD.ON}${ALIGN.CENTER}${frase?.Value}\n`
        }
      }
      for (const complemento of [json?.AdditionalDocumentInfo?.AdditionalInfo].flat()) {
        if (complemento?.Code === 'FCAMB') {
          extras += `${lineSeparatorG}
${BOLD.ON}${ALIGN.CENTER}Datos de los Abonos
`
          for (const abonos of complemento?.AditionalInfo) {
            extras += `${lineSeparator}
${calculateLength({ string: `${ALIGN.LEFT}${BOLD.ON}Abono No: ${BOLD.OFF}${abonos?.Name}` })}
${calculateLength({ string: `${BOLD.ON}Fecha del Abono: ${BOLD.OFF}${abonos?.Data}` })}
${calculateLength({ string: `${BOLD.ON}Monto: ${BOLD.OFF}${Number(abonos?.Value || 0).toFixed(2)}` })}
`
          }
        }
      }
      for (const complemento of [json?.AdditionalDocumentInfo?.AdditionalInfo].flat()) {
        if (complemento?.Code === 'NCRE' || complemento?.Code === 'NDEB') {
          extras += `${lineSeparatorG}
${BOLD.ON}${ALIGN.CENTER}Datos de la Nota
`
          for (const nota of complemento?.AditionalInfo) {
            extras += `${ALIGN.LEFT}${calculateLength({ string: `${BOLD.ON}${complementosGT?.[nota?.Name as keyof typeof complementosGT]}${BOLD.OFF}${nota?.Value}` })}\n`
          }
        }
      }
      return extras
    }
    const extras: {[key: string]: string} = {
      '': '',
      GT: extrasGT(),
      PA: cleanAccents(`${ALIGN.CENTER}${BOLD.ON}${calculateLength({ string: 'Consulte en https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE usando el CUFE:' })}
${ALIGN.CENTER}${BOLD.ON}${calculateLength({ string: `${json?.AdditionalDocumentInfo?.CUFE}` })}

`)
    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(extras?.[country], {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.printerText(extras?.[country])
    }
  }, [country, manufacturer, model])

  const printQR = useCallback(async (json: NUC) => {
    console.log(`PRINT QR FOR ${country}`)
    const QR: {[key: string]: string} = {
      '': '',
      GT: json?.AdditionalDocumentInfo?.QRCode || '',
      PA: json?.AdditionalDocumentInfo?.QRCode || ''

    }
    if (manufacturer !== 'sunmi' || model === 'd2s_lite') { // generic
      await BluetoothEscposPrinter.printText(`${lineSeparatorG}\n`, {})
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER)
      await BluetoothEscposPrinter.printQRCode(QR?.[country], 256, 1)
      await BluetoothEscposPrinter.printText('    \n', {})
    }
    if (manufacturer === 'sunmi' && model !== 'd2s_lite') { // sunmi
      SunmiPrinter.print2DCode(QR?.[country], 1, 4, 1)
    }
  }, [country, manufacturer, model])

  const printCertInfo = useCallback(async (json: NUC) => {
    console.log(`PRINT CERT INFO FOR ${country}`)
    const headers: {[key: string]: string} = {
      '': '',
      GT: cleanAccents(`${ALIGN.CENTER}${BOLD.ON}DATOS DEL CERTIFICADOR
${ALIGN.CENTER}${BOLD.ON}NIT: 77454820
${ALIGN.CENTER}${BOLD.ON}DIGIFACT SERVICIOS, S.A



`),
      PA: cleanAccents(`${ALIGN.CENTER}${BOLD.ON}DATOS DEL PAC
${ALIGN.CENTER}${BOLD.ON}DIGIFACT SERVICIOS, S.A
${ALIGN.CENTER}${BOLD.ON}155704849-2-2021



`)
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
