import { yupResolver } from '@hookform/resolvers/yup'
import { useSelector } from 'react-redux'
import { ITBMSDictionary, LoginCountries, tiposDocumentoGlobal } from '../Config/dictionary'
import { fonts, theme } from '../Config/theme'
import { ReduxState } from '../Redux/store'
import { formulario, FormularioPerCountry } from '../types'
import { useValidator } from './useValidator'

export const useFormSchema = () => {
  const { selectProductoValidatorSchema } = useValidator()
  const { country, establecimientos, infoFiscalUser, usuarios } = useSelector((state: ReduxState) => state.userDB)
  const loginFormSchema: Array<formulario> = [
    {
      type: 'picker',
      name: 'country',
      icon: {
        name: 'map-marker',
        color: theme.white,
        size: 20,
        type: 'm'
      },
      picker: {
        data: LoginCountries,
        defaultValue: '-- Seleccione un pais --',
        labelKey: 'name_es',
        valueKey: 'code',
        withSearch: true,
        searchlabel: 'Buscar Pais',
        labelStyle: {
          color: theme.white,
          fontSize: fonts.normal
        },
        style: {
          borderColor: theme.orange
        }
      }
    },
    {
      type: 'inputText',
      name: 'taxid',
      keyboardType: 'default',
      icon: {
        name: 'card-account-details',
        color: theme.white,
        size: 20,
        type: 'm'
      },
      placeholder: 'Identificador Tributario'
    },
    {
      type: 'inputText',
      name: 'username',
      keyboardType: 'default',
      icon: {
        name: 'person',
        color: theme.white,
        size: 20,
        type: 'i'
      },
      placeholder: 'Nombre de Usuario'
    },
    {
      type: 'inputText',
      name: 'password',
      keyboardType: 'default',
      secureTextEntry: true,
      switchIcon: {
        name: 'eye',
        color: theme.white,
        size: 24,
        type: 'i'
      },
      icon: {
        name: 'lock',
        color: theme.white,
        size: 20,
        type: 'm'
      },
      placeholder: 'Contraseña'
    }
  ]

  const consultasFiltroFormSchema: FormularioPerCountry = {
    GT: {
      schema: [
        {
          type: 'inputText',
          label: 'NIT:',
          name: 'nit',
          icon: {
            name: 'idcard',
            color: theme.gray,
            size: 20,
            type: 'a'
          },
          placeholder: 'Filtrar por NIT'
        },
        {
          type: 'inputText',
          label: 'Numero de Serie:',
          name: 'numeroSerie',
          icon: {
            name: 'barcode',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          placeholder: 'Filtrar por Numero de Serie'
        },
        {
          type: 'inputText',
          keyboardType: 'decimal-pad',
          label: 'Monto Inicial:',
          name: 'montoInicial',
          icon: {
            name: 'cash',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          placeholder: 'Filtrar por Monto Inicial'
        },
        {
          type: 'inputText',
          keyboardType: 'decimal-pad',
          label: 'Monto Final:',
          name: 'montoFinal',
          icon: {
            name: 'cash',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          placeholder: 'Filtrar por Monto Final'
        },
        {
          type: 'picker',
          name: 'establecimiento',
          label: 'Establecimiento: ',
          icon: {
            name: 'office-building-marker',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: establecimientos,
            defaultValue: '-- Filtrar por Establecimiento  --',
            labelKey: 'nombre',
            valueKey: 'numero',
            withSearch: true,
            searchlabel: 'Buscar Establecimiento',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'picker',
          label: 'Tipo de Documento: ',
          name: 'tipoDocumento',
          icon: {
            name: 'receipt',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: tiposDocumentoGlobal?.[country]?.[infoFiscalUser.afiliacion],
            defaultValue: '-- Filtrar por Tipo de Documento  --',
            labelKey: 'name',
            valueKey: 'no',
            withSearch: true,
            searchlabel: 'Buscar Tipo de Documento',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'picker',
          label: 'Usuario: ',
          name: 'allDTESorUsername',
          icon: {
            name: 'person',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: usuarios,
            defaultValue: '-- Filtrar por Usuario  --',
            labelKey: 'userName',
            valueKey: 'userName',
            withSearch: true,
            searchlabel: 'Buscar Usuario',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'picker',
          label: 'Cantidad de Documentos: ',
          name: 'cantidadDocumentos',
          icon: {
            name: 'receipt',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [10, 20, 30, 50, 100, 150],
            defaultValue: '-- Filtrar por Cantidad de Documentos  --',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'dateTime',
          label: 'Filtrar por fecha desde: ',
          name: 'fechaInicio',
          icon: {
            name: 'calendar',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          placeholder: 'Fecha inicial'
        },
        {
          type: 'dateTime',
          label: 'Filtrar por fecha hasta: ',
          name: 'fechaFin',
          icon: {
            name: 'calendar',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          placeholder: 'Fecha Final'
        }
      ],
      settings: {
        defaultValues: {
          nit: '',
          numeroSerie: '',
          montoInicial: '',
          montoFinal: '',
          establecimiento: '',
          tipoDocumento: '',
          allDTESorUsername: '',
          cantidadDocumentos: 30,
          fechaInicio: '',
          fechaFin: ''
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
        shouldFocusError: true
      }
    }
  }
  const selectProduct: FormularioPerCountry = {
    PA: {
      schema: [
        {
          name: 'name',
          type: 'inputText',
          placeholder: 'Descripcion',
          required: true,
          label: 'Descripcion : ',
          icon: {
            name: 'file-document-edit',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          }
        },
        {
          name: 'quantity',
          type: 'inputText',
          placeholder: 'Cantidad',
          keyboardType: 'decimal-pad',
          required: true,
          label: 'Cantidad : ',
          icon: {
            name: 'scale-balance',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          }
        },
        {
          type: 'picker',
          label: 'Tasa ITBMS: ',
          required: true,
          name: 'impuestos.ITBMS',
          icon: {
            name: 'scale-balance',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: ITBMSDictionary,
            labelKey: 'label',
            valueKey: 'value',
            defaultValue: '-- Selecccione Tasa ITBMS  --',
            arrowIcon: {
              color: theme.gray
            }
          },
          rules: {
            required: 'Seleccione una tasa de ITBMS valida o seleccione excento (0%)',
            validate: value => value !== '-1'
          }
        }
      ],
      settings: {
        defaultValues: {
          quantity: '1',
          name: '',
          'impuestos.ITBMS': ''
        },
        resolver: yupResolver(selectProductoValidatorSchema())
      }
    }
  }
  return {
    loginFormSchema,
    consultasFiltroFormSchema: consultasFiltroFormSchema[country],
    selectProductFormSchema: selectProduct[country]
  }
}
