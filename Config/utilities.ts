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
            pais: '',
            nit: ''
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
  fixedDecimal = 2
}: {
  number: number
  toFixed?: boolean
  fixedDecimal?: number
}): string => {
  try {
    if (!isNaN(number)) {
      return number.toFixed(toFixed ? fixedDecimal : 0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
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
