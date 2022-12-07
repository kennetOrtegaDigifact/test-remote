import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { appCodes } from '../Config/appCodes'
import { DepartamentosGT, ITBMSDictionary, LoginCountries, MunicipiosGT, tiposDocumentoGT, tiposDocumentoPA, unitDictionaryGT } from '../Config/dictionary'
import { fonts, theme } from '../Config/theme'
import { ReduxState } from '../Redux/store'
import { setUtils } from '../Redux/utilsReducer'
import { formulario, FormularioPerCountry } from '../types'
import { useApiService } from './useApiService'
import { useValidator } from './useValidator'

export const useFormSchema = (props
  : {
    onBlur?: (values?: any) => void
  }) => {
  const { onBlur = (values) => { console.log('UNHANDLED ONBLUR', values) } } = props
  const { getUnitMeasurementServiceTS } = useApiService()
  const dispatch = useDispatch()
  const { clientesValidatorSchema, selectProductoValidatorSchema } = useValidator()
  const { country = '', establecimientos, infoFiscalUser, usuarios, clientes } = useSelector((state: ReduxState) => state.userDB)
  const { countryCodes, corregimientos, provincias, distritos, units, segmentos, familias } = useSelector((state: ReduxState) => state.utilsDB)

  useEffect(() => {
    if (!units?.length) {
      getUnitMeasurementServiceTS({ country })
        .then(res => {
          console.log(res)
          if (res?.code === appCodes.ok) {
            dispatch(setUtils({
              units: res?.data || {}
            }))
          }
        })
    }
  }, [])

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
            data: [{ name: '-- Selecccione un Tipo de Documento  --', code: '', no: '' }, ...(tiposDocumentoGT?.[infoFiscalUser?.afiliacion] || [])],
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
    },
    PA: {
      schema: [
        {
          name: 'taxidReceptor',
          type: 'inputText',
          placeholder: 'Filtrar por RUC',
          label: 'Filtro por RUC :',
          icon: {
            name: 'card-account-details',
            size: 20,
            color: theme.graygreen,
            type: 'm'
          }
        },
        {
          name: 'CUFE',
          type: 'inputText',
          placeholder: 'Filtrar por CUFE',
          label: 'Filtro por CUFE :',
          icon: {
            name: 'qrcode',
            size: 20,
            color: theme.graygreen,
            type: 'm'
          }
        },
        {
          name: 'montoInicio',
          type: 'inputText',
          keyboardType: 'decimal-pad',
          label: 'Filtrar por Monto Inicial :',
          placeholder: 'Mondo desde',
          icon: {
            name: 'cash',
            size: 20,
            color: theme.graygreen,
            type: 'm'
          }
        },
        {
          name: 'montoFin',
          type: 'inputText',
          keyboardType: 'decimal-pad',
          label: 'Filtrar por Monto Final :',
          placeholder: 'Mondo hasta',
          icon: {
            name: 'cash',
            size: 20,
            color: theme.graygreen,
            type: 'm'
          }
        },
        {
          type: 'picker',
          label: 'Filtrar por Establecimientos: ',
          name: 'establecimientos',
          icon: {
            name: 'office-building-marker',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: [{ nombre: '-- Selecccione un Establecimiento  --', numero: '' }, ...(establecimientos || [])],
            labelKey: 'nombre',
            valueKey: 'numero',
            defaultValue: '-- Selecccione un Establecimiento  --',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'picker',
          label: 'Filtrar por Tipo de Documento: ',
          name: 'tipoDocumento',
          icon: {
            name: 'receipt',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ name: '-- Selecccione un Tipo de Documento  --', code: '', no: '' }, ...tiposDocumentoPA],
            labelKey: 'name',
            valueKey: 'no',
            defaultValue: '-- Selecccione un Tipo de Documento  --',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'picker',
          label: 'Filtrar por Usuario: ',
          name: 'porUsuario',
          icon: {
            name: 'people',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ userName: '-- Selecccione un Usuario  --' }, ...(usuarios || [])],
            labelKey: 'userName',
            valueKey: 'userName',
            defaultValue: '-- Selecccione un Usuario  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true
          }
        },
        {
          type: 'picker',
          label: 'Filtrar por Documentos Anulados: ',
          name: 'porAnulados',
          icon: {
            name: 'cancel',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: [{ label: '-- Filtro por Anulados  --', value: '0' }, { value: '0', label: 'NO' }, { value: '1', label: 'SI' }],
            labelKey: 'label',
            valueKey: 'value',
            defaultValue: '-- Filtro por Anulados  --',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          type: 'picker',
          label: 'Filtrar por Cantidad de Documentos: ',
          name: 'cantidadDocumentos',
          icon: {
            name: 'receipt',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [10, 20, 30, 50, 100, 150],
            defaultValue: '10',
            arrowIcon: {
              color: theme.gray
            }
          }
        },
        {
          name: 'fechaInicio',
          type: 'dateTime',
          label: 'Filtrar por Fecha de Inicio :',
          placeholder: 'Filtrar por Fecha Desde',
          icon: {
            name: 'calendar',
            type: 'i',
            color: theme.graygreen,
            size: 20
          }
        },
        {
          name: 'fechaFin',
          type: 'dateTime',
          label: 'Filtrar por Fecha de Fin :',
          placeholder: 'Filtrar por Fecha Hasta',
          icon: {
            name: 'calendar',
            type: 'i',
            color: theme.graygreen,
            size: 20
          }
        }
      ],
      settings: {
        defaultValues: {
          taxidReceptor: '',
          CUFE: '',
          montoInicio: '',
          montoFin: '',
          establecimientos: '',
          tipoDocumento: '',
          porUsuario: '',
          porAnulados: '',
          cantidadDocumentos: '10',
          fechaInicio: '',
          fechaFin: ''
        },
        mode: 'onSubmit',
        shouldFocusError: true,
        reValidateMode: 'onChange'
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

  const clientesSchema: FormularioPerCountry = {
    GT: {
      schema: [
        {
          type: 'picker',
          label: 'Pais del Cliente: ',
          name: 'countryCode',
          required: true,
          icon: {
            name: 'map',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: [{ countryName: '-- Selecccione un Pais  --', countryCode: '-1' }, ...(countryCodes || [])],
            labelKey: 'countryName',
            valueKey: 'countryCode',
            defaultValue: '-- Selecccione un Pais  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Pais'
          },
          rules: {
            required: 'Seleccione un Pais Valido'
          }
        },
        {
          name: 'cTaxId',
          placeholder: 'NIT/Identificador Tributario',
          label: 'NIT/Identificador Tributario del Cliente:',
          required: true,
          type: 'inputText',
          onBlur,
          icon: {
            name: 'badge-account',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El NIT/Identificador Tributario del Cliente es obligatorio'
          }
        },
        {
          name: 'nombreContacto',
          placeholder: 'Nombre de Contacto',
          label: 'Nombre de Contacto del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'badge-account-horizontal',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Nombre de Contacto del Cliente es obligatorio'
          }
        },
        {
          name: 'direccion',
          placeholder: 'Direccion',
          label: 'Direccion Completa del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'location',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'La Direccion del Cliente es obligatoria'
          }
        },
        {
          type: 'picker',
          label: 'Departamento del Cliente: ',
          name: 'departamento',
          required: true,
          icon: {
            name: 'location',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ '': '-- Selecccione un Departamento  --' }, { '-- Selecccione un Departamento  --': '' }, ...(DepartamentosGT || [])],
            defaultValue: '-- Selecccione un Departamento  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Departamento'
          },
          rules: {
            required: 'Seleccione un Departamento Valido'
          }
        },
        {
          type: 'picker',
          label: 'Municipio del Cliente: ',
          name: 'municipio',
          required: true,
          icon: {
            name: 'location',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [...(MunicipiosGT?.[''] || [])],
            defaultValue: '-- Selecccione un Municipio  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Municipio'
          },
          rules: {
            required: 'Seleccione un Municipio Valido'
          }
        },
        {
          name: 'telefono',
          placeholder: 'Telefono (########;########...etc)',
          label: 'Telefono del Cliente :',
          type: 'inputText',
          keyboardType: 'phone-pad',
          icon: {
            name: 'phone',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          }
        },
        {
          name: 'correo',
          placeholder: 'Correo Electronico',
          label: 'Correo Electronico del Cliente :',
          type: 'inputText',
          keyboardType: 'email-address',
          icon: {
            name: 'email',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          }
        }
      ],
      settings: {
        defaultValues: {
          cTaxId: '',
          nombreContacto: '',
          countryCode: '',
          direccion: '',
          departamento: '',
          municipio: '',
          telefono: '',
          correo: ''
        },
        resolver: yupResolver(clientesValidatorSchema()({ array: clientes }))
      },
      observables: ['departamento'],
      onBlurValues: ['cTaxId']
    },
    PA: {
      schema: [
        {
          type: 'picker',
          label: 'Pais del Cliente: ',
          name: 'countryCode',
          required: true,
          icon: {
            name: 'map',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: [{ countryName: '-- Selecccione un Pais  --', countryCode: '-1' }, ...(countryCodes || [])],
            labelKey: 'countryName',
            valueKey: 'countryCode',
            defaultValue: '-- Selecccione un Pais  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Pais'
          },
          rules: {
            required: 'Seleccione un Pais Valido'
          }
        },
        {
          name: 'cTaxId',
          placeholder: 'RUC',
          label: 'RUC del Cliente:',
          required: true,
          type: 'inputText',
          onBlur,
          icon: {
            name: 'badge-account',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El RUC del Cliente es obligatorio'
          }
        },
        {
          type: 'picker',
          label: 'Tipo de RUC: ',
          name: 'tipoCliente',
          required: true,
          icon: {
            name: 'person',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ name: '-- Selecccione un Tipo de RUC  --', code: '' }, { name: 'Natural', code: '1' }, { name: 'Juridico', code: '2' }],
            labelKey: 'name',
            valueKey: 'code',
            defaultValue: '-- Selecccione un Tipo de RUC  --',
            arrowIcon: {
              color: theme.gray
            }
          },
          rules: {
            required: 'Seleccione un Tipo de RUC Valido'
          }
        },
        {
          name: 'tipoContribuyente',
          placeholder: '(Campo Automatico al introducir un RUC)',
          label: 'Tipo de Cliente:',
          required: true,
          type: 'inputText',
          disabled: true,
          icon: {
            name: 'qr-code',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'El Tipo de Cliente es obligatorio'
          }
        },
        {
          name: 'DV',
          placeholder: '(Campo Automatico al introducir un RUC)',
          label: 'Digito Verificador del RUC del Cliente:',
          required: true,
          type: 'inputText',
          disabled: true,
          icon: {
            name: 'qr-code',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'El Digito Verificador del RUC del Cliente es obligatorio'
          }
        },
        {
          name: 'nombreContacto',
          placeholder: 'Nombre de Contacto',
          label: 'Nombre de Contacto del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'badge-account-horizontal',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Nombre de Contacto del Cliente es obligatorio'
          }
        },
        {
          name: 'direccion',
          placeholder: 'Direccion',
          label: 'Direccion Completa del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'location',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'La Direccion del Cliente es obligatoria'
          }
        },
        {
          type: 'picker',
          label: 'Provincia del Cliente: ',
          required: true,
          name: 'provincia',
          icon: {
            name: 'location',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ nombre: '-- Selecccione una Provincia  --', codProvincia: '' }, ...(provincias || [])],
            labelKey: 'nombre',
            valueKey: 'codProvincia',
            defaultValue: '-- Selecccione una Provincia  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Provincia'
          },
          rules: {
            required: 'Seleccione una Provincia Valida'
          }
        },
        {
          type: 'picker',
          label: 'Distrito del Cliente: ',
          required: true,
          name: 'distrito',
          icon: {
            name: 'location',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ nombre: '-- Selecccione un Distrito  --', codDistrito: '' }, ...(distritos || [])],
            labelKey: 'nombre',
            valueKey: 'codDistrito',
            defaultValue: '-- Selecccione un Distrito  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Distrito'
          },
          rules: {
            required: 'Seleccione un Distrito Valido'
          }
        },
        {
          type: 'picker',
          label: 'Corregimiento del Cliente: ',
          required: true,
          name: 'corregimiento',
          icon: {
            name: 'location',
            color: theme.gray,
            size: 20,
            type: 'i'
          },
          picker: {
            data: [{ nombre: '-- Selecccione un Corregimiento  --', codCorregimiento: '' }, ...(corregimientos || [])],
            labelKey: 'nombre',
            valueKey: 'codCorregimiento',
            defaultValue: '-- Selecccione un Corregimiento  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Corregimiento'
          },
          rules: {
            required: 'Seleccione un Corregimiento Valido'
          }
        },
        {
          name: 'telefono',
          placeholder: 'Telefono (###-##### o ####-####)',
          required: true,
          label: 'Telefono del Cliente :',
          type: 'inputText',
          icon: {
            name: 'phone',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Telefono del Cliente es obligatorio'
          }
        },
        {
          name: 'correo',
          placeholder: 'Correo Electronico',
          label: 'Correo Electronico del Cliente :',
          required: true,
          type: 'inputText',
          keyboardType: 'email-address',
          icon: {
            name: 'email',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Correo del Cliente es obligatorio'
          }
        }
      ],
      settings: {
        defaultValues: {
          cTaxId: '',
          DV: '',
          nombreContacto: '',
          countryCode: '',
          direccion: '',
          provincia: '',
          distrito: '',
          corregimiento: '',
          telefono: '',
          correo: '',
          tipoCliente: '',
          tipoContribuyente: '',
          estado: ''
        },
        resolver: yupResolver(clientesValidatorSchema()())
      },
      observables: ['countryCode', 'provincia', 'distrito'],
      onBlurValues: ['cTaxId', 'tipoCliente', 'countryCode']
    },
    generico: {
      schema: [
        {
          type: 'picker',
          label: 'Pais del Cliente: ',
          required: true,
          name: 'countryCode',
          icon: {
            name: 'map',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: [{ countryName: '-- Selecccione un Pais  --', countryCode: '-1' }, ...(countryCodes || [])],
            labelKey: 'countryName',
            valueKey: 'countryCode',
            defaultValue: '-- Selecccione un Pais  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Pais'
          },
          rules: {
            required: 'Seleccione un Pais Valido'
          }
        },
        {
          name: 'cTaxId',
          placeholder: 'Identificador Tributario',
          label: 'Identificador Tributario del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'badge-account',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Identificador Tributario del Cliente es obligatorio'
          }
        },
        {
          name: 'nombreContacto',
          placeholder: 'Nombre de Contacto',
          label: 'Nombre de Contacto del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'badge-account-horizontal',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Nombre de Contacto del Cliente es obligatorio'
          }
        },
        {
          name: 'nombreOrga',
          placeholder: 'Nombre de Organizacion',
          label: 'Nombre de Organizacion del Cliente:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'badge-account-horizontal',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          }
        },
        {
          name: 'telefono',
          placeholder: 'Telefono',
          label: 'Telefono del Cliente :',
          required: true,
          type: 'inputText',
          icon: {
            name: 'phone',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Telefono del Cliente es obligatorio'
          }
        },
        {
          name: 'correo',
          placeholder: 'Correo Electronico',
          label: 'Correo Electronico del Cliente :',
          required: true,
          type: 'inputText',
          keyboardType: 'email-address',
          icon: {
            name: 'email',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'El Correo del Cliente es obligatorio'
          }
        }
      ],
      settings: {
        defaultValues: {
          cTaxId: '',
          nombreContacto: '',
          nombreOrga: '',
          countryCode: '',
          telefono: '',
          correo: ''
        },
        resolver: yupResolver(clientesValidatorSchema('generico')())
      },
      observables: ['countryCode']
    }
  }

  const productos: FormularioPerCountry = {
    PA: {
      schema: [
        {
          name: 'name',
          placeholder: 'Descripcion',
          label: 'Descripcion del Producto:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'text-box',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'La descripcion del producto es obligatoria'
          }
        },
        {
          name: 'ean',
          placeholder: 'Codigo',
          label: 'Codigo del Producto:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'barcode',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'El codigo del producto es obligatorio'
          }
        },
        {
          name: 'price',
          placeholder: 'Precio Base',
          label: 'Precio del Producto:',
          required: true,
          type: 'inputText',
          keyboardType: 'decimal-pad',
          icon: {
            name: 'pricetag',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'El precio del producto es obligatorio'
          }
        },
        {
          type: 'picker',
          label: 'Tasa ITBMS: ',
          required: true,
          name: 'ITBMS',
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
        },
        {
          type: 'picker',
          label: 'Unidad de Medida: ',
          required: true,
          name: 'unit',
          icon: {
            name: 'tape-measure',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: units,
            labelKey: 'label',
            valueKey: 'nombre',
            defaultValue: '-- Selecccione Unidade de Medida  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Unidad de Medida'
          },
          rules: {
            required: 'Seleccione una Unidad de Medida Valida'
          }
        },
        {
          type: 'picker',
          label: 'Codigo de Bienes y Servicios: ',
          required: true,
          name: 'segmento',
          icon: {
            name: 'tape-measure',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: segmentos,
            labelKey: 'nombreSegmento',
            valueKey: 'codSegmento',
            defaultValue: '-- Selecccione Un Segmento  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Segmento'
          },
          rules: {
            required: 'Seleccione un Segmento Valido'
          }
        },
        {
          type: 'picker',
          name: 'familia',
          icon: {
            name: 'tape-measure',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: familias,
            labelKey: 'nombreFamilia',
            valueKey: 'codFamilia',
            defaultValue: '-- Selecccione Una Familia  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Familia'
          },
          rules: {
            required: 'Seleccione una Familia Valido'
          }
        },
        {
          name: 'ISC',
          placeholder: 'Tasa (%)',
          label: 'Impuesto Selectivo al Consumo (ISC):',
          type: 'inputText',
          keyboardType: 'decimal-pad',
          icon: {
            name: 'scale-unbalanced',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          }
        },
        {
          name: 'SUME911',
          label: 'Otras Tasas o Impuesto (OTI):',
          placeholder: 'SUME 911 (%)',
          type: 'inputText',
          keyboardType: 'decimal-pad',
          icon: {
            name: 'calculator',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          }
        },
        {
          name: 'TasaPortabilidadNumerica',
          placeholder: 'Tasa Portabilidad Numerica (%)',
          type: 'inputText',
          keyboardType: 'decimal-pad',
          icon: {
            name: 'calculator',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          }
        },
        {
          name: 'ImpuestoSobreSeguro',
          placeholder: 'Impuesto Sobre Seguro (%)',
          type: 'inputText',
          keyboardType: 'decimal-pad',
          icon: {
            name: 'calculator',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          }
        }
      ],
      settings: {
        defaultValues: {
          name: '',
          ean: '',
          price: '',
          ITBMS: '',
          ISC: '',
          SUME911: '',
          unit: '',
          TasaPortabilidadNumerica: '',
          ImpuestoSobreSeguro: '',
          segmento: '',
          familia: ''
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
        shouldFocusError: true

      }
    },
    GT: {
      schema: [
        {
          name: 'name',
          placeholder: 'Descripcion',
          label: 'Descripcion del Producto:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'text-box',
            color: theme.graygreen,
            size: 20,
            type: 'm'
          },
          rules: {
            required: 'La descripcion del producto es obligatoria'
          }
        },
        {
          name: 'ean',
          placeholder: 'Codigo',
          label: 'Codigo del Producto:',
          required: true,
          type: 'inputText',
          icon: {
            name: 'barcode',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'El codigo del producto es obligatorio'
          }
        },
        {
          name: 'price',
          placeholder: 'Precio Base',
          label: 'Precio del Producto:',
          required: true,
          type: 'inputText',
          keyboardType: 'decimal-pad',
          icon: {
            name: 'pricetag',
            color: theme.graygreen,
            size: 20,
            type: 'i'
          },
          rules: {
            required: 'El precio del producto es obligatorio'
          }
        },
        {
          type: 'picker',
          label: 'Unidad de Medida: ',
          required: true,
          name: 'unit',
          icon: {
            name: 'tape-measure',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: unitDictionaryGT,
            labelKey: 'label',
            valueKey: 'nombre',
            defaultValue: '-- Selecccione Unidade de Medida  --',
            arrowIcon: {
              color: theme.gray
            },
            withSearch: true,
            searchlabel: 'Buscar Unidad de Medida'
          },
          rules: {
            required: 'Seleccione una Unidad de Medida Valida'
          }
        },
        {
          type: 'picker',
          label: 'Tipo de Producto: ',
          required: true,
          name: 'tipo',
          icon: {
            name: 'tape-measure',
            color: theme.gray,
            size: 20,
            type: 'm'
          },
          picker: {
            data: ['BIEN', 'SERVICIO'],
            defaultValue: '-- Selecccione un Tipo de Producto  --',
            arrowIcon: {
              color: theme.gray
            }
          },
          rules: {
            required: 'Seleccione un Tipo de Producto Valido'
          }
        }
      ],
      settings: {
        defaultValues: {
          name: '',
          ean: '',
          price: '',
          unit: '',
          tipo: ''
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
        shouldFocusError: true
      }
    }
  }

  return {
    loginFormSchema,
    clientsFormSchema: (customCountry?: string) => clientesSchema[customCountry || country],
    consultasFiltroFormSchema: consultasFiltroFormSchema[country],
    productsSchema: productos[country],
    selectProductFormSchema: selectProduct[country]
  }
}
