import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { ConsultaDTE, Filter, InfoFiscalUser, SharedData, Establecimiento, ConfiguracionApp, Logos, ProductoResumen, User, Invoice, Branch, Cliente, NitService, Producto, DocumentTypes, Usuario, NIT, DashboardType, CountryCodes, MIPOS, PerfilFacturacionType, XmlProps, Provincia, Distrito, Corregimiento, Currencie, IncoTerm, Segmento, Familia, UnidadDeMedida, Consultas } from '../types'
import { XMLParser } from 'fast-xml-parser'
import base64 from 'react-native-base64'
import { urlApiMs, urlsByCountry, urlWsRest, urlWsRestV2, urlWsSoap, urlWsToken, urlXMLTransformation } from '../Config/api'
import { establecimientosSpliter, regexSpecialChars } from '../Config/utilities'
import DeviceInfo from 'react-native-device-info'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { options } from '../Config/xmlparser'
import { appCodes } from '../Config/appCodes'

import { clientFetchProps, consultasFetchProps, corregimientosFetchProps, currenciesFetchProps, distritosFetchProps, establecimientosFetchProps, familiasFetchProps, incoTermsFetchProps, infoFiscalFetchProps, productFetchProps, provinciasFetchProps, segmentosFetchProps, sharedDataFetchProps, unitMeasurementFetchProps, usersFetchProps } from '../Config/dictionary'
import { useXmlFetchConstructor } from './useXmlFetchConstructor'
import { useCallback } from 'react'
import { actionsPermissionsTemplate, fatherAccessTemplate } from '../Config/templates'

type FetchProps={
  requestor: string,
  taxid: string,
  country: string,
  userName: string,
  usuario?: string,
  signal?: AbortSignal
  token?: string
}
const parser = new XMLParser(options)
const urlApiNUC = 'https://pactest.digifact.com.pa/pa.com.apinuc/api'

