
/**
 * It takes a string, splits it into an array, then maps over the array, and returns an array of
 * objects
 * @returns An array of objects.
 */
export const establecimientosSpliter = ({ establecimientos = '' }) => {
  const est = typeof establecimientos === 'string'
    ? establecimientos?.split('|')?.map(e => {
      if (typeof e === 'string') {
        if (e.length > 0) {
          const obj = {}
          const et = e.trim()
          const index = et.indexOf('<') + 1
          const secondIndex = et.indexOf('<', index) + 1
          obj.numero = e.slice(0, index).replace(/</gi, '').trim()
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
