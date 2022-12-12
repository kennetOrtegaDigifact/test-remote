import { Establecimiento } from '../types'

/**
 * It takes a string, splits it into an array, then maps over the array, and returns an array of
 * objects
 * @returns An array of objects.
 */
export const establecimientosSpliter = ({ establecimientos = '' }: {establecimientos: string}): Establecimiento[] => {
  const est = typeof establecimientos === 'string'
    ? establecimientos?.split('|')?.map(e => {
      if (typeof e === 'string') {
        if (e.length > 0) {
          const obj: Establecimiento = {
            id: '',
            codPostal: '1010',
            departamento: '',
            direccion: '',
            estado: '',
            municipio: '',
            nombre: '',
            numero: 0,
            pais: ''
          }
          const et = e.trim()
          const index = et.indexOf('<') + 1
          const secondIndex = et.indexOf('<', index) + 1
          obj.numero = Number(e.slice(0, index).replace(/</gi, '').trim())
          obj.nombre = e.slice(index, secondIndex).replace(/</gi, '').trim()
          obj.granted = false
          return obj
        }
      }
      return []
    })
    : []
  return est.flat()
}

export const deletePadLeft = (nit:string): string => {
  let regexNit = nit.toString().replace(/[^0-9Kk]/g, '').replace('k', 'K').replace('-', '').replace('/', '').trim()
  while (regexNit.charAt(0) === '0') {
    regexNit = regexNit.substring(1)
  }
  return regexNit
}

