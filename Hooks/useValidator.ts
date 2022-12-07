import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import * as yup from 'yup'
import { Producto, ValidatorSchema } from '../types'
/**
 * It returns an object with a property called productosValidatorSchema, which is a function that
 * returns a yup object for forms validations
 * @returns An object with a property called productosValidatorSchema.
 */

export const useValidator = () => {
  const { country } = useSelector((state: ReduxState) => state.userDB)
  const productos: ValidatorSchema = {
    GT: (props: any) => yup.object().shape({

    }),
    PA: ({ array, item }: {array: Producto[], item: Producto}) => yup.object().shape({
      name: yup
        .string()
        .required('La descripcion del producto es obligatoria'),
      ean: yup
        .string()
        .required('El codigo del producto es obligatorio')
        .test(
          'codigos repetidos',
          'Codigo de producto no disponible, ingrese un codigo no repetido',
          (value) => {
            const firstFilter = array?.filter(p => p?.ean?.toString() === value?.toString())
            return firstFilter
              ?.filter(p =>
                p?.ean?.toString() !== item?.ean?.toString() &&
                p?.name?.toString() !== item?.name?.toString()
              )?.length === 0
          }
        ),
      price: yup
        .number()
        .typeError('El precio debe ser un numero valido')
        .min(0.0001, 'El precio debe ser mayor a cero')
        .required('El precio del producto es obligatorio'),
      ITBMS: yup
        .string()
        .typeError('Algo salio mal al seleccionar la tasa de ITBMS')
        .required('Seleccione una tasa de ITBMS valida o seleccione excento (0%)')
        .test(
          'ITBMS -1',
          'Seleccione una tasa de ITBMS valida o seleccione excento (0%)',
          (value) => value !== '-1'
        ),
      ISC: yup
        .number()
        .typeError('El porcentaje de ISC debe ser un numero valido, indique uno o coloque 0%')
        .min(0, 'El porcentaje de ISC minimo es 0%')
        .max(99, 'El porcentaje de ISC maximo es de 99.00%')
        .required('El porcentaje de ISC debe ser un numero valido, indique uno o coloque 0%'),
      unit: yup
        .string()
        .typeError('Algo salio mal al seleccionar la unidad de medida')
        .required('La unidad de medida es obligatoria'),
      // segmento: yup
      //   .string()
      //   .typeError('Algo salio mal al seleccionar el segmento')
      //   .required('Seleccione un segmento valido'),
      // familia: yup
      //   .string()
      //   .typeError('Algo salio mal al seleccionar la familia')
      //   .required('Seleccione una familia valida'),
      SUME911: yup
        .string()
        .test('NaN', 'La tasa de SUME911 debe ser un numero valido o coloque 0', (value) => {
          const val = Number(value || 0)
          return !isNaN(val)
        })
        .test('EqualsToZero', 'La tasa de SUME911 minima es de 0%', (value) => {
          const val = Number(value || 0)
          return val >= 0
        }),
      TasaPortabilidadNumerica: yup
        .string()
        .test('NaN', 'El porcentaje de Tasa de Portabilidad Numerica debe ser un numero valido o coloque 0', (value) => {
          const val = Number(value || 0)
          return !isNaN(val)
        })
        .test('EqualsToZero', 'El porcentaje de Tasa de Portabilidad Numerica minimo es 0%', (value) => {
          const val = Number(value || 0)
          return val >= 0
        }),
      ImpuestoSobreSeguro: yup
        .string()
        .test('NaN', 'El porcentaje de Impuesto Sobre Seguro debe ser un numero valido o coloque 0', (value) => {
          const val = Number(value || 0)
          return !isNaN(val)
        })
        .test('EqualsToZero', 'El porcentaje de Impuesto Sobre Seguro minimo es 0%', (value) => {
          const val = Number(value || 0)
          return val >= 0
        })
    })
  }
  const clientes: ValidatorSchema = {
    PA: () => yup.object().shape({
      cTaxId: yup
        .string()
        .required('El RUC del Cliente es obligatorio'),
      DV: yup
        .string()
        .required('Indique un RUC valido para autocompletar este campo'),
      tipoCliente: yup
        .string()
        .required('Seleccione un Tipo de RUC Valido'),
      nombreContacto: yup
        .string()
        .required('El Nombre de Contacto del Cliente es obligatorio'),
      // nombreOrga: yup
      //   .string()
      //   .required('El Nombre de Organizacion del Cliente es obligatorio'),
      countryCode: yup
        .string()
        .typeError('Algo salio mal al seleccionar el pais')
        .required('Seleccione un Pais Valido')
        .test(
          'default',
          'Seleccione un Pais Valido',
          value => value !== '-1'
        ),
      direccion: yup
        .string()
        .required('La Direccion del Cliente es obligatoria'),
      provincia: yup
        .string()
        .typeError('Algo salio mal al seleccionar la provincia')
        .required('Seleccione una Provincia Valida'),
      distrito: yup
        .string()
        .typeError('Algo salio mal al seleccionar el distrito')
        .required('Seleccione un Distrito Valido'),
      corregimiento: yup
        .string()
        .typeError('Algo salio mal al seleccionar el corregimiento')
        .required('Seleccione un Corregimiento Valido'),
      telefono: yup
        .string()
        .test(
          'phone regex',
          'Ingrese un numero de telefono valido',
          value => {
            const regex = /^(\d{3,4})-(\d{4})$/ // FORMATO ###-#### O ####-####
            const cleanArray = value?.trim()?.split(';')?.map(e => e?.trim()) || []
            const result = cleanArray.every(e => regex.test(e))
            return result
          }
        ),
      correo: yup
        .string()
        .test(
          'email',
          'Ingrese una direccion de correo valida',
          value => {
            const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
            const cleanArray = value?.trim()?.split(';')?.map(e => e?.trim()) || []
            const result = cleanArray.every(e => regex.test(e))
            return result
          }
        )
    }),
    GT: () => yup.object().shape({

    }),
    generico: () => yup.object().shape({
      countryCode: yup
        .string()
        .required('Seleccione un Pais Valido')
        .test(
          'default',
          'Seleccione un Pais Valido',
          value => value !== '-1'
        ),
      cTaxId: yup
        .string()
        .required('El Identificador Tributario del Cliente es obligatorio'),
      nombreContacto: yup
        .string()
        .required('El Nombre de Contacto del Cliente es obligatorio'),
      // telefono: yup
      //   .string()
      //   .required('El Telefono del Cliente es obligatorio'),
      correo: yup
        .string()
        .test(
          'email',
          'Ingrese una direccion de correo valida',
          value => {
            const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
            const cleanArray = value?.trim()?.split(';')?.map(e => e?.trim()) || []
            const result = cleanArray.every(e => regex.test(e))
            return result
          }
        )
    })
  }

  const selectProducto: ValidatorSchema = {
    PA: () => yup.object().shape({
      name: yup
        .string()
        .typeError('La descripcion del producto es obligatoria')
        .required('La descripcion del producto es obligatoria'),
      quantity: yup
        .number()
        .typeError('Porfavor ingrese una cantidad valida')
        .min(1, 'Ingrese una cantidad valida')
        .required('La cantidad del producto es obligatoria'),
      'impuestos.ITBMS': yup
        .string()
        .typeError('Algo salio mal al seleccionar la tasa de ITBMS')
        .required('Seleccione una tasa de ITBMS valida o seleccione excento (0%)')
        .test(
          'ITBMS -1',
          'Seleccione una tasa de ITBMS valida o seleccione excento (0%)',
          (value) => value !== '-1'
        )
    })
  }

  const perfilFacturacion: ValidatorSchema = {
    PA: () => yup.object().shape({
      Nombre: yup
        .string()
        .required('El nombre del Perfil de Facturacion es obligatorio'),
      NaturalezaOperacion: yup
        .string()
        .typeError('Seleccione una Naturaleza de Operación Valida')
        .required('Seleccione una Naturaleza de Operación Valida'),
      TipoOperacion: yup
        .string()
        .typeError('Seleccione un Tipo de Operación Valido')
        .required('Seleccione un Tipo de Operación Valido'),
      DestinoOperacion: yup
        .string()
        .typeError('Seleccione un Destino de Operación Valido')
        .required('Seleccione un Destino de Operación Valido'),
      FormatoCAFE: yup
        .string()
        .typeError('Seleccione un Formato de generación del CAFE Valido')
        .required('Seleccione un Formato de generación del CAFE Valido'),
      EntregaCAFE: yup
        .string()
        .typeError('Seleccione un Formato de Formato de Entrega del CAFE Valido')
        .required('Seleccione un Formato de Formato de Entrega del CAFE Valido'),
      EnvioContenedor: yup
        .string()
        .typeError('Seleccione un Envío del contenedor para el receptor Valido')
        .required('Seleccione un Envío del contenedor para el receptor Valido'),
      TipoVenta: yup
        .string()
        .typeError('Seleccione un Tipo de transacción de venta Valido')
        .required('Seleccione un Tipo de transacción de venta Valido'),
      TipoSucursal: yup
        .string()
        .typeError('Seleccione un Tipo de Sucursal Valido')
        .required('Seleccione un Tipo de Sucursal Valido')
      // TipoPago: yup
      //   .string()
      //   .typeError('Porfavor agregue uno o mas productos a la lista'),
      // ListaProductos: yup
      //   .string()
      //   .typeError('Porfavor agregue uno o mas productos a la lista')
    })
  }

  const notasCD: ValidatorSchema = {
    PA: (values) => yup.object().shape({
      tipoCliente: yup
        .string()
        .required('El tipo de cliente es obligatorio'),
      cTaxId: yup
        .string()
        .required('Campo obligatorio'),
      DV: yup
        .string()
        .required('Campo es obligatorio'),
      nombreContacto: yup
        .string()
        .required('Campo es obligatorio'),
      fechaEmision: yup
        .string()
        .required('Campo obligatorio'),
      impresionFiscal: yup
        .string()
        .test(
          'validation',
          'Solo puedes elegir una opción',
          (value) => {
            if (value?.length) { return !(values?.facturaPapel?.length || values?.facturaElectronica?.length) } else { return true }
          }
        ),
      facturaPapel: yup
        .string()
        .test(
          'validation',
          'Solo puedes elegir una opción',
          (value) => {
            if (value?.length) { return !(values?.impresionFiscal?.length || values?.facturaElectronica?.length) } else { return true }
          }
        ),
      facturaElectronica: yup
        .string()
        .test(
          'validation',
          'Solo puedes elegir una opción',
          (value) => {
            if (value?.length) { return !(values?.facturaPapel?.length || values?.impresionFiscal?.length) } else { return true }
          }
        )
    })
  }

  const exportacion: ValidatorSchema = {
    PA: (values) => yup.object().shape({
      incoterm: yup.string().required('El termino de exportación es obligatorio'),
      currency: yup.string().required('La moneda es obligatoria'),
      tipoCambio: yup.string().test('USD Seleccionado', 'El tipo de cambio es obligatorio si la moneda no es USD',
        (value) => {
          if (values?.currency === 'USD') { return true } else { return !!value?.length }
        }),
      puertoEmbarque: yup.string().required('El puerto de Embarque es obligatorio').min(5, 'El nombre del puerto de embarque debe contener al menos 5 caracteres')

    })
  }
  return {
    productosValidatorSchema: productos[country],
    clientesValidatorSchema: (customCountry?: string) => clientes[customCountry || country],
    selectProductoValidatorSchema: selectProducto[country],
    perfilFacturacionValidatorSchema: perfilFacturacion[country],
    notasCDValidatorSchema: notasCD[country],
    exportacionValidatorSchema: exportacion[country]
  }
}
