import { useCallback } from 'react'
import { useToast } from 'react-native-toast-notifications'
import { useSelector } from 'react-redux'
import { appCodes } from '../Config/appCodes'
import { ReduxState } from '../Redux/store'
import { addEditClientServiceTS, addEditProductServiceTS, deleteClientServiceTS, deleteProductServiceTS, getAllClientsServiceTS, getAllProductsServiceTS } from '../Services/apiService'
import { Cliente, ComponentSchema, Impuestos, OTI, Producto } from '../types'
import { useXmlFetchConstructor } from './useXmlFetchConstructor'

export const useComponentSchema = () => {
  const { country, requestor, taxid, userName } = useSelector((state: ReduxState) => state.userDB)
  const toast = useToast()
  const { getAllClientsXml, addEditClientXml, deleteClientXml, getAllProductsXml, deleteProductsXml, addEditProductsXml } = useXmlFetchConstructor()

  const consultas: {
      [key: string]: {
          labels: {
              searchLabel: string,
              [key: string]: string
          }
      }
  } = {
    GT: {
      labels: {
        searchLabel: 'Buscar por No.Autorizacion/Serie',
        numeroDocumento: 'Numero de Documento: ',
        numeroAuth: 'Numero de Autorizacion: ',
        numeroSerie: 'Numero de Serie: ',
        establecimiento: 'Establecimiento: ',
        clientName: 'Cliente: ',
        fechaEmision: 'Fecha de emision: ',
        clientTaxid: 'NIT: ',
        cancelled: 'Documento Anulado: ',
        documentType: 'Tipo de documento: ',
        razonSocial: 'Razon Social: ',
        userName: 'Usuario que la emitio: ',
        monto: 'Monto: Q'
      }
    },
    PA: {
      labels: {
        searchLabel: 'Buscar por No.Autorizacion/RUC'
      }
    }
  }

  const borrarProducto = useCallback(async (props: Producto) => {
    console.log('BORRAR PRODUCTO PA ', props)
    const { ean, name } = props
    const t = toast.show('Borrando producto', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    const xml = deleteProductsXml({ ean: ean || '' })
    return deleteProductServiceTS({
      xml
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
              type: 'advertise',
              duration: 5000
            })
          }, 500)
        }
        return res.code
      })
  }, [])

  const getProducts = useCallback(async (signal: AbortSignal) => {
    const xml = getAllProductsXml()
    return getAllProductsServiceTS({
      country,
      xml,
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
        obj.Tasa = (parseFloat(props?.[key]) / 100) || 0
        obj.Valor = ((parseFloat(props?.[key]) / 100) || 0) * parseFloat((props?.precio || 0))
      }
      return obj
    })?.filter(e => e.Codigo !== '')

    const impuestos: Impuestos = {
      ISC: {
        Tasa: (parseFloat(props?.ISC || 0) / 100),
        Valor: (parseFloat(props?.ISC || 0) / 100) * parseFloat(props?.precio || 0)
      },
      ITBMS: props?.ITBMS || '00',
      OTI: OTIS
    }

    console.log('IMPUESTOS PA', impuestos)
    const t = toast.show('Creando/Editando producto', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    const xml = addEditProductsXml(props)
    return addEditProductServiceTS({
      xml
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
              type: 'advertise',
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
    const xml = getAllClientsXml()
    return getAllClientsServiceTS({ country, xml, signal })
      .then(res => res)
  }, [])

  const deleteClient = useCallback((item: Cliente) => {
    const t = toast.show('Borrando cliente', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    return deleteClientServiceTS({ xml: deleteClientXml(item) })
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
              type: 'advertise',
              duration: 5000
            })
          }, 500)
        }
        return res.code
      })
  }, [])

  const addEditClient = useCallback((item: Cliente) => {
    console.log('XML FINAL', addEditClientXml(item))
    const t = toast.show('Creando/Editando cliente', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    return addEditClientServiceTS({ xml: addEditClientXml(item) })
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
  }, [])

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
    }
  }
  return {
    consultasComponentSchema: consultas[country],
    productosComponentSchema: products[country],
    clientesComponentSchema: clientes[country]
  }
}