export const numberFormater = ({
  number = 0,
  toFixed = false,
  fixedDecimal = 2,
  prefix = ''
}: {
  number: number
  toFixed?: boolean
  fixedDecimal?: number
  prefix?: string
}): string => {
  try {
    if (!isNaN(number)) {
      return `${prefix?.length ? prefix : ''}${number.toFixed(toFixed ? fixedDecimal : 0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
    } else {
      console.log('ERROR NUMBER GIVEN IN NUMBER FORMATER IS NAN')
      return '0'
    }
  } catch (ex) {
    console.log('EXCEPTION IN NUMBER FORMATER UTILITIE', ex)
    return '0'
  }
}

/**
 * It takes a string, trims it, removes underscores, removes the word "API", removes the word
 * "INDIVIDUAL", removes the word "BATCH", splits the string into an array, and returns the first
 * element of the array.
 * @param  - {usuario: string}
 * @returns The first element of the array.
 */
export const cleanUserName = ({ usuario = '' }: {usuario: string}): string => {
  const userRegex = usuario.trim().replace('_', '').replace('API', '').replace('INDIVIDUAL', '').replace('BATCH', '').replace('TRANSFORMER', '').replace('_', '').split('.')
  const length: {[key: number]: number} = {
    1: 0,
    2: 0,
    3: 2
  }
  return userRegex[length[userRegex.length]]
}
/**
 * It takes a string and replaces all the special characters with their normal characters.
 * </code>
 * @param {string} [string2clean] - The string to be cleaned.
 * @returns A function that takes a string and returns a string.
 */

export const regexSpecialChars = (string2clean?: string): string => {
  if (string2clean) {
    let stringClean = string2clean.replace(/Ã/g, 'Ñ')
    stringClean = stringClean.replace(/Ã¡/g, 'á')
    stringClean = stringClean.replace(/Ã/g, 'Á')
    stringClean = stringClean.replace(/Ã©/g, 'é')
    stringClean = stringClean.replace(/Ã/g, 'É')
    stringClean = stringClean.replace(/Ã­/g, 'í')
    stringClean = stringClean.replace(/Ã/g, 'Í')
    stringClean = stringClean.replace(/Ã³/g, 'ó')
    stringClean = stringClean.replace(/Ã/g, 'Ó')
    stringClean = stringClean.replace(/Ãº/g, 'ú')
    stringClean = stringClean.replace(/Ã/g, 'Ú')
    stringClean = stringClean.replace(/Ã±/g, 'ñ')
    return stringClean
  }
  return ''
}

/**
 * It replaces all the special characters in a string with their HTML code
 * @param {string} [string2clean] - The string to be cleaned.
 * @returns A function that takes a string and returns a string.
 */
export const invertRegexSpecialChars = (string2clean?: string): string => {
  if (string2clean) {
    let stringClean = string2clean.replace(/¨Ñ/g, 'Ã')
    stringClean = stringClean.replace(/á/g, 'Ã¡')
    stringClean = stringClean.replace(/Á/g, 'Ã')
    stringClean = stringClean.replace(/é/g, 'Ã©')
    stringClean = stringClean.replace(/É/g, 'Ã')
    stringClean = stringClean.replace(/í/g, 'Ã')
    stringClean = stringClean.replace(/Í/g, 'Ã')
    stringClean = stringClean.replace(/ó/g, 'Ã³')
    stringClean = stringClean.replace(/Ó/g, 'Ã')
    stringClean = stringClean.replace(/ú/g, 'Ãº')
    stringClean = stringClean.replace(/Ú/g, 'Ã')
    stringClean = stringClean.replace(/ñ/g, 'Ã±')
    return stringClean
  }
  return ''
}

export const regexNIT = ({ nit = '' }): string => {
  try {
    const regexNit = /[^0-9KkCcFf]/g
    return nit?.toString().replace(regexNit, '').replace('k', 'K').replace('-', '').replace('/', '')
  } catch (ex) {
    console.log('REGEX NIT UTILITIE EXCEPTION', ex)
    return ''
  }
}

export const validarNIT = (nit2?: string): boolean => {
  const nit = regexNIT({ nit: nit2 })
  if (nit.toUpperCase() === 'CF' || nit === '123456') {
    return true
  }
  try {
    if (nit.length && nit?.toString() !== '0') {
      let pos = nit.indexOf('-')
      pos = nit.length - 1
      const Correlativo = nit.substring(0, pos)
      const DigitoVerificador = nit.substring(pos, nit.length)
      let Factor = Correlativo.length + 1
      let Suma = 0
      let Valor = 0
      let cont = 1
      for (let x = 0; x <= pos - 1; x++) {
        Valor = parseInt(nit.substring(x, cont))
        Suma = Suma + (Valor * Factor)
        Factor = Factor - 1
        cont++
      }
      const xMOd11 = (11 - (Suma % 11)) % 11
      const s = xMOd11 + ''
      if ((xMOd11 === 10 && DigitoVerificador.toUpperCase() === 'K') || (s.trim() === DigitoVerificador)) {
        console.log('Nit valido')
        return true
      }
    }
    console.log('Nit invalido')
  } catch (e) {
    console.log(e)
    return false
  }
  return false
}

export const calculateLength = ({ string = '' }:{string?: string}): string => {
  let result = string || ''
  if (result.length > 32) {
    const carriage = Math.round(string?.length / 32)
    for (let i = 0; i < Math.round(carriage); i++) {
      result += '\x0D'
    }
    return `${result}\x20`
  } else {
    return string
  }
}

export const cleanAccents = (string?: string): string => {
  try {
    if (typeof string === 'string') {
      const cleanString = regexSpecialChars(string)
      return cleanString?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')
    } else {
      return string || ''
    }
  } catch (ex) {
    console.error('ERROR CLEAN ACCENTS FUNCTION UTILITIES', ex)
    return string || ''
  }
}

export const regexDate = (string: string): string => {
  const r1 = string.replace(/-/, '/').replace(/-/, '/').replace(/T/gi, ' ')
  const index = r1.indexOf('-')
  if (index !== -1) {
    const r2 = r1.slice(0, index)
    return r2
  }
  return r1
}

export const frasesDictionaryGT: {[key: number]: {[key:number]: string}} = {
  1: {
    1: 'Sujeto a pagos trimestrales',
    2: 'Sujeto a retencion definitiva ISR',
    3: 'Sujeto a pago directo ISR'
  },
  2: {
    1: 'Agente de retencion del IVA'
  },
  3: {
    1: 'No genera derecho a credito fiscal'
  },
  4: {
    1: 'Exenta del IVA (art. 7 num. 2 Ley del IVA)',
    2: 'Exenta del IVA (art. 7 num. 4 Ley del IVA)',
    3: 'Exenta del IVA (art. 7 num. 5 Ley del IVA)',
    4: 'Exenta del IVA (art.  7 num. 9 Ley del IVA)',
    5: 'Exenta del IVA (art. 7 num. 10 Ley del IVA)',
    6: 'Exenta del IVA (art. 7 num. 13 Ley del IVA)',
    7: 'Exenta del IVA (art. 7 num. 14 Ley del IVA)',
    8: 'Exenta del IVA (art. 8 num. 1 Ley del IVA)',
    9: 'Exenta del IVA (art. 7 num. 15 Ley del IVA)',
    10: 'Esta factura no incluye IVA (art. 55 Ley del IVA)',
    11: 'No afecta al IVA (Decreto 29-89 Ley de Maquila)',
    12: 'No afecta al IVA (Decreto 65-89 Ley de Zonas Francas)',
    13: 'Exenta del IVA (art. 7 num. 12,  Ley del IVA)',
    14: 'Exenta del IVA (art. 7 num. 6 Ley del IVA)',
    15: 'Exenta del IVA (art. 7 num. 11 Ley del IVA)',
    16: 'Exenta del IVA (art. 8 num. 2 Ley del IVA)',
    17: 'Exenta del IVA (art. 32 literal c Ley Orgánica Zolic)',
    18: 'Contribuyentes con resoluciones específicas de exención al IVA)',
    19: 'Exenta del IVA (art. 3 num. 7 Ley del IVA)',
    20: 'Aportes (art. 35 Ley de Fortalecimiento al Emprendimiento)',
    21: 'Cargos e impuestos no sujetos a IVA (Aerolíneas)',
    22: 'Factura origen no incluye IVA',
    23: 'Exenta del IVA (art. 7, numeral 3, literal c, Ley del IVA)',
    24: 'No afecto al IVA (Fuera del hecho generador art. 3, 7 y 8, Ley del IVA)'

  },
  5: {
    1: 'El vendedor o prestador del servicio se negó a emitir la factura correspondiente. (art. 52 Ley del IVA)'
  },
  6: {
    1: 'Con forma de pago sobre las ventas brutas',
    2: 'Con forma de pago sobre las utilidades, no retener'
  },
  7: {
    1: 'No retener XXXX',
    2: 'No retener XXXX'
  },
  8: {
    1: 'Exenta del ISR (art. 8 núm. 2 Ley de Actualización Tributaria)',
    2: 'Exenta del ISR (art. 8 núm. 3 Ley de Actualización Tributaria)',
    3: 'Exenta del ISR (art. 8 núm. 5 Ley de Actualización Tributaria)',
    4: 'Exenta del ISR (art. 11 núm. 1 Ley de Actualización Tributaria)',
    5: 'Exenta del ISR (art. 11 núm. 2 Ley de Actualización Tributaria)'
  }
}

export const frase9GT = ({ tipo, escenario, leyendas = [], items = [], granTotal = 0 }:{tipo?: string, escenario?: string, leyendas?: any[], items?: any[], granTotal?: number}) => {
  console.log('FRASE 9-------------------------------', tipo, escenario, leyendas)
  try {
    if (tipo === '9' && escenario === '2') {
      const gas92 = leyendas?.find(e => e?.tipoOperacion === 'Gasolina')?.valor || ''
      if (gas92.length) {
        console.log('LEYENDA 92', gas92, items)
        if (!isNaN(items?.descuentoSubsidio)) {
          // console.log('COMOOOOOOOOOOOOpoooooooooooo', `${gas92} ${items.descuentoSubsidio}`)
          if (items?.descuentoSubsidio > 0) {
            // console.log('COMOOOOOOOOOOOO', `${gas92} ${parseFloat(items.descuentoSubsidio).toFixed(2)}`)
            return `${gas92} ${parseFloat(items?.descuentoSubsidio || 0).toFixed(2)}`
          }
        }
      }
    }
    if (tipo === '9' && escenario === '3') {
      const gas93 = leyendas?.find(e => e?.nit === `${tipo},${escenario}`)?.valor || ''
      if (gas93.length) {
        if (!isNaN(items?.descuentoSubsidio) && !isNaN(granTotal)) {
          if (items?.descuentoSubsidio > 0 && granTotal > 0) {
            return `${gas93} ${parseFloat(parseFloat(granTotal || 0) + parseFloat(items?.descuentoSubsidio || 0)).toFixed(2)}`
          }
        }
      }
    }
    if (tipo === '9' && escenario === '1') {
      const gasPropano = leyendas?.find(e => e?.tipoOperacion === 'GasPropano')?.valor || ''
      if (gasPropano.length) {
        if (!isNaN(items?.descuentoSubsidio)) {
          // console.log('COMOOOOOOOOOOOOpoooooooooooo', `${gas92} ${items.descuentoSubsidio}`)
          if (items?.descuentoSubsidio > 0) {
            // console.log('COMOOOOOOOOOOOO', `${gas92} ${parseFloat(items.descuentoSubsidio).toFixed(2)}`)
            return `${gasPropano} ${parseFloat(items?.descuentoSubsidio || 0).toFixed(2)}`
          }
        }
      }
    }
    return null
  } catch (ex) {
    console.error('EXCEPTION FRASES 9 GT FUNCTION UTILITIES', ex)
    return ''
  }
}
