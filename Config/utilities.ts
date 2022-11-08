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
  const userRegex = usuario.trim().replace('_', '').replace('API', '').replace('INDIVIDUAL', '').replace('BATCH', '').split('.')
  const length: {[key: number]: number} = {
    1: 0,
    2: 0,
    3: 2
  }
  return userRegex[length[userRegex.length]]
}
