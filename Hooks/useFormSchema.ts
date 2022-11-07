import { useSelector } from 'react-redux'
import { LoginCountries, tiposDocumentoGlobal } from '../Config/dictionary'
import { fonts, theme } from '../Config/theme'
import { ReduxState } from '../Redux/store'
import { formulario, FormularioPerCountry } from '../types'

export const useFormSchema = () => {
  const { country, establecimientos, infoFiscalUser } = useSelector((state: ReduxState) => state.userDB)
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
        }
      ],
      settings: {
        defaultValues: {
          nit: '',
          numeroSerie: '',
          montoInicial: '',
          montoFinal: '',
          establecimiento: '',
          tipoDocumento: ''
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
        shouldFocusError: true
      }
    }
  }
  return {
    loginFormSchema,
    consultasFiltroFormSchema: consultasFiltroFormSchema[country]
  }
}
