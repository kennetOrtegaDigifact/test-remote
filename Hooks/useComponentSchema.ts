import { useCallback } from 'react'
import { useToast } from 'react-native-toast-notifications'
import { useSelector } from 'react-redux'
import { appCodes } from '../Config/appCodes'
import { ReduxState } from '../Redux/store'
import { Cliente, ComponentSchema, ConsultasComponentSchema, Filter, Impuestos, OTI, Producto } from '../types'
import { useApiService } from './useApiService'

export const useComponentSchema = () => {
  const { country } = useSelector((state: ReduxState) => state.userDB)
  const toast = useToast()
  const {
    getAllClientsServiceTS,
    addEditClientServiceTS,
    deleteClientServiceTS,
    deleteProductServiceTS,
    getAllProductsServiceTS,
    addEditProductServiceTS,
    getDtesServiceTS
  } = useApiService()

  const borrarProducto = useCallback(async (item: Producto) => {
    const { name } = item
    console.log('BORRAR PRODUCTO PA ', item)
    const t = toast.show('Borrando producto', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    return deleteProductServiceTS({
      item
    })
      .then(res => {
        if (res.code === appCodes.ok) {
          setTimeout(() => {
            toast.update(t, 'Producto eliminado correctamente', {
              type: 'ok',
              duration: 5000
            })
          }, 500)
        }
        if (res.code === appCodes.processError) {
          setTimeout(() => {
            toast.update(t, 'Algo salio mal al tratar de eliminar el producto, porfavor verifique la informacion o vuelvalo a intentar, si el error persiste reportelo.', {
              type: 'error',
              duration: 5000
            })
          }, 500)
        }
        if (res.code === appCodes.dataVacio) {
          setTimeout(() => {
            toast.update(t, `No fue posible eliminar el producto${name ? ` "${name}"` : ''}`, {
              type: 'warning',
              duration: 5000
            })
          }, 500)
        }
        return res.code
      })
  }, [])

  const getProducts = useCallback(async (signal: AbortSignal) => {
    return getAllProductsServiceTS({
      signal
    })
      .then(res => res)
  }, [])

  const addEditProducts = useCallback((props: any) => {
    console.log('COMOOOOOOOOOO', props)
    const dictionaryTaxes: {[key: string]: string} = {
      SUME911: '01',
      TasaPortabilidadNumerica: '02',
      ImpuestoSobreSeguro: '03'
    }
    const OTIS: OTI[] = Object.keys(props)?.map((key: any) => {
      const obj: OTI = {
        Codigo: '',
        Tasa: 0,
        Valor: 0
      }
      if (dictionaryTaxes?.[key]) {
        obj.Codigo = dictionaryTaxes?.[key]
        obj.Tasa = (parseFloat(props?.[key])) || 0
        obj.Valor = ((parseFloat(props?.[key]) / 100) || 0) * parseFloat((props?.precio || 0))
      }
      return obj
    })?.filter(e => e.Codigo !== '')

    const impuestos: Impuestos = {
      ISC: {
        Tasa: (parseFloat(props?.ISC || 0)),
        Valor: (parseFloat(props?.ISC || 0) / 100) * parseFloat(props?.precio || 0)
      },
      ITBMS: props?.ITBMS || '00',
      OTI: OTIS
    }

    const item = {
      ...props,
      impuestos
    }

    console.log('PRODUCTO FINAL', item)
    const t = toast.show('Creando/Editando producto', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    return addEditProductServiceTS({
      item
    })
      .then(res => {
        if (res?.code === appCodes.ok) {
          setTimeout(() => {
            toast.update(t, 'Producto Creado/Editado Correctamente', {
              type: 'ok',
              duration: 5000
            })
          }, 500)
        }
        if (res?.code === appCodes.processError) {
          setTimeout(() => {
            toast.update(t, 'Algo salio mal al tratar de Crear o Editar el producto, porfavor verifique la informacion o vuelvalo a intentar, si el error persiste reportelo.', {
              type: 'error',
              duration: 5000
            })
          }, 500)
        }
        if (res?.code === appCodes.dataVacio) {
          setTimeout(() => {
            toast.update(t, `No fue posible Crear o Editar el producto${props?.name ? ` "${props?.name}"` : ''}`, {
              type: 'warning',
              duration: 5000
            })
          }, 500)
        }
        return res
      })
  }, [])

  const products: ComponentSchema = {
    PA: {
      labels: {
        searchLabel: 'Buscar Producto Por Nombre/Codigo',
        ean: 'Codigo: ',
        price: 'Precio: B/.'
      },
      searchKeys: ['name', 'ean'],
      functions: {
        borrar: borrarProducto,
        fetchData: getProducts,
        addEdit: addEditProducts
      }
    },
    GT: {
      labels: {
        searchLabel: 'Buscar Producto Por Nombre/Codigo',
        ean: 'Codigo: ',
        price: 'Precio: Q.'
      },
      searchKeys: ['name', 'ean'],
      functions: {
        borrar: borrarProducto,
        fetchData: getProducts,
        addEdit: addEditProducts
      }
    }
  }

  const getAllClients = useCallback(async (signal: AbortSignal) => {
    return getAllClientsServiceTS({ country, signal })
      .then(res => res)
  }, [country, getAllClientsServiceTS])

  const deleteClient = useCallback(async (item: Cliente) => {
    const t = toast.show('Borrando cliente', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    return deleteClientServiceTS({ item })
      .then(res => {
        if (res.code === appCodes.ok) {
          setTimeout(() => {
            toast.update(t, 'Cliente eliminado correctamente', {
              type: 'ok',
              duration: 5000
            })
          }, 500)
        }
        if (res.code === appCodes.processError) {
          setTimeout(() => {
            toast.update(t, 'Algo salio mal al tratar de eliminar el producto, porfavor verifique la informacion o vuelvalo a intentar, si el error persiste reportelo.', {
              type: 'error',
              duration: 5000
            })
          }, 500)
        }
        if (res.code === appCodes.dataVacio) {
          setTimeout(() => {
            toast.update(t, `No fue posible eliminar el cliente${item?.nombreContacto ? ` "${item?.nombreContacto}"` : ''}`, {
              type: 'warning',
              duration: 5000
            })
          }, 500)
        }
        return res.code
      })
  }, [deleteClientServiceTS, toast])

  const addEditClient = useCallback(async (item: Cliente) => {
    const t = toast.show('Creando/Editando cliente', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    return addEditClientServiceTS({ item })
      .then(res => {
        if (res?.code === appCodes.ok) {
          setTimeout(() => {
            toast.update(t, 'Cliente Creado/Editado Correctamente', {
              type: 'ok',
              duration: 5000
            })
          }, 500)
        }
        if (res?.code === appCodes.processError) {
          setTimeout(() => {
            toast.update(t, 'Algo salio mal al tratar de Crear o Editar el cliente, porfavor verifique la informacion o vuelvalo a intentar, si el error persiste reportelo.', {
              type: 'error',
              duration: 5000
            })
          }, 500)
        }
        if (res?.code === appCodes.dataVacio) {
          setTimeout(() => {
            toast.update(t, `No fue posible Crear o Editar el producto${item?.nombreContacto ? ` "${item?.nombreContacto}"` : ''}`, {
              type: 'advertise',
              duration: 5000
            })
          }, 500)
        }
        return res
      })
  }, [addEditClientServiceTS, toast])

  const clientes: ComponentSchema = {
    PA: {
      labels: {
        searchLabel: 'Buscar Cliente Por Nombre/RUC',
        cTaxId: 'RUC del Cliente: ',
        country: 'Pais: ',
        direccion: 'Direccion: '
      },
      searchKeys: ['cTaxId', 'nombreContacto'],
      functions: {
        fetchData: getAllClients,
        addEdit: addEditClient,
        borrar: deleteClient
      }
    },
    GT: {
      labels: {
        searchLabel: 'Buscar Cliente Por Nombre/NIT',
        cTaxId: 'NIT del Cliente: ',
        country: 'Pais: ',
        direccion: 'Direccion: '
      },
      searchKeys: ['cTaxId', 'nombreOrga'],
      functions: {
        fetchData: getAllClients,
        addEdit: addEditClient,
        borrar: deleteClient
      }
    }
  }

  const getDtes = useCallback(async (props?: Filter) => {
    return getDtesServiceTS(props).then(res => res)
  }, [])

  const consultas: ConsultasComponentSchema = {
    GT: {
      labels: {
        documentType: 'Tipo de Documento: ',
        numeroAuth: 'Numero de Autorización: ',
        numeroSerie: 'Numero de Serie: ',
        numeroDocumento: 'Numero de Documento: ',
        razonSocial: 'Razon Social: ',
        fechaEmision: 'Fecha de Emision: ',
        userName: 'Usuario que la Emitio: ',
        establecimiento: 'Establecimiento Emisor: ',
        monto: 'Monto: ',
        cancelled: 'Documento Anulado: ',
        clientTaxid: 'NIT del Cliente: ',
        clientName: 'Nombre del Cliente: ',
        searchLabel: 'Buscar por Numero de Autorizacion/Serie'
      },
      searchKeys: ['numeroAuth', 'numeroSerie'],
      functions: {
        anular: () => {},
        fetchData: getDtes,
        html: () => {},
        pdf: () => {},
        print: () => {},
        sendCorreo: () => {},
        share: () => {}
      }
    },
    PA: {
      labels: {
        documentType: 'Tipo de Documento: ',
        CUFE: 'CUFE: ',
        numeroAuth: 'Numero de Autorización: ',
        numeroSerie: 'Numero de Serie: ',
        numeroDocumento: 'Numero de Documento: ',
        razonSocial: 'Razon Social: ',
        fechaEmision: 'Fecha de Emision: ',
        userName: 'Usuario que la Emitio: ',
        establecimiento: 'Establecimiento Emisor: ',
        monto: 'Monto: ',
        cancelled: 'Documento Anulado: ',
        clientTaxid: 'NIT del Cliente: ',
        clientName: 'Nombre del Cliente: ',
        searchLabel: 'Buscar por Numero de Autorizacion/Serie'
      },
      searchKeys: ['numeroAuth', 'numeroSerie'],
      functions: {
        anular: () => {},
        fetchData: getDtes,
        html: () => {},
        pdf: () => {},
        print: () => {},
        sendCorreo: () => {},
        share: () => {}
      }
    }
  }
  return {
    productosComponentSchema: products[country || ''],
    clientesComponentSchema: clientes[country || ''],
    consultasComponentSchema: consultas[country || '']
  }
}