export const useApiService = () => {
  const {
    getAllClientsXml,
    addEditClientXml,
    deleteClientXml,
    getAllProductsXml,
    deleteProductsXml,
    addEditProductsXml,
    getAccountDetailsXml,
    infoFiscalXml,
    getAllEstablecimientosXml,
    getConfigAppXml,
    getCatalogPermissionsFatherXml,
    getCatalogPermissionsActionsXml,
    getUserFatherPermissionsXml,
    getUserActionsPermissionsXml,
    getUsersByTaxIdXml,
    getDecimalesXml,
    getCountryCodesXml,
    getProvinciasXml,
    getDistritosXml,
    getCorregimientosXml,
    getCurrenciesXml,
    getIncoTermsXml,
    getFamiliasXml,
    getSegmentosXml,
    getUnitMeasurementXml,
    recoverPasswordXml,
    getDtesXml
  } = useXmlFetchConstructor()
  const { country } = useSelector((state: ReduxState) => state.userDB)
  const user = useSelector((state: ReduxState) => state.userDB)

  const getCountryCodesServiceTS = useCallback(async (): Promise<{
    code: number
    data: CountryCodes[],
    key: string
  }> => {
    return globalThis.fetch('https://pactest.digifact.com.pa/pa.com.wsfront/FEWSFRONT.asmx', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getCountryCodesXml()
    })
      .then(res => res.text())
      .then(data => {
        try {
          const dataParsed = parser.parse(data)
          const rows = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
          if (rows > 0) {
            const dataProvincias = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
            const dataArr = []
            dataArr.push(dataProvincias)
            const paises = dataArr.flat().map(e => {
              const obj: CountryCodes = {
                countryCode: '',
                countryName: ''
              }
              obj.countryCode = e.CountryCode
              obj.countryName = e.CountryName
              return obj
            })
            return {
              code: appCodes.ok,
              data: paises,
              key: 'countryCodes'
            }
          }
          return {
            code: appCodes.dataVacio,
            data: [],
            key: 'countryCodes'
          }
        } catch (ex) {
          return {
            code: appCodes.processError,
            data: [],
            key: 'countryCodes'
          }
        }
      })
      .catch(err => {
        console.warn('ERROR AL TRAER CODIGOS DE PAISES', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'countryCodes'
        }
      })
  }, [])

  const getCertTokenServiceTS = useCallback(async ({
    userName,
    taxid,
    password,
    country
  }: {
    userName: string
    taxid: string
    password: string
    country: string
  }): Promise<{
    code: number
    data: string
    key: string
  }> => {
    console.log('BODY LOGIN JSON', JSON.stringify({ Username: `${country}.${taxid}.${userName}`, Password: password }))
    return globalThis.fetch(urlsByCountry?.[country]?.urlToken || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Username: `${country}.${taxid}.${userName}`, Password: password })
    }).then(r => r.json().then(data => ({ status: r.status, body: data })))
      .then(response => {
        // console.log('CERT TOKEN SERVICE RESPONSE', response)
        if (response.status === 200) {
          return {
            code: appCodes.ok,
            data: response?.body?.Token,
            key: 'token'
          }
        }
        return {
          code: appCodes.invalidData,
          data: '',
          key: 'token'
        }
      })
      .catch(err => {
        console.log('ERROR getCertTokenServiceTS', err)
        return {
          code: appCodes.processError,
          data: '',
          key: 'token'
        }
      })
  }, [])

  const getAccountDetailsServiceTS = useCallback(async (props: {
    country?: string
    taxid?: string
  }): Promise<{
    code: number
    data: SharedData
    key: string
  }> => {
    const {
      country = '',
      taxid = ''
    } = props

    return globalThis.fetch(urlsByCountry?.[country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getAccountDetailsXml({ countryCode: country, taxid })
    })
      .then(res => res.text())
      .then(requestorResponse => {
        const dataParsed = parser.parse(requestorResponse)
        const count = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (count > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: SharedData[] = container?.flat()?.map((e: SharedData) => {
            const obj: SharedData|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Cliente lleva mas props dependendiendo del pais
            sharedDataFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = e?.[sharedDataFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || ''
            })
            return obj
          })
          return {
            code: appCodes.ok,
            data: data?.[0] || {},
            key: 'sharedData'
          }
        }
        return {
          code: appCodes.invalidData,
          data: {},
          key: 'sharedData'
        }
      })
      .catch(err => {
        console.log(`ERROR GET ACCOUNT DETAILS FOR ${country}, ERROR: `, err)
        return {
          code: appCodes.processError,
          data: {},
          key: 'sharedData'
        }
      })
  }, [])

  const getInfoFiscalServiceTS = useCallback(async (props: {
    country?: string
    taxid?: string
    requestor?: string
    userName?: string
  }): Promise<{
    code: number
    data: InfoFiscalUser
    key: string
  }> => {
    const {
      country = '',
      taxid = '',
      requestor = '',
      userName = ''
    } = props
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: infoFiscalXml({ country, taxid, requestor, userName })
    })
      .then(res => res.text())
      .then(infoFiscalResponse => {
        const dataParsed = parser.parse(infoFiscalResponse)
        // console.log('RESPONSE REQUESTOR', data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T.RequestorGUID)
        const count = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (count > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: InfoFiscalUser[] = container?.flat()?.map((e: InfoFiscalUser) => {
            // console.log('------- INFO FISCAL ELEMENT ------------', e)
            const obj: InfoFiscalUser|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Cliente lleva mas props dependendiendo del pais
            infoFiscalFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              // console.log('----------------- VALUE INFO FISCAL ----------------', key)
              if (key === 'establecimientos') {
                obj[key as keyof typeof obj] = establecimientosSpliter({ establecimientos: e?.[infoFiscalFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '' })
              } else {
                obj[key as keyof typeof obj] = e?.[infoFiscalFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || ''
              }
            })
            return obj
          })
          // console.log('----------- DATA INFO FISCAL -------------', JSON.stringify(data))
          return {
            code: appCodes.ok,
            data: data?.[0] || {},
            key: 'infoFiscalUser'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: {},
          key: 'infoFiscalUser'
        }
      })
      .catch(err => {
        console.log(`GET INFO FISCAL USER BY ${country} CATCH ERROR`, err)
        return {
          code: appCodes.processError,
          data: {},
          key: 'infoFiscalUser'
        }
      })
  }, [])

  const getAllEstablecimientosServiceTS = useCallback(async (props: {
      country?: string
      taxid?: string
      requestor?: string
      userName?: string
    }): Promise<{
    code: number
    data: Establecimiento[]
    key: string
    }> => {
    const {
      country = '',
      taxid = '',
      requestor = '',
      userName = ''
    } = props
    // console.log('---------- XML ESTABLECIMIENTOS ------------', getAllEstablecimientosXml({ country, requestor, taxid, userName }))
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getAllEstablecimientosXml({ country, requestor, taxid, userName })
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const count = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (count > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Establecimiento[] = container?.flat()?.map((e: Establecimiento) => {
            // console.log('-------- ESTABLECIMIENTOS ----------', e)
            const obj: Establecimiento|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Cliente lleva mas props dependendiendo del pais
            establecimientosFetchProps?.[user?.country || country || '']?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = e?.[establecimientosFetchProps?.[user?.country || country || '']?.props?.[key] as keyof typeof e]?.toString() || ''
            })
            return obj
          })
          return {
            code: appCodes.ok,
            data,
            key: 'establecimientos'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'establecimientos'
        }
      })
      .catch(err => {
        console.log(`ERROR GET ESTABLISHMENTS FOR ${country}, ERROR: `, err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'establecimientos'
        }
      })
  }, [user?.country])

  const getConfigAppServiceTS = useCallback(async (props: {
    country?: string
    taxid?: string
  }): Promise<{
    code: number
    data: ConfiguracionApp[]
    key: string
  }> => {
    const {
      country = '',
      taxid = ''
    } = props
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getConfigAppXml({ country, taxid })
    })
      .then(res => res.text())
      .then(response => {
        const configDATA = parser.parse(response)
        const configCount = configDATA.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (configCount > 0) {
          const configRows = configDATA.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const arrayConfig: ConfiguracionApp[] = []
          arrayConfig.push(configRows)
          // console.log('COMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO --------------------', arrayConfig)
          // const urlsConfig = arrayConfig?.flat()?.filter(e => e.idTipoConfiguracion === 8)
          // const urls: {[key: string]: string} = {}
          // urlsConfig?.flat()?.forEach((e: ConfiguracionApp) => {
          //   urls[`url${e?.tipoOperacion || ''}`] = e?.valor?.toString() || ''
          // })
          return {
            code: appCodes.ok,
            data: arrayConfig.flat(),
            key: 'configuracionApp'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'configuracionApp'
        }
      })
      .catch(err => {
        console.log(`CATCH ERROR GET CONFIGURACION APP FOR ${country}`, err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'configuracionApp'
        }
      })
  }, [user?.country])

  const getCatalogPermissionsFatherServiceTS = useCallback(async ({
    country
  }: {
    country: string
  }): Promise<{
    code: number
    data: {[key: string]: {granted: boolean}}
  }> => {
    // console.log('--------- FATHER CATALOG XML --------', getCatalogPermissionsFatherXml({ country }))
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getCatalogPermissionsFatherXml({ country })
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const dataPermisos = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(dataPermisos)
          const obj: {[key: string]: {granted: boolean}} = {}
          dataArr.flat().forEach(e => {
            obj[e?.Descripcion] = {
              granted: true
            }
          })
          // console.log('--------- FATHER CATALOG DATA --------', obj)

          return {
            code: appCodes.ok,
            data: obj
          }
        }
        return {
          code: appCodes.dataVacio,
          data: fatherAccessTemplate?.[country as keyof typeof fatherAccessTemplate]
        }
      })
      .catch(err => {
        console.log(`ERROR GET CATALOG PERMISSIONS FATHER FOR ${country}`, err)
        return {
          code: appCodes.processError,
          data: fatherAccessTemplate?.[country as keyof typeof fatherAccessTemplate]
        }
      })
  }, [user?.country])

  const getCatalogPermissionsActionsServiceTS = useCallback(async ({
    country
  }: {
    country: string
  }): Promise<{
    code: number
    data: any
  }> => {
    // console.log('--------- ACTIONS CATALOG XML --------', getCatalogPermissionsActionsXml({ country }))
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getCatalogPermissionsActionsXml({ country })
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const dataPermisos = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(dataPermisos)
          const obj: {[key: string]: {granted: boolean}} = {}
          dataArr.flat().forEach(element => {
            // console.log('ELEMENT', element)
            obj[element?.page] = {
              ...obj[element?.page],
              [element?.actionRight]: {
                granted: true
              }
            }
          })
          // console.log('--------- ACTION CATALOG DATA --------', obj)

          return {
            code: appCodes.ok,
            data: obj
          }
        }
        return {
          code: appCodes.dataVacio,
          data: actionsPermissionsTemplate?.[country as keyof typeof actionsPermissionsTemplate]
        }
      })
      .catch(err => {
        console.log(`ERROR GET CATALOG PERMISSIONS FATHER FOR ${country}`, err)
        return {
          code: appCodes.processError,
          data: actionsPermissionsTemplate?.[country as keyof typeof actionsPermissionsTemplate]
        }
      })
  }, [user?.country])

  const getFatherPermissions = useCallback(async ({ country, requestor, userName, taxid }: {country: string, requestor: string, userName: string, taxid: string}): Promise<{
    code: number
    data: {[key: string]: {granted: boolean}}
    key: string
  }> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getUserFatherPermissionsXml({ country, requestor, taxid, userName })
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const dataPermisos = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(dataPermisos)
          const obj: {[key: string]: {granted: boolean}} = {}
          dataArr.flat().forEach(e => {
            obj[e?.Descripcion] = {
              granted: e?.Granted
            }
          })
          // console.log('--------- FATHER CATALOG DATA --------', obj)

          return {
            code: appCodes.ok,
            data: obj,
            key: ''
          }
        }
        return {
          code: appCodes.dataVacio,
          data: {},
          key: ''
        }
      })
      .catch(err => {
        console.log(`ERROR GET CATALOG PERMISSIONS FATHER FOR ${country}`, err)
        return {
          code: appCodes.ok,
          data: {},
          key: ''
        }
      })
  }, [user?.country])

  const getActionsPermissions = useCallback(async ({
    country,
    requestor,
    userName,
    taxid
  }: {
      country: string
      requestor: string
      userName: string
      taxid: string
  }): Promise<{
    code: number
    data: {[key: string]: {granted: boolean}}
    key: string
  }> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getUserActionsPermissionsXml({ country, requestor, taxid, userName })
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const dataPermisos = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(dataPermisos)
          const obj: {[key: string]: {granted: boolean}} = {}
          dataArr.flat().forEach(element => {
            // console.log('ELEMENT', element)
            obj[element?.page] = {
              ...obj[element?.page],
              [element?.actionRight]: {
                granted: element?.granted
              }
            }
          })
          // console.log('--------- ACTION CATALOG DATA --------', obj)

          return {
            code: appCodes.ok,
            data: obj,
            key: ''
          }
        }
        return {
          code: appCodes.dataVacio,
          data: {},
          key: ''
        }
      })
      .catch(err => {
        console.log(`ERROR GET CATALOG PERMISSIONS FATHER FOR ${country}`, err)
        return {
          code: appCodes.processError,
          data: {},
          key: ''
        }
      })
  }, [user?.country])

  const getPermissionsServiceTS = useCallback(async ({
    country,
    requestor,
    userName,
    taxid
  }: {
      country: string
      requestor: string
      userName: string
      taxid: string
  }): Promise<{
    code: number
    data: {
      [key: string]: {
        [key: string]: {
          granted: boolean
        }
      }
    }
    key: string
  }> => {
    // console.log('------------ father permissions user ---------', await getFatherPermissions({ country, requestor, userName, taxid }))
    // console.log('------------ actions permissions user ---------', getUserActionsPermissionsXml({ country, requestor, userName, taxid }))
    return getCatalogPermissionsFatherServiceTS({ country })
      .then(async (father: any) => {
        return getCatalogPermissionsActionsServiceTS({ country })
          .then(async (actions: any) => {
            return getFatherPermissions({ country, requestor, userName, taxid })
              .then(async (fatherRes: any) => {
                return getActionsPermissions({ country, requestor, taxid, userName })
                  .then(async (actionsRes: any) => {
                    const result: any = {}
                    const fatherObj: any = {
                      ...father?.data,
                      ...fatherRes?.data
                    }
                    const actionsObj: any = {
                      ...actions?.data,
                      ...actionsRes?.data
                    }
                    Object.keys(fatherObj)?.forEach(key => {
                      result[key] = {
                        ...fatherObj[key],
                        ...actionsObj[key]
                      }
                    })
                    return {
                      code: appCodes.ok,
                      data: result,
                      key: 'permisos'
                    }
                  })
                  .catch(err => {
                    console.log(`ERROR GET PERMISSIONS FATHER BY USER FOR ${country}`, err)
                    const result: any = {}
                    const obj: any = {
                      ...father?.data,
                      ...fatherRes?.data
                    }
                    Object.keys(obj)?.forEach(key => {
                      result[key] = {
                        ...obj[key],
                        ...actions?.data[key]
                      }
                    })
                    return {
                      code: appCodes.processError,
                      data: result,
                      key: 'permisos'
                    }
                  })
              })
              .catch(err => {
                console.log(`ERROR GET PERMISSIONS FATHER BY USER FOR ${country}`, err)
                const result: any = {}
                Object.keys(father?.data)?.forEach(key => {
                  result[key] = {
                    ...father?.data[key],
                    ...actions?.data[key]
                  }
                })
                return {
                  code: appCodes.processError,
                  data: result,
                  key: 'permisos'
                }
              })
          })
      })
  }, [])

  const getAllClientsServiceTS = useCallback(async (props: {
    country?: string
    signal?: AbortSignal
    taxid?: string
    requestor?: string
    userName?: string
}): Promise<{
    code: number
    data: Cliente[]
    key: string
}> => {
    const {
      country = '',
      signal = new AbortController().signal,
      taxid = '',
      requestor = '',
      userName = ''
    } = props
    // console.log('------------ GET ALL CLIENTS XML ------------------', getAllClientsXml({ country, requestor, taxid, userName }))
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      signal,
      headers: { 'Content-Type': 'text/xml' },
      method: 'POST',
      body: getAllClientsXml({ country, requestor, taxid, userName }) || ''
    })
      .then(res => res.text())
      .then(response => {
        try {
          const dataParsed = parser.parse(response)
          const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
          if (rows > 0) {
            const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
            const container: any[] = []
            container.push(dataResponse)
            const data: Cliente[] = container?.flat()?.map((e: Cliente) => {
              const obj: Cliente|any = {}
              // Primero creamos el objeto base con sus key por pais ya que el tipo Cliente lleva mas props dependendiendo del pais
              clientFetchProps?.[user?.country || country]?.keys?.forEach((key: string) => {
                // console.log('--------- KEY -------------', key, country)
                // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
                obj[key as keyof typeof obj] = regexSpecialChars(e?.[clientFetchProps?.[user?.country || country]?.props?.[key] as keyof typeof e]?.toString() || '')
                if (key === 'cargo' && country === 'PA') {
                  const cargo: {Tipo?: string, Estado?: string} = JSON?.parse(e?.[clientFetchProps?.[user?.country || country]?.props?.[key] as keyof typeof e]?.toString()?.replace(/\\/gi, '') || '{}') || {}
                  obj.tipoContribuyente = cargo?.Tipo || ''
                  obj.estado = cargo?.Estado || ''
                }
              })
              return obj
            })
            // console.log('CLIENTES FINALES', data)
            return {
              code: appCodes.ok,
              data,
              key: 'clientes'
            }
          }
          return {
            code: appCodes.dataVacio,
            data: [],
            key: 'clientes'
          }
        } catch (ex) {
          console.log('ERROR EXCEPTION GET ALL CLIENTS SERVICE TS', ex)
          return {
            code: appCodes.processError,
            data: [],
            key: 'clientes'
          }
        }
      })
      .catch((err: Error) => {
        console.log('ERROR EXCEPTION GET ALL CLIENTS SERVICE TS', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: [],
            key: 'clientes'
          }
        }
        return {
          code: appCodes.processError,
          data: [],
          key: 'clientes'
        }
      })
  }, [user?.country])

  const getAllProductsServiceTS = useCallback(async (props: {
    signal?: AbortSignal,
    taxid?: string
    country?: string
    userName?: string
    requestor?: string
}): Promise<{
    code: number
    data: Producto[],
    key: string
}> => {
    const {
      signal = new AbortController().signal,
      taxid = '',
      country = '',
      userName = '',
      requestor = ''
    } = props
    const xml = getAllProductsXml({ country, requestor, taxid, userName })
    console.log('-------------- GET ALL PRODUCTS XML -------------', xml)
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    })
      .then(res => res.text())
      .then(res => {
        try {
          const dataParsed = parser.parse(res)
          const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1
          if (rows > 0) {
            const productosData: any = dataParsed.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
            //   console.log('---------- GET ALL PRODUCTS DATA --------------------------\n', productosData)
            const dataRows: any[] = []
            dataRows.push(productosData)
            const data: Producto[] = dataRows.flat().map((e: any) => {
              const obj: Producto = {
                quantity: 1,
                discount: 0,
                selected: false
              }
              // Primero creamos el objeto base con sus key por pais ya que el tipo Producto lleva mas props dependendiendo del pais
              productFetchProps?.[user?.country || country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
                obj[key as keyof typeof obj] = e?.[productFetchProps?.[user?.country || country]?.props?.[key]] || ''
                if (key === 'impuestos' && (user?.country || country) === 'PA') { // hay casos especiales donde hay que traducir un JSON. esto en GT no sucede
                  obj[key] = JSON.parse(e?.[productFetchProps?.[user?.country || country]?.props?.[key]] || '{}')
                }
              })
              // console.log('PRODUCTO FINAL', obj)
              return obj
            })
            return {
              code: appCodes.ok,
              data,
              key: 'productos'
            }
          }
          return {
            code: appCodes.dataVacio,
            data: [],
            key: 'productos'
          }
        } catch (err: any) {
          console.log('EXCEPTION GET ALL PRODUCTS SERVICE TS', err)
          return {
            code: appCodes.processError,
            data: [],
            key: 'productos'
          }
        }
      })
      .catch((err: Error) => {
        console.log('ERROR CATCH GET ALL PRODUCTS SERVICE TS', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: [],
            key: 'productos'
          }
        }
        return {
          code: appCodes.processError,
          data: [],
          key: 'productos'
        }
      })
  }, [user?.country])

  const getAllUsersByTaxIdServiceTS = useCallback(async ({
    country = '',
    requestor = '',
    taxid = '',
    userName = ''
  }: XmlProps): Promise<{
    code: number
    data: Usuario[]
    key: string
  }> => {
    // console.log('--------------- GET ALL USERS XML --------------------', getUsersByTaxIdXml({ country, requestor, taxid, userName }))
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getUsersByTaxIdXml({ country, requestor, taxid, userName })
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Usuario[] = container?.flat()?.map((e: Usuario) => {
            const obj: Usuario|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Usuario lleva mas props dependendiendo del pais
            usersFetchProps?.[user?.country || country]?.keys?.forEach((key: string) => {
              // console.log('--------- KEY -------------', key, country)
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[usersFetchProps?.[user?.country || country]?.props?.[key] as keyof typeof e]?.toString() || '')
              // if (key === 'nombre') {
              //   obj[key as keyof typeof obj] = regexSpecialChars(`${e?.FN?.toString()} ${e?.LN?.toString()}`)
              // }
            })
            return obj
          })
          console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'usuarios'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'usuarios'
        }
      })
      .catch(err => {
        console.log(`ERROR GET ALL USERS SERVICE TS FOR ${country}`, err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'usuarios'
        }
      })
  }, [user?.country])

  const getLogosServiceTS = useCallback(async ({
    taxid = '',
    establecimientos,
    country = ''
  }: {
    taxid: string
    establecimientos: Establecimiento[]
    country?: string
    }): Promise<{
      code: number
      data: Logos
      key: string
}> => {
    const URL_BASE: string = `https://digifact-logo.s3.amazonaws.com/${user?.country || country}/logo/${taxid}.jpg`
    return ReactNativeBlobUtil
      .fetch('GET', URL_BASE)
      .then(res => res.base64())
      .then(async response => {
      // console.log('RESPONSE IMAGE', response)
        const obj: Logos = {
          logoGeneral: '',
          logoPorEstablecimiento: { '-1': '' }
        }
        obj.logoGeneral = response?.length > 1000 ? response : ''
        // obj.logoPorEstablecimiento = {}
        let est: Establecimiento
        for (est of establecimientos) {
          const URL_BASE_EST = `https://digifact-logo.s3.amazonaws.com/${user?.country || country}/logo/${taxid}_${est?.numero}_APP.jpg`
          await ReactNativeBlobUtil.fetch('GET', URL_BASE_EST)
            .then(res => res.base64())
            .then(responseEst => {
              obj.logoPorEstablecimiento[est?.numero!] = responseEst?.length > 1000 ? responseEst : ''
            })
        }
        return {
          code: appCodes.ok,
          data: obj,
          key: 'logos'
        }
      })
      .catch(err => {
        console.log(`ERROR GET LOGOS SERVICE FOR ${country}`, err)
        return {
          code: appCodes.processError,
          data: {
            logoGeneral: '',
            logoPorEstablecimiento: {}
          },
          key: 'logos'
        }
      })
  }, [user?.country])

  const getDecimalesServiceTS = useCallback(async ({ country = '', requestor = '', taxid = '', userName = '' }: XmlProps): Promise<{
    code: number
    data: number
    key: string
  }> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getDecimalesXml({ country, requestor, taxid, userName })
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          console.log(JSON.stringify(data))
          const responseData = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData
          const rows = responseData?.ResponseData1 || 0
          // console.log('DECIMALES', responseData)
          // console.log('ROWS', rows)
          if (rows > 0) {
            const decimals = responseData?.ResponseDataSet?.diffgram?.NewDataSet?.T?.FELCONFIG_DECIMALES_CANTIDAD || 6
            // console.log('DECIMALS CONFIG', decimals)
            return {
              code: appCodes.ok,
              data: decimals,
              key: 'decimales'
            }
          }
          return {
            code: appCodes.ok,
            data: 2,
            key: 'decimales'
          }
        } catch (err) {
          console.log('ERROR EXCEPTION GET DECIMALS SERVICE', err)
          return {
            code: appCodes.ok,
            data: 2,
            key: 'decimales'
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET DECIMALES SERVICE', err)
        return {
          code: appCodes.ok,
          data: 2,
          key: 'decimales'
        }
      })
  }, [user?.country])

  const getProvinciasServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: Provincia[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getProvinciasXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Provincia[] = container?.flat()?.map((e: Provincia) => {
            const obj: Provincia|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Provincia lleva mas props dependendiendo del pais
            provinciasFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[provinciasFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'provincias'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'provincias'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET PROVINCIAS SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'provincias'
        }
      })
  }, [user?.country])

  const getDistritosServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: Distrito[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getDistritosXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Distrito[] = container?.flat()?.map((e: Distrito) => {
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: Distrito|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Distrito lleva mas props dependendiendo del pais
            distritosFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[distritosFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'distritos'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'distritos'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET DISTRITOS SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'distritos'
        }
      })
  }, [user?.country])

  const getCorregimientosServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: Corregimiento[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getCorregimientosXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Corregimiento[] = container?.flat()?.map((e: Corregimiento) => {
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: Corregimiento|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Corregimiento lleva mas props dependendiendo del pais
            corregimientosFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[corregimientosFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'corregimientos'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'corregimientos'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET Corregimiento SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'corregimientos'
        }
      })
  }, [user?.country])

  const getCurrenciesServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: Currencie[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getCurrenciesXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Currencie[] = container?.flat()?.map((e: Currencie) => {
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: Currencie|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Currencie lleva mas props dependendiendo del pais
            currenciesFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[currenciesFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'currencies'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'currencies'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET CURRENCIE SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'currencies'
        }
      })
  }, [user?.country])

  const getIncoTermsServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: IncoTerm[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getIncoTermsXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: IncoTerm[] = container?.flat()?.map((e: IncoTerm) => {
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: IncoTerm|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo IncoTerm lleva mas props dependendiendo del pais
            incoTermsFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[incoTermsFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'incoterms'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'incoterms'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET INCOTERMS SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'incoterms'
        }
      })
  }, [user?.country])

  const getSegmentosServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: Segmento[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getSegmentosXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Segmento[] = container?.flat()?.map((e: Segmento) => {
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: Segmento|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Segmento lleva mas props dependendiendo del pais
            segmentosFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[segmentosFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'segmentos'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'segmentos'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET SEGMENTOS SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'segmentos'
        }
      })
  }, [user?.country])

  const getFamiliasServiceTS = useCallback(async ({
    country = ''
  }: {
    country?: string
  }): Promise<{
    code: number
    data: Familia[]
    key: string
}> => {
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getFamiliasXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: Familia[] = container?.flat()?.map((e: Familia) => {
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: Familia|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo Familia lleva mas props dependendiendo del pais
            familiasFetchProps?.[country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[familiasFetchProps?.[country]?.props?.[key] as keyof typeof e]?.toString() || '')
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'familias'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'familias'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET FAMILIAS SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'familias'
        }
      })
  }, [user?.country])

  const getUnitMeasurementServiceTS = useCallback(async (props: {
    country?: string
  }): Promise<{
    code: number
    data: UnidadDeMedida[]
    key: string
  }> => {
    const {
      country = ''
    } = props
    return globalThis.fetch(urlsByCountry?.PA?.urlWsSoap || '', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getUnitMeasurementXml()
    })
      .then(res => res.text())
      .then(response => {
        const dataParsed = parser.parse(response)
        const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
        if (rows > 0) {
          const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.T || []
          const container: any[] = []
          container.push(dataResponse)
          const data: UnidadDeMedida[] = container?.flat()?.map((e: UnidadDeMedida) => {
            console.log('------------ UNIT MEASUREMENT ELEMENT ----------------', e)
            // console.log('------------- DISTRITOS ELEMENT --------------', e)
            const obj: UnidadDeMedida|any = {}
            // Primero creamos el objeto base con sus key por pais ya que el tipo UnidadDeMedida lleva mas props dependendiendo del pais
            unitMeasurementFetchProps?.[user?.country || country]?.keys?.forEach((key: string) => {
              // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
              obj[key as keyof typeof obj] = regexSpecialChars(e?.[unitMeasurementFetchProps?.[user?.country || country]?.props?.[key] as keyof typeof e]?.toString() || '')
              if (key === 'label') {
                obj[key as keyof typeof obj] = `${e?.Medida || ''} - ${e?.Nombre || ''}`
              }
            })
            return obj
          })
          // console.log('CLIENTES FINALES', data)
          return {
            code: appCodes.ok,
            data,
            key: 'units'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'units'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET UnidadDeMedida SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'units'
        }
      })
  }, [user?.country])

  const getTokenMIPOSServiceTS = async ({
    country,
    userName,
    password,
    taxid
  }: {
    country: string
    userName: string
    password: string
    taxid: string|number
    key: string
    }): Promise<{
      code: number
      key: string
      data: MIPOS
  }> => {
    console.log('LOGIN MIPOS', JSON.stringify({ Username: `${country}.${taxid}.${userName}`, Password: password }))
    return globalThis.fetch('https://felgtaws.digifact.com.gt/gt.com.bac.mipos/api/Authentication/get_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Username: `${country}.${taxid}.${userName}`, Password: password })
    })
      .then(res => res.json())
      .then(responseAuth => {
        if (responseAuth?.Token) {
          return globalThis.fetch(`https://felgtaws.digifact.com.gt/gt.com.bac.mipos/api/MiPOS/token?TAXID=${taxid}&USERNAME=${userName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: responseAuth?.Token
            }
          })
            .then(responseM => responseM.json())
            .then(responseMIPOSTOKEN => {
              if (responseMIPOSTOKEN?.TokenAPI && responseMIPOSTOKEN?.TokenUser) {
                return {
                  code: appCodes.ok,
                  key: 'MIPOS',
                  data: {
                    apiToken: responseAuth?.Token || '',
                    token: responseMIPOSTOKEN?.TokenAPI || '',
                    userToken: responseMIPOSTOKEN?.TokenUser || ''
                  }
                }
              }
              return {
                code: appCodes.dataVacio,
                key: 'MIPOS',
                data: {}
              }
            })
            .catch(err => {
              console.log('ERROR CATCH GET TOKEN MIPOS SERVICE GET CREDENTIALS', err)
              return {
                code: appCodes.processError,
                key: 'MIPOS',
                data: {}
              }
            })
        }
        return {
          code: appCodes.unauthorized,
          key: 'MIPOS',
          data: {}
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET TOKEN MIPOS SERVICE', err)
        return {
          code: appCodes.ok,
          key: 'MIPOS',
          data: {}
        }
      })
  }

  const recoverPasswordServiceTS = useCallback(async (props: XmlProps): Promise<{code: number}> => {
    const {
      country = '',
      taxid = '',
      userName = ''
    } = props
    return globalThis.fetch(urlsByCountry?.[user?.country || country]?.urlWsSoap || '', {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: recoverPasswordXml({ country, taxid, userName })
    })
      .then(res => res.text())
      .then(response => {
        const data = parser.parse(response)
        console.log('DATA RESPONSE RECOVER PASSWORD', data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response)
        const responseCode = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response
        if (responseCode?.Code === appCodes.ok) {
          console.log('RECUPERAR CONTRASEÑA OK')
          return {
            code: appCodes.ok
          }
        } else if (responseCode?.Code === 3085) { // NO EXISTE EL USUARIO
          return {
            code: appCodes.invalidData
          }
        } else {
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH RECOVER PASSWORD SERVICE ', err)
        return {
          code: appCodes.processError
        }
      })
  }, [])

  const getDtesServiceTS = useCallback(async (props?: Filter): Promise<{
    code: number
    data: Consultas[]
    key: string
  }> => {
    // console.log('------------ DTES XML ------------------', getDtesXml())
    const { signal = new AbortController().signal } = props || {}
    return globalThis.fetch(urlsByCountry?.[user?.country || '']?.urlWsSoap || '', {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: getDtesXml(props)
    })
      .then(res => res.text())
      .then(response => {
        try {
          const dataParsed = parser.parse(response)
          const rows = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseData1 || 0
          if (rows > 0) {
            const dataResponse: any = dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.ResponseData?.ResponseDataSet?.diffgram?.NewDataSet?.B || []
            const container: any[] = []
            container.push(dataResponse)
            const data: Consultas[] = container?.flat()?.map((e: Consultas) => {
              // console.log('------ CONSULTAS ELEMENT ------', e)
              const obj: Consultas|any = {}
              // Primero creamos el objeto base con sus key por pais ya que el tipo Consultas lleva mas props dependendiendo del pais
              consultasFetchProps?.[user?.country || '']?.keys?.forEach((key: string) => {
                // console.log('--------- KEY -------------', key, country)
                // Una vez asignada las llaves recorremos las llaves del objeto para asignar la prop del fecth
                obj[key as keyof typeof obj] = regexSpecialChars(e?.[consultasFetchProps?.[user?.country || '']?.props?.[key] as keyof typeof e]?.toString() || '')
              })
              return obj
            })
            // console.log('CLIENTES FINALES', data)
            return {
              code: appCodes.ok,
              data,
              key: 'consultas'
            }
          }
          return {
            code: appCodes.dataVacio,
            data: [],
            key: 'consultas'
          }
        } catch (ex) {
          console.log('ERROR EXCEPTION GET ALL DTES SERVICE TS', ex)
          return {
            code: appCodes.processError,
            data: [],
            key: 'consultas'
          }
        }
      })
      .catch((err: Error) => {
        console.log('ERROR EXCEPTION GET ALL DTES SERVICE TS', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: [],
            key: 'consultas'
          }
        }
        return {
          code: appCodes.processError,
          data: [],
          key: 'consultas'
        }
      })
  }, [user?.country])

  const getDashboardService = async ({
    taxid,
    signal
  }: FetchProps): Promise<{
  code: number
  data?: DashboardType
}> => {
    return globalThis.fetch(urlWsSoap, {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version = "1.0" encoding = "utf-8" ?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
                  <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                  <Transaction>SHARED_INFO_EFACE</Transaction>
                  <Country>GT</Country>
                  <Entity>000000123456</Entity>
                  <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                  <UserName>GT.000000123456.DIGIFACT</UserName>
                  <Data1>SHARED_NFRONT_DASHBOARD</Data1>
                  <Data2>STAXID|${taxid}</Data2>
                  <Data3></Data3>
                </RequestTransaction>
              </soap:Body>
            </soap:Envelope>`
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          // console.log('DATA DASHBOARD', data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T)
          const dataRows = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
          console.log('DATA ROWS DASHBOARD', dataRows)
          if (dataRows > 0) {
            const dataDashboard: any[] = []
            const rows = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
            dataDashboard.push(rows)
            const objD: DashboardType = {
              resumenMensual: [],
              ingresoAnual: 0,
              nuevosClientes: 0,
              ingresoMensual: 0,
              numeroVentas: 0,
              ventasAnteriores: 0,
              totalCs: 0,
              csAnteriores: 0,
              totalClientes: 0,
              promedioVentaPorFactura: 0,
              resumenSemanal: [],
              resumenAnual: { '': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
              topClientes: [{ nit: 0, total: 0 }]
            }
            // const today = new Date().getMonth()
            const actualYear = new Date().getFullYear()
            const actualMonth = new Date().getMonth() + 1

            objD.resumenMensual = dataDashboard
              ?.flat()
              ?.filter(e => e.tipoInfo === 'MENSUAL')
              ?.sort((a, b) => {
                const at:string[] = `${a.anio}  -${a.mes}  -01`.split(/[- :]/)
                const bt:string[] = `${b.anio}  -${b.mes}  -01`.split(/[- :]/)
                const aF:number = new Date(Number(at[0]), Number(at[1]) - 1, Number(at[2]), Number(at[3] || 0), Number(at[4] || 0), Number(at[5] || 0)).getTime()
                const bF:number = new Date(Number(bt[0]), Number(bt[1]) - 1, Number(bt[2]), Number(bt[3] || 0), Number(bt[4] || 0), Number(bt[5] || 0)).getTime()

                if (aF < bF) return -1
                if (aF > bF) return 1
                return 0
              }) || []

            dataDashboard?.flat()?.forEach(e => {
              if (e.tipoInfo === 'ANUAL') {
                objD.ingresoAnual = e.total || 0.0
              }
              if (e.tipoInfo === 'CLIENTES_NUEVOS') {
                objD.nuevosClientes = e.numCliente
              }
              if (e.tipoInfo === 'MENSUAL') {
                objD.ingresoMensual = objD?.resumenMensual.find(e => (e?.anio === actualYear && e?.mes === actualMonth))?.total || 0
              }
              if (e.tipoInfo === 'VENTAS') {
                objD.numeroVentas = e.numVentas
              }
              if (e.tipoInfo === 'VENTAS_PASADO') {
                objD.ventasAnteriores = e.numVentas
              }
              if (e.tipoInfo === 'CROSS_SELL') {
                objD.totalCs = e.total
              }
              if (e.tipoInfo === 'CROSS_SELL_TOTAL') {
                objD.csAnteriores = e.total
              }
              if (e.tipoInfo === 'CLIENTES_TOTAL') {
                objD.totalClientes = e.numCliente
              }
            })

            if (!dataDashboard?.flat()?.some(e => e.tipoInfo === 'CLIENTES_TOTAL')) {
              const totalNuevos = dataDashboard?.flat()?.find(d => d?.tipoInfo === 'CLIENTES_NUEVOS')?.numCliente || 0
              objD.totalClientes = totalNuevos
            }

            objD.promedioVentaPorFactura = (objD.ingresoMensual || 0) / (objD.numeroVentas || 1)

            const week = dataDashboard
              ?.flat()
              ?.filter(e => (e.tipoInfo === 'SEMANAL'))
              ?.sort((a, b) => {
                const aF = new Date(a.fechaFin).getTime()
                const bF = new Date(b.fechaFin).getTime()
                if (aF < bF) return -1
                if (aF > bF) return 1
                return 0
              })
            const blankWeek = [0, 0, 0, 0]
            week?.forEach((s, i) => {
              objD.resumenSemanal = blankWeek.fill(s.total || 0, i, i + 1)
            })
            const years = [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()]

            const resumenAnual = {
              [actualYear - 2]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [actualYear - 1]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [actualYear]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }

            years.forEach(e => {
              const anual = objD.resumenMensual?.flat()?.filter(a => a.anio === e)
              const blank = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              anual.forEach((m) => {
                const position = m.mes - 1
                const stop = m.mes
                blank.fill(m.total || 0, position, stop)
              })
              resumenAnual[e] = blank
            })

            objD.resumenAnual = resumenAnual

            objD.topClientes = dataDashboard
              ?.flat()
              ?.filter(e => e.tipoInfo === 'TOP_CLIENTES')
              ?.sort((a: {nit: string, total: number}, b: {nit: string, total: number}) => {
                const aT = a.total || 0
                const bT = b.total || 0

                if (aT < bT) return 1
                if (aT > bT) return -1
                return 0
              }) || []

            // console.log('DASHBOARD DATA', objD)
            return {
              code: appCodes.ok,
              data: objD
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (ex) {
          console.error('EXCEPTION GET RESUME DASHBOARD SERVICE', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR GET DASHBOARD SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const getInfoByNITService = async ({ cTaxId }: {cTaxId: string}): Promise<{
  code: number
  data: NIT
}| undefined> => {
    return globalThis.fetch(urlWsSoap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version = "1.0" encoding = "utf-8" ?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
                  <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                  <Transaction>EXEC_STORED_PROC</Transaction>
                  <Country>GT</Country>
                  <Entity>000000123456</Entity>
                  <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                  <UserName>GT.000000123456.admon</UserName>
                  <Data1>PLANILLACC_GetInfoNIT</Data1>
                  <Data2>NIT|${cTaxId}</Data2>
                  <Data3></Data3>
                </RequestTransaction>
              </soap:Body>
            </soap:Envelope>`
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          // console.log('DATA DASHBOARD', data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T)
          const dataRows = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
          // console.log('DATA ROWS GET INFO BY NIT', dataRows)
          if (dataRows > 0) {
            const dataNIT = []
            const rows = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
            dataNIT.push(rows)
            if (Array.isArray(dataNIT) && dataNIT.length) {
            // console.log('NIT RESPONSE', dataNIT)
              const obj: NIT = {
                country: '',
                departamento: '',
                direccion: '',
                municipio: '',
                nombreContacto: '',
                cTaxId: ''
              }
              dataNIT.forEach(e => {
                obj.country = e.CC
                obj.cTaxId = e.TID
                obj.nombreContacto = e.N
                obj.direccion = e.Direccion
                obj.departamento = e.Cd
                obj.municipio = e.Cm
              })
              return {
                code: appCodes.ok,
                data: obj
              }
            }
            return {
              code: 0,
              data: {
                country: '',
                departamento: '',
                direccion: '',
                municipio: '',
                nombreContacto: '',
                cTaxId: ''
              }
            }
          }
        } catch (ex) {
          console.error('EXCEPTION GET INFO BY NIT SERVICE', ex)
          return {
            code: appCodes.processError,
            data: {
              country: '',
              departamento: '',
              direccion: '',
              municipio: '',
              nombreContacto: '',
              cTaxId: ''
            }
          }
        }
      })
      .catch(err => {
        console.error('ERROR CATCH GET INFO BY NIT SERVICE', err)
        return {
          code: appCodes.processError,
          data: {
            country: '',
            departamento: '',
            direccion: '',
            municipio: '',
            nombreContacto: '',
            cTaxId: ''
          }
        }
      })
  }

  const addUserService = async ({
    requestor,
    taxid,
    userName,
    country,
    usuario,
    nombres,
    apellidos,
    email,
    telefono,
    permisos,
    acciones,
    establecimientos
  }: FetchProps&{
    nombres: string
    apellidos: string
    email: string
    telefono: string
    permisos: string
    acciones: string;
    establecimientos: string
  }): Promise<{
    code: number;
    error?: string
}> => {
    const bodyUsuario = `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>${requestor}</Requestor>
        <Transaction>CREATE_USER</Transaction>
        <Country>${country}</Country>
        <Entity>${taxid}</Entity>
        <User>${requestor}</User>
        <UserName>${country}.${taxid}.${userName}</UserName>
        <Data1><![CDATA[<Dictionary name="UserParams"><Entry k="CountryCode" v="GT" /><Entry k="TaxID" v="${taxid}" /><Entry k="UserName" v="${usuario}" /><Entry k="FirstNames" v="${nombres}" /><Entry k="LastNames" v="${apellidos}" /><Entry k="EMail" v="${email}" /><Entry k="Phone" v="${telefono}" /><Entry k="Extension" v="" /><Entry k="FAX" v="" /><Entry k="DeniedRights" v="0" /><Entry k="GrantedRights" v="274877906935" /><Entry k="BIBranch" v="" /><Entry k="Device" v="0" /></Dictionary>]]></Data1>
        <Data2></Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    return globalThis.fetch(urlWsSoap, {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: bodyUsuario
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            console.log('USUARIO REGISTRADO', data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result)
            return addEditUserRights({ requestor, taxid, userName, country, permisos, usuario })
              .then(res => {
                if (res.code === appCodes.ok) {
                  return addEditUserActionsRights({ requestor, taxid, userName, country, acciones, usuario })
                    .then(resA => {
                      if (resA.code === appCodes.ok) {
                        return addEditUserBranchRights({ requestor, taxid, userName, country, establecimientos, usuario })
                          .then(resB => {
                            if (resB.code === appCodes.ok) {
                              return {
                                code: appCodes.ok
                              }
                            } else {
                              return {
                                code: appCodes.processError,
                                error: 'MUERE EN BRANCH'
                              }
                            }
                          })
                      } else {
                        return {
                          code: appCodes.processError,
                          error: 'MUERE EN ACTIONS'
                        }
                      }
                    })
                } else {
                  return {
                    code: appCodes.processError,
                    error: 'MUERE EN RIGHTS'
                  }
                }
              })
          } else {
            return {
              code: appCodes.processError
            // data: ''
            }
          }
        } catch (ex) {
          console.warn('EXCEPTION ADD EDIT USER SERVICE TRY/CATCH', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.warn('ERROR CATCH ADD EDIT USER SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: []
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const editUserService = async ({
    requestor,
    taxid,
    userName,
    country,
    usuario,
    nombres,
    apellidos,
    email,
    telefono,
    permisos,
    acciones,
    establecimientos
  }: FetchProps&{
    nombres: string
    apellidos: string
    email: string
    telefono: string
    permisos: string
    acciones: string;
    establecimientos: string
  }): Promise<{
    code: number;
    error?: string
}> => {
    const bodyUsuario = `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>${requestor}</Requestor>
        <Transaction>EXEC_STORED_PROC</Transaction>
        <Country>${country}</Country>
        <Entity>${taxid}</Entity>
        <User>${requestor}</User>
        <UserName>${country}.${taxid}.${userName}</UserName>
        <Data1>StoreUserData</Data1>
        <Data2>${country}|${taxid}|${usuario}|${nombres}|${apellidos}|${email}|${telefono}|--|--|0|274875809255||0</Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    console.log('QUERY EDIT USER', bodyUsuario)
    return globalThis.fetch(urlWsSoap, {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: bodyUsuario
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return addEditUserRights({ requestor, taxid, userName, country, permisos, usuario })
              .then(res => {
                if (res.code === appCodes.ok) {
                  return addEditUserActionsRights({ requestor, taxid, userName, country, acciones, usuario })
                    .then(resA => {
                      if (resA.code === appCodes.ok) {
                        return addEditUserBranchRights({ requestor, taxid, userName, country, establecimientos, usuario })
                          .then(resB => {
                            if (resB.code === appCodes.ok) {
                              return {
                                code: appCodes.ok
                              }
                            } else {
                              return {
                                code: appCodes.processError,
                                error: 'MUERE EN BRANCH'
                              }
                            }
                          })
                      } else {
                        return {
                          code: appCodes.processError,
                          error: 'MUERE EN ACTIONS'
                        }
                      }
                    })
                } else {
                  return {
                    code: appCodes.processError,
                    error: 'MUERE EN RIGHTS'
                  }
                }
              })
          } else {
            return {
              code: appCodes.processError,
              error: 'MUERE EDITANDO EL USUARIO '
            }
          }
        } catch (ex) {
          console.warn('EXCEPTION ADD EDIT USER SERVICE TRY/CATCH', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.warn('ERROR CATCH ADD EDIT USER SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: []
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const deleteUserService = async ({
    requestor,
    taxid,
    userName,
    country,
    usuario
  }: FetchProps): Promise<{
  code: number
}> => {
    const body = `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
          <Requestor>${requestor}</Requestor>
          <Transaction>SHARED_INFO_EFACE</Transaction>
          <Country>${country}</Country>
          <Entity>${taxid}</Entity>
          <User>${requestor}</User>
          <UserName>${country}.${taxid}.${userName}</UserName>
          <Data1>SHARED_NFRONT_DELETEUSER</Data1>
          <Data2>ScountryCode|${country}|Username|${usuario}</Data2>
          <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    console.log('DELETE USER REQUEST ', body)
    return globalThis.fetch(urlWsSoap, {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (ex) {
          console.log('EXCEPTION DELETE USER SERVICE', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH DELETE USER SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const getDocumentService = async ({
    requestor,
    taxid,
    userName,
    documentType,
    country,
    numeroAuth,
    signal
  }: FetchProps & {
    documentType: 'XML'|'PDF'|'HTML'
    numeroAuth: string|number
  }): Promise<{
  code: number
  data: DocumentTypes
}> => {
    return globalThis.fetch(urlWsSoap, {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>${requestor}</Requestor>
        <Transaction>FEL_GET_DOCUMENT</Transaction>
        <Country>${country}</Country>
        <Entity>${taxid}</Entity>
        <User>${requestor}</User>
        <UserName>${userName}</UserName>
        <Data1>${numeroAuth}</Data1>
        <Data2></Data2>
        <Data3>${documentType}</Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    })
      .then(res => res.text())
      .then(response => {
        try {
          const dataParser = parser.parse(response)
          const XML = dataParser.Envelope.Body.RequestTransactionResponse
            .RequestTransactionResult.ResponseData.ResponseData1
          const HTML = dataParser.Envelope.Body.RequestTransactionResponse
            .RequestTransactionResult.ResponseData.ResponseData2

          const PDF = dataParser.Envelope.Body.RequestTransactionResponse
            .RequestTransactionResult.ResponseData.ResponseData3

          return {
            code: appCodes.ok,
            data: {
              XML,
              HTML,
              PDF
            }
          }
        } catch (ex) {
          console.log('ERROR EXCEPTION GET DOCUMENT SERVICE', ex)
          return {
            code: appCodes.processError,
            data: {
              XML: '',
              HTML: '',
              PDF: ''
            }
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET DOCUMENT SERVICE', err)
        return {
          code: appCodes.processError,
          data: {
            XML: '',
            HTML: '',
            PDF: ''
          }
        }
      })
  }

  const sendDTEForEmailService = async ({
    taxid,
    authorizationNumber,
    email
  }: {
    taxid: string;
    authorizationNumber: string|number;
    email: string
  }): Promise<{
  code: number
}> => {
    const stringdata1 =
    `
    <Dictionary name = "StoredXmlSelector" ><Entry k="Store" v="issued"/><Entry k="IssuerCountryCode" v="GT"/><Entry k="IssuerTaxId" v="${taxid}"/><Entry k="DocumentGUID" v="${authorizationNumber}"/></Dictionary >
      `
    const stringEncoded = base64.encode(stringdata1)

    const stringdata2 =
    `
      <Procesamiento><Dictionary name="email"><Entry k="from" v="pruebaemail@documentagface.com" /><Entry k="fromName" v="Digifact" /><Entry k="to" v="${email}" /><Entry k="subject" v="Factura Electronica" /><Entry k="formats" v="pdf" /><Entry k="body template name" v="mail_default_digifactnew.html" /></Dictionary></Procesamiento >
        `
    const stringEncoded2 = base64.encode(stringdata2)
    const xml =
    `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
        <Transaction>QUEUE_FOR_DISTRIBUTION</Transaction>
        <Country>GT</Country>
        <Entity>000000123456</Entity>
        <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
        <UserName>GT.000000123456.admon</UserName>
        <Data1>${stringEncoded}</Data1>
        <Data2>${stringEncoded2}</Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    return globalThis.fetch(urlWsSoap, {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    }).then(res => res.text())
      .then(response => {
        const dataResponse = parser.parse(response)
        console.log('EMAIL RESPONSE', dataResponse)
        try {
          return {
            code: appCodes.ok
          }
        } catch (err) {
          console.log('EXCEPTION SEND DTE EMAIL SERVICE', err)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR SEND DTE EMAIL SERVICE', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const cancelDTEService = async ({
    token = '',
    userName,
    taxid,
    authorizationNumber,
    fechaEmision,
    nitReceptor,
    motivoAnulacion
  }: FetchProps&{
    authorizationNumber: string|number;
    fechaEmision: string;
    nitReceptor: string|number;
    motivoAnulacion: string
  }): Promise<{
  code: number
}> => {
    const tzoffset = (new globalThis.Date()).getTimezoneOffset() * 60000
    const localISOTime = (new globalThis.Date(globalThis.Date.now() - tzoffset)).toISOString()
    console.log('Token', token)
    const xml = `<?xml version = '1.0' encoding = 'utf-8' ?>
  <dte:GTAnulacionDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    Version="0.1">
    <dte:SAT>
      <dte:AnulacionDTE ID="DatosCertificados">
        <dte:DatosGenerales ID="DatosAnulacion" NumeroDocumentoAAnular="${authorizationNumber}" NITEmisor="${taxid.replace(/0+(?!$)/, '')}"
          IDReceptor="${nitReceptor}" FechaEmisionDocumentoAnular="${new globalThis.Date(fechaEmision.replace(' ', 'T')).toISOString().replace(/z/gi, '')}"
          FechaHoraAnulacion="${localISOTime.replace(/z/gi, '')}" MotivoAnulacion="(${userName})${motivoAnulacion}" />
      </dte:AnulacionDTE>
    </dte:SAT>
  </dte:GTAnulacionDocumento>`
    console.log('CANCEL XML', xml)
    return globalThis.fetch(`${urlWsRestV2}FELRequest?NIT=${taxid}&TIPO=ANULAR_FEL_TOSIGN&FORMAT=PDF`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/xml',
        Authorization: token
      },
      body: xml
    })
      .then(response => {
        console.log('RESPONSE CANCEL DTE SERVICE', response)
        return {
          code: response.ok ? appCodes.ok : appCodes.processError
        }
      })
      .catch(err => {
        console.log('ERROR CANCEL DTE SERVICE', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const addEditProductServiceTS = async ({
    item
  }: {item: Producto}): Promise<{
  code: number
}> => {
    const xml = addEditProductsXml(item)
    return globalThis.fetch(urlsByCountry?.[user?.country || '']?.urlWsSoap || '', {
      method: 'post',
      headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
      body: xml
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (ex) {
          console.log('EXCEPTION ADD EDIT PRODUCT SERVICE', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH ADD EDIT PRODUCT SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: []
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const deleteProductServiceTS = async ({
    item
  }: {
    item: Producto
    }): Promise<{code: number}> => {
    const { ean } = item
    const xml = deleteProductsXml({ ean: ean || '' })
    return globalThis.fetch(urlsByCountry?.[user?.country || '']?.urlWsSoap || '', {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (ex) {
          console.log('EXCEPTION ADD EDIT PRODUCT SERVICE', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH ADD EDIT PRODUCT SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: []
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  /**
 * It makes a POST request to a SOAP endpoint, parses the response, and returns an object with a code
 * and data property.
 * @param  - {
 * @returns DATAAA {
 *   CC: 'GT',
 *   Cd: '01',
 *   Cm: '01',
 *   Direccion: '',
 *   N: '',
 *   TID: '123456789'
 * }</code>
 */
  const validateNITService = async ({
    nit
  }: {
  nit: string
  }): Promise<{
  code: number;
  data: NitService
}> => {
    return globalThis.fetch(urlWsSoap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
        <Transaction>EXEC_STORED_PROC</Transaction>
        <Country>GT</Country>
        <Entity>000000123456</Entity>
        <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
        <UserName>GT.000000123456.admon</UserName>
        <Data1>PLANILLACC_GetInfoNIT</Data1>
        <Data2>NIT|${nit}</Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    })
      .then(res => res.text())
      .then(response => {
        try {
          const dataParser = parser.parse(response)
          const validation = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
          const data = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          console.log('DATAAA', data)
          if (validation === 1) {
            return {
              code: appCodes.ok,
              data: {
                country: data?.CC || '',
                departamento: data?.Cd || '',
                municipio: data?.Cm || '',
                direccion: data?.Direccion || '',
                nombre: data?.N || '',
                taxid: data?.TID || ''
              }
            }
          }
          return {
            code: appCodes.invalidData,
            data: {
              country: '',
              departamento: '',
              municipio: '',
              direccion: '',
              nombre: '',
              taxid: ''
            }
          }
        } catch (ex) {
          console.log('EXCEPTION GET VALIDATE NIT SERVICE', ex)
          return {
            code: appCodes.processError,
            data: {
              country: '',
              departamento: '',
              municipio: '',
              direccion: '',
              nombre: '',
              taxid: ''
            }
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET VALIDATE NIT SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: {
              country: '',
              departamento: '',
              municipio: '',
              direccion: '',
              nombre: '',
              taxid: ''
            }
          }
        }
        return {
          code: appCodes.processError,
          data: {
            country: '',
            departamento: '',
            municipio: '',
            direccion: '',
            nombre: '',
            taxid: ''
          }
        }
      })
  }

  /**
 * It takes an object with three properties, RUC, tipo, and token, and returns an object with two
 * properties, code and data.
 *
 * The code property is a number, and the data property is an object with three properties, DV,
 * nombreContacto, and TipoRuc.
 *
 * The DV property is a number, the nombreContacto property is a string, and the TipoRuc property is a
 * number.
 *
 * The tipo property is optional, and if it is not provided, it will default to 1.
 *
 * The function will make a fetch request to a URL, and if the response is successful, it will return
 * an object with the code property set to appCodes.ok, and the data property set to an object with the
 * DV, nombreContacto, and TipoRuc properties set to the values from the
 * @Params
 * @string  - RUC
 * @number  - tipo
 * @string  - token
 * @returns An object with two properties: code and data.
 */

  const verifyRUC = async ({
    RUC,
    tipo,
    token
  }: {
    RUC: string
    tipo?: number
    token: string
}): Promise<{
    code: number
    data?: {
        DV: number
        nombreContacto: string
        tipoCliente: number
        tipoContribuyente: string
        estado: string
    }
}> => {
    const genericTypes: number[] = []
    if (tipo && Number(tipo) !== 9000) {
      genericTypes.push(tipo)
    } else {
      genericTypes.push(1)// 1 - NATURAL, 2 - JURIDICO
      genericTypes.push(2)
    }
    let responseRUC: {
        code: number
        data?: {
            DV: number
            nombreContacto: string
            tipoCliente: number
            tipoContribuyente: string
            estado: string
        }
    } = {
      code: appCodes.dataVacio
    }
    for (const t of genericTypes) {
      await globalThis.fetch(`${urlApiNUC}/GetInfoRuc?RUC=${RUC}&TIPO=${t}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      })
        .then(res => res.json())
        .then(response => {
          if (response?.Ok === true) {
            responseRUC = {
              code: appCodes.ok,
              data: {
                DV: response.DV,
                nombreContacto: response.Nombre,
                tipoCliente: response.TipoRuc,
                tipoContribuyente: response.Tipo,
                estado: response.Estado
              }
            }
          }
        })
    }
    return responseRUC
  }

  const addEditClientServiceTS = async ({ signal = new AbortController().signal, item }: { signal?: AbortSignal, item: Cliente}): Promise<{code: number}> => {
    const xml = addEditClientXml(item)
    console.log('XML A AGREGAR/EDITAR CLIENTE', xml)
    return globalThis.fetch(urlsByCountry?.[user?.country || '']?.urlWsSoap || '', {
      signal,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=UTF-8'
      },
      body: xml
    })
      .then(res => res.text())
      .then(response => {
        const dataParser = parser.parse(response)
        try {
          if (dataParser?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.Response?.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (err) {
          console.error('ERROR CATCH EXCEPTION EN ADD CLIENT SERVICE TS', err)
          return {
            code: appCodes.processError
          }
        }
      }).catch(err => {
        console.error('ERROR CATCH EN ADD CLIENT SERVICE TS', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const deleteClientServiceTS = async ({ item, signal = new AbortController().signal }: {item: Cliente, signal?: AbortSignal}): Promise<{code: number}> => {
    const xml = deleteClientXml(item)
    console.log('COMOOO', xml)
    return globalThis.fetch(urlsByCountry?.[user?.country || '']?.urlWsSoap || '', {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    })
      .then(res => res.text())
      .then(response => {
        try {
          const dataParsed = parser.parse(response)
          if (dataParsed?.Envelope?.Body?.RequestTransactionResponse?.RequestTransactionResult?.Response?.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (ex) {
          console.log('EXCEPTION DELETE CLIENT SERVICE TS', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch((err: Error) => {
        console.log('CATCH ERROR DELETE CLIENT SERVICE TS', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const addEditUserActionsRights = async ({
    requestor,
    taxid,
    userName,
    country,
    acciones,
    usuario
  }: FetchProps&{acciones: string}): Promise<{
  code: number;
  error?: string | number;
  error2?: string|number
}> => {
    const bodyAcciones = `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd= "http://www.w3.org/2001/XMLSchema"
xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>SHARED_INFO_EFACE</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${country}.${taxid}.${userName}</UserName>
      <Data1>SHARED_NFRONT_UPSERT_USER_ACTION_RIGHTS</Data1>
      <Data2>STAXID|${taxid}|USERNAME|${usuario}|DATA|${acciones}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
</soap:Envelope>`
    console.log('BODY ACCIONEs', bodyAcciones)
    return globalThis.fetch(urlWsSoap, {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: bodyAcciones
    })
      .then(resA => resA.text())
      .then(responseA => {
        try {
          const dataA = parser.parse(responseA)
          if (dataA.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.processError,
            error: dataA.Envelope.Body.RequestTransactionResponse.RequestTransactionResult,
            error2: 'ERROR EN RESPONSE DE ACCIONES'
          }
        } catch (ex) {
          console.log('EXCEPTION ADD EDIT USER ACCIONES TRY/CATCH', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH ADD EDIT USER ACCIONES SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const addEditUserRights = async ({
    requestor,
    taxid,
    userName,
    country,
    permisos,
    usuario
  }: FetchProps&{permisos: string}): Promise<{
  code: number;
  error?: string | number;
  error2?: string|number
}> => {
    const bodyPermisos = `<?xml version = "1.0" encoding = "utf-8" ?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
            <Requestor>${requestor}</Requestor>
            <Transaction>EXEC_STORED_PROC</Transaction>
            <Country>${country}</Country>
            <Entity>${taxid}</Entity>
            <User>${requestor}</User>
            <UserName>${country}.${taxid}.${userName}</UserName>
            <Data1>SHARED_NFRONT_UPSERT_USER_RIGHTS2</Data1>
            <Data2>SCountryCode|${country}|STAXID|${taxid}|USERNAME|${usuario}|DATA|${permisos}</Data2>
            <Data3></Data3>
        </RequestTransaction>
      </soap:Body>
  </soap:Envelope>`
    return globalThis.fetch(urlWsSoap, {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      body: bodyPermisos
    })
      .then(resP => resP.text())
      .then(responseP => {
        try {
          const dataP = parser.parse(responseP)
          if (dataP.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return {
              code: appCodes.ok
            }
          }
          return {
            code: appCodes.processError,
            error: dataP.Envelope.Body.RequestTransactionResponse.RequestTransactionResult,
            error2: 'ERROR EN RESPONSE DE PERMISOS'
          }
        } catch (ex) {
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.log('ERROR CATCH ADD EDIT USER PERMISOS SERVICE', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const addEditUserBranchRights = async ({
    requestor,
    taxid,
    userName,
    country,
    establecimientos,
    usuario
  }: FetchProps & { establecimientos: string}) => {
    const bodyEstablecimientos = `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd= "http://www.w3.org/2001/XMLSchema"
xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>SHARED_INFO_EFACE</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${country}.${taxid}.${userName}</UserName>
      <Data1>SHARED_NFRONT_UPSERTBIBRANCHRIGHTS</Data1>
      <Data2>STAXID|${taxid}|Username|${usuario}|BRANCHRIGHTS|${establecimientos}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
  </soap:Envelope>`
    return globalThis.fetch(urlWsSoap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: bodyEstablecimientos
    })
      .then(resE => resE.text())
      .then(responseE => {
        try {
          const dataE = parser.parse(responseE)
          if (dataE.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
            return {
              code: appCodes.ok
            }
          } else {
            return {
              code: appCodes.processError,
              error: dataE.Envelope.Body.RequestTransactionResponse.RequestTransactionResult,
              error2: 'ERROR EN RESPONSE DE ESTABLECIMIENTOS'
            }
          }
        } catch (ex) {
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok,
            data: []
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }

  const getTalonarioContingencia = async ({
    batchId,
    taxid,
    branches,
    qtyRequested
  }: {
    batchId: string | number;
    taxid: string;
    branches: Branch[];
    qtyRequested: string|number
}): Promise<any[]> => {
    let serial: string = DeviceInfo.getSerialNumberSync()
    if (serial.toUpperCase() === 'UNKNOWN') {
      serial = DeviceInfo.getUniqueIdSync()
    }
    const promises = []
    for (const branch of branches) {
      const xml = `<ContingencyRequest>         
              <BatchId>${batchId}</BatchId>
              <NitEmisor>${taxid}</NitEmisor>
              <Serial>${serial}</Serial>  
              <StoreId>${branch.numero}</StoreId>
              <QtyRequested>${qtyRequested}</QtyRequested>  
            </ContingencyRequest>`
      const response = globalThis.fetch('https://felgtaws.digifact.com.gt/DigifactAPP/api/ContingenciasAPP', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml', Accept: 'application/json' },
        body: xml
      }).then(resT => resT.json())
        .then(responseT => {
          return responseT?.ContingencyNumber
        })
        .catch(err => {
          console.warn(err)
          return []
        })
      promises.push(response)
    }
    // console.log(Promise.all(promises))
    return Promise.all(promises)
  }

  const getXMLTransformation = async ({ json }: {json: any}): Promise<{
  code: number;
  data?: string
}> => {
    return globalThis.fetch(urlXMLTransformation, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    }).then(resT => resT.json())
      .then(responseT => {
        console.log(responseT)
        if (responseT?.Respuesta) {
          return {
            code: appCodes.ok,
            data: responseT.XMLBase64
          }
        }
        return {
          code: appCodes.invalidData
        }
      })
      .catch(err => {
        console.warn(err)
        return {
          code: appCodes.processError
        }
      })
  }

  const certContingencia = async ({
    xmlFactura,
    user
  }: {
  xmlFactura: string,
  user: User
  }): Promise<{
  code: number
}> => {
    return globalThis.fetch(`${urlWsRest}FelRequestV2?NIT=${user.taxid}&TIPO=CERTIFICATE_DTE_XML_TOSIGN&FORMAT=XML&USERNAME=${user.userName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml;charset=UTF-8', Authorization: user.token, Accept: 'application/json' },
      body: xmlFactura
    }).then(res => res.json())
      .then(response => {
        if (response?.Codigo === 1) {
          return {
            code: appCodes.ok,
            data: response
          }
        } else if (response?.Codigo === 0) {
          return {
            code: appCodes.unauthorized
          }
        } else {
          console.log('Ocurrio un error certificando el documento: ' + response?.ResponseDATA1)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch(err => {
        console.warn('ERROR AL CERTIFICAR CONTINGENCIA', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const addContingencia = async ({
    invoice,
    ne,
    serialTerminal,
    numAcceso,
    user
  }: {
  invoice: Invoice
  ne: string | number;
  serialTerminal: string | number;
  numAcceso: number | string;
  user: User;
  }): Promise<{
  code: number,
  data?: boolean
}> => {
    const xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>${user.requestor}</Requestor>
        <Transaction>SHARED_INFO_EFACE</Transaction>
        <Country>GT</Country>
        <Entity>${user.taxid}</Entity>
        <User>${user.requestor}</User>
        <UserName>GT.${user.taxid}.admon</UserName>
        <Data1>SHARED_NFRONT_ADDCONTINGENCIAAPP</Data1>
        <Data2>SCountryCode|GT|NIT|${user.taxid}|NE|${ne}|TERMINAL|${serialTerminal}|NUMACCESO|${numAcceso}|DOCUMENTGUID|${invoice.Autorizacion}|SERIE|${invoice.Serie}|NUMERO|${invoice.NUMERO}|FECHACONTINGENCIA|${invoice.Fecha_de_certificacion}</Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
</soap:Envelope>`
    console.log('QUERY DE ANADIR CONTINGENCIA REGISTRO ALTERNO', xml)
    return globalThis.fetch(urlWsSoap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml', Accept: 'application/json' },
      body: xml
    }).then(res => res.text())
      .then(response => {
        const data = parser.parse(response)
        if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result) {
          return {
            code: appCodes.ok,
            data: true
          }
        } else {
          return {
            code: appCodes.processError,
            error: 301
          }
        }
      })
      .catch(() => {
        return {
          code: appCodes.processError
        }
      })
  }

  const agregarErrorContingencia = async ({
    invoiceB64,
    numAcceso,
    user,
    error
  }: {
    invoiceB64: string;
    numAcceso: string | number;
    user: User;
    error?: number | string;
}): Promise<{
    code: number;
    data?: boolean;
    error?: number | undefined;
}> => {
    const request = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>GT</Country>
      <Entity>000000123456</Entity>
      <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
      <UserName>GT.000000123456.admon</UserName>
      <Data1>PLANILLACC_ADDERRORCONTINGENCIAAPP</Data1>
      <Data2>NIT|${user.taxid}|NUMACCESO|${numAcceso}|ERROR|${error}|JSON64|${invoiceB64}</Data2>
      <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
    console.log(request)
    return globalThis.fetch(urlWsSoap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: request
    })
      .then(res => res.text())
      .then(response => {
        const data = parser.parse(response)
        console.log(data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult)
        if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1 === 0) {
          return {
            code: appCodes.ok,
            data: true
          }
        } else {
          return {
            code: appCodes.processError,
            error: 301
          }
        }
      }).catch(err => {
        console.warn('ERROR EN ENVIAR ERROR CONTINGENCIA', err)
        return {
          code: appCodes.processError,
          error: 301
        }
      })
  }

  const getProductsResumen = async ({ user, filter }: {user: FetchProps, filter: Filter}): Promise<{
    code?: number;
    data?: ProductoResumen[];
    error?: number | undefined;
}> => {
    const request = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
          <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
              <Requestor>${user.requestor}</Requestor>
              <Transaction>EXEC_STORED_PROC</Transaction>
              <Country>${user.country}</Country>
              <Entity>${user.taxid}</Entity>
              <User>${user.requestor}</User>
              <UserName>${user.userName}</UserName>
              <Data1>PLANILLACC_GetProductResume</Data1>
              <Data2>FechaI|${filter?.fechaInicio || ''}|FechaF|${filter?.fechaFin || ''}|Staxid|${user?.taxid || ''}|SCountryCode|${user?.country || ''}|BIBranch|${filter?.establecimientos?.numero || ''}|RtaxID|${filter.nitReceptor || ''}|DCurrency||Cancelled|${filter?.porAnulados?.value || '-1'}|SKind|${filter?.tipoDocumento?.no || '0'}|Issued|1|moneda|0</Data2>
              <Data3></Data3>
          </RequestTransaction>
      </soap:Body>
  </soap:Envelope>`
    console.log('QUERY', request)
    return globalThis.fetch(urlWsSoap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: request
    })
      .then(res => res.text())
      .then(response => {
        try {
          const data = parser.parse(response)
          const rowData = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          if (data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1 > 0) {
            const array = []
            array.push(rowData)
            const data: ProductoResumen[] = array.flat().map(e => {
              const obj: ProductoResumen = {
                descripcion: '',
                cantidad: '',
                total: '',
                iva: '',
                idp: '',
                idt: '',
                tml: '',
                itp: '',
                ibv: '',
                tabaco: ''
              }
              obj.descripcion = e.ItemDescription || ''
              obj.cantidad = e.CANTIDAD || ''
              obj.total = e.Total || ''
              obj.iva = e.IVA || ''
              obj.idp = e.IDP || ''
              obj.idt = e.IDT || ''
              obj.tml = e.TML || ''
              obj.itp = e.ITP || ''
              obj.ibv = e.IBV || ''
              obj.tabaco = e.TACABO || ''
              return obj
            })
            return {
              code: appCodes.ok,
              data
            }
          } else {
            return {
              code: appCodes.dataVacio,
              error: 301
            }
          }
        } catch (ex) {
          console.log('AGLO SALIO MAL AL OBTENER REPORTE', ex)
          return {
            code: appCodes.processError,
            error: 301
          }
        }
      })
      .catch(err => {
        console.warn('ERROR AL OBTENER RESUMEN PRODUCTOS', err)
        return {
          code: appCodes.processError,
          error: 301
        }
      })
  }

  const uploadLogoService = async ({ taxid = '', extension = 'jpg', codigoEstablecimiento = '', logobase64 = '', APIMSTOKEN = '' }) => {
    return globalThis.fetch(`${urlApiMs}/Logo/Upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: APIMSTOKEN
      },
      body: JSON.stringify({
        taxid,
        extension,
        codigoEstablecimiento: `${codigoEstablecimiento}${codigoEstablecimiento ? '_APP' : ''}`,
        logobase64
      })
    })
      .then(res => res.json())
      .then(response => {
        console.log('RESPUESTA UPLOAD LOGO SERVICE', response)
        if (response?.response?.includes('Logo cargado con exito')) {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.processError
        }
      })
      .catch(err => {
        console.log('ERROR UPLOAD LOGO SERVICE', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const getAllPerfilFacturacionServiceTS = async ({
    taxid = '',
    country = ''
  }: {
    taxid: string
    country: string
}): Promise<{
    code: number
    data: PerfilFacturacionType[],
    key: string
}> => {
    return globalThis.fetch(`${urlsByCountry?.[country]?.urlApiMs || ''}profiles/get_perfil_fact?TAXID=${taxid}`, {
      method: 'GET'
    })
      .then(res => res.json())
      .then(response => {
        if (response?.perfiles) {
        // console.log(response?.perfiles)
          const arr: any[] = []
          arr.push(response?.perfiles || [])
          const data: PerfilFacturacionType[] = arr.flat().map(item => {
          // console.log(item?.ListaProductos)
            const obj: PerfilFacturacionType = {
              DestinoOperacion: item?.DestinoOperacion || '',
              EntregaCAFE: item?.EntregaCAFE || '',
              EnvioContenedor: item?.EnvioContenedor || '',
              FechaSalida: item?.FechaSalida || '',
              FormatoCAFE: item?.FormatoCAFE || '',
              InformacionInteres: item?.InformacionInteres || '',
              NaturalezaOperacion: item?.NaturalezaOperacion || '',
              Nombre: item?.Nombre || '',
              RazonContingencia: item?.RazonContingencia || '',
              TipoOperacion: item?.TipoOperacion || '',
              TipoSucursal: item?.TipoSucursal || '',
              TipoVenta: item?.TipoVenta || '',
              ListaProductos: item?.ListaProductos || [],
              MetodoPago: item?.MetodoPago,
              PagoPredeterminado: item?.PagoPredeterminado,
              ProductsPredeterminados: item?.ProductsPredeterminados
            }
            return obj
          })
          return {
            code: appCodes.ok,
            data,
            key: 'perfiles'
          }
        }
        return {
          code: appCodes.dataVacio,
          data: [],
          key: 'perfiles'
        }
      })
      .catch(err => {
        console.log('ERROR CATCH GET ALL PERFILES FACTURACION SERVICE TS', err)
        return {
          code: appCodes.processError,
          data: [],
          key: 'perfiles'
        }
      })
  }

  const deletePerfilFacturacionServiceTS = async ({
    taxid = '',
    item
  }: {
    taxid: string
    item: PerfilFacturacionType
}): Promise<{ code: number }> => {
    return globalThis.fetch(`${urlsByCountry?.[country]?.urlApiMs || ''}/profiles/perfil_fact?TAXID=${taxid}&TYPE=0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
      .then(res => res.json())
      .then(response => {
        console.log('RESPONSE DELETE PERFIL FACTURACION SERVICE TS ', response)
        if (response?.response === 'Peticion exitosa') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.dataVacio
        }
      })
      .catch(err => {
        console.log('ERROR CATCH  DELETE PERFILES FACTURACION SERVICE TS', err)
        return {
          code: appCodes.processError
        }
      })
  }

  const addEditPerfilFacturacionServiceTS = async ({
    taxid = '',
    item
  }: {
    taxid: string
    item: PerfilFacturacionType
  }): Promise<{code: number}> => {
    return globalThis.fetch(`${urlsByCountry?.[country]?.urlApiMs || ''}/profiles/perfil_fact?TAXID=${taxid}&TYPE=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
      .then(res => res.json())
      .then(response => {
        console.log('RESPONSE ADD EDIT PERFIL FACTURACION SERVICE TS ', response)
        if (response?.response === 'Peticion exitosa') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.dataVacio
        }
      })
      .catch(err => {
        console.log('ERROR CATCH  ADD EDIT PERFILES FACTURACION SERVICE TS', err)
        return {
          code: appCodes.processError
        }
      })
  }

  return {
    getCertTokenServiceTS,
    getAllClientsServiceTS,
    addEditClientServiceTS,
    deleteClientServiceTS,
    deleteProductServiceTS,
    getAllProductsServiceTS,
    addEditProductServiceTS,
    getCountryCodesServiceTS,
    getInfoByNITService,
    verifyRUC,
    getAccountDetailsServiceTS,
    getTokenMIPOSServiceTS,
    getInfoFiscalServiceTS,
    getAllEstablecimientosServiceTS,
    getAllPerfilFacturacionServiceTS,
    getConfigAppServiceTS,
    getCatalogPermissionsFatherServiceTS,
    getCatalogPermissionsActionsServiceTS,
    getPermissionsServiceTS,
    getAllUsersByTaxIdServiceTS,
    getLogosServiceTS,
    getDecimalesServiceTS,
    getProvinciasServiceTS,
    getDistritosServiceTS,
    getCorregimientosServiceTS,
    getCurrenciesServiceTS,
    getIncoTermsServiceTS,
    getSegmentosServiceTS,
    getFamiliasServiceTS,
    getUnitMeasurementServiceTS,
    recoverPasswordServiceTS,
    getDtesServiceTS
  }
}
