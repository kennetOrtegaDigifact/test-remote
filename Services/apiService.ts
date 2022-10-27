import { XMLParser } from 'fast-xml-parser'
import base64 from 'react-native-base64'
import { urlApiMs, urlWsRest, urlWsRestV2, urlWsSoap, urlWsToken, urlXMLTransformation } from '../Config/api'
import { establecimientosSpliter } from '../Config/utilities'
import DeviceInfo from 'react-native-device-info'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { options } from '../Config/xmlparser'
import { appCodes } from '../Config/appCodes'
import { InfoFiscalUser, SharedData, Establecimiento, ConfiguracionApp, PermisosPadre, PermisoPorAccion, Logos } from '../types'
const parser = new XMLParser(options)
export const loginService = async ({ Username = '', Password = '', taxid = '', user = '', country = '', nit = '' }) => {
  console.log('BODY LOGIN JSON', JSON.stringify({ Username, Password, nit }))
  return globalThis.fetch(urlWsToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username, Password })
  }).then(res => res.json())
    .then(response => {
      // console.log('RESPONSE GET TOKEN', response)
      if (response.code !== 2001) {
        return globalThis.fetch(`${urlApiMs}/login/get_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: Username, password: Password })
        })
          .then(r => r.json())
          .then(responseMS => {
            // console.log('RESPONSE API MS', responseMS)

            return getTokenMIPOSService({ nit, Password, taxid, Username, user })
              .then(responseMIPOSTOKEN => {
                const MIPOS = responseMIPOSTOKEN
                console.log('MIPOS TOKENS', MIPOS)
                if (responseMS?.Token) {
                  const Token = response.Token
                  const APIMSTOKEN = responseMS.Token
                  return globalThis.fetch(urlWsSoap, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/xml' },
                    body: `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xsd="http://www.w3.org/2001/XMLSchema"
      xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
            <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
            <Transaction>EXEC_STORED_PROC</Transaction>
            <Country>${country}</Country>
            <Entity>000000123456</Entity>
            <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
            <UserName>GT.0000001234565.RESTLET</UserName>
            <Data1>Account_Status_1</Data1>
            <Data2>${taxid}</Data2>
            <Data3></Data3>
          </RequestTransaction>
        </soap:Body>
      </soap:Envelope>`
                  })
                    .then(res => res.text())
                    .then(requestorResponse => {
                      const data = parser.parse(requestorResponse)
                      // console.log('RESPONSE REQUESTOR', data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T.RequestorGUID)
                      const count = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
                      if (count > 0) {
                        const requestor = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T.RequestorGUID
                        return globalThis.fetch(urlWsSoap, {
                          method: 'post',
                          headers: { 'Content-Type': 'text/xml' },
                          body: `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                            <soap:Body>
                                <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
                                <Requestor>${requestor}</Requestor>
                                <Transaction>SHARED_INFO_EFACE</Transaction>
                                <Country>${country}</Country>
                                <Entity>${taxid}</Entity>
                                <User>${requestor}</User>
                                <UserName>${country}.${taxid}.admon</UserName>
                                <Data1>SHARED_NFRONT_GETINFOFISCALFELBYPARTNER_2</Data1>
                                <Data2>SCountryCode|${country}</Data2>
                                <Data3></Data3>
                            </RequestTransaction>
                            </soap:Body>
                        </soap:Envelope>`
                        })
                          .then(res => res.text())
                          .then(infoFiscal => {
                            const info = parser.parse(infoFiscal)
                            // console.log('INFO FISCAL RESPONSE', info.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T)
                            const infoCount = info.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
                            if (infoCount > 0) {
                              const rinf = info.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
                              const infoFiscalUser: InfoFiscalUser = {
                                nombre: '',
                                calle: '',
                                ciudad: '',
                                zona: '',
                                frases: '',
                                afiliacion: '',
                                postalEstablecimientos: 1010,
                                establecimientos: establecimientosSpliter({ establecimientos: '' }),
                                dirEstablecimientos: '',
                                cm: '',
                                tipoPersoneria: '',
                                nit
                              }
                              infoFiscalUser.nombre = rinf.Nom
                              infoFiscalUser.calle = rinf.Ca
                              infoFiscalUser.ciudad = rinf.cd
                              infoFiscalUser.zona = rinf.zon
                              infoFiscalUser.frases = rinf.FRASES
                              infoFiscalUser.afiliacion = rinf.AfiliacionIVA
                              infoFiscalUser.postalEstablecimientos = rinf.ESTCODPOSTAL
                              infoFiscalUser.establecimientos = establecimientosSpliter({ establecimientos: rinf.EST })
                              infoFiscalUser.dirEstablecimientos = rinf.ESTDIR
                              infoFiscalUser.cm = rinf.cm
                              infoFiscalUser.tipoPersoneria = rinf.TipoPersoneria
                              infoFiscalUser.nit = nit
                              return globalThis.fetch(urlWsSoap, {
                                method: 'post',
                                headers: { 'Content-Type': 'text/xml' },
                                body: `<?xml version="1.0" encoding="utf-8"?>
                        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Body>
                            <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
                            <Requestor>${requestor}</Requestor>
                            <Transaction>SHARED_INFO_EFACE</Transaction>
                            <Country>${country}</Country>
                            <Entity>${taxid}</Entity>
                            <User>${requestor}</User>
                            <UserName>${country}.${taxid}.admon</UserName>
                            <Data1>SHARED_NFRONT_GETACC</Data1>
                            <Data2>SCountryCode|${country}</Data2>
                            <Data3></Data3>
                            </RequestTransaction>
                        </soap:Body>
                        </soap:Envelope>`
                              }).then(res => res.text())
                                .then(sharedResponse => {
                                  const shared = parser.parse(sharedResponse)
                                  // console.log('RESPONSE SHARED INFO', shared.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1)
                                  const sharedCount = shared.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
                                  if (sharedCount > 0) {
                                    const sh = shared.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
                                    // console.log('RESPONSE SHARED INFO T ', sh)
                                    const sharedData: SharedData = {
                                      nombre: '',
                                      creada: new Date(),
                                      expira: new Date(),
                                      estado: '',
                                      paquete: ''
                                    }
                                    sharedData.nombre = sh.Name
                                    sharedData.paquete = sh.Paquete
                                    sharedData.creada = sh.CreationDate
                                    sharedData.expira = sh.Expira
                                    sharedData.estado = sh.BundleExpired

                                    // ESTABLECIMIENTOS
                                    return globalThis.fetch(urlWsSoap, {
                                      method: 'post',
                                      headers: { 'Content-Type': 'text/xml' },
                                      body: `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                                <soap:Body>
                                    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
                                    <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                                    <Transaction>EXEC_STORED_PROC</Transaction>
                                    <Country>${country}</Country>
                                    <Entity>000000123456</Entity>
                                    <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                                    <UserName>${country}.000000123456.Admon</UserName>
                                    <Data1>SHARED_NFRONT_GETINFOESTABLECIMIENTOSBYUSER</Data1>
                                    <Data2>SCountryCode|${country}|Staxid|${taxid}|Username|${user}</Data2>
                                    <Data3></Data3>
                                    </RequestTransaction>
                                </soap:Body>
                                </soap:Envelope>`
                                    })
                                      .then(res => res.text())
                                      .then(est => {
                                        const estData = parser.parse(est)
                                        // console.log('ESTABLECIMIENTOS CONTEO', estData.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1)
                                        const estCount = estData.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
                                        if (estCount) {
                                          const estRows = estData.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
                                          // console.log('ESTABLECIMIENTOS RESPONSE', estRows)
                                          const establecimientos = []
                                          establecimientos.push(estRows)
                                          // console.log('ESTABLECIMIENTOS RESPONSE', establecimientos)
                                          const Establecimientos: Establecimiento[] = establecimientos.flat().map(e => {
                                            const obj: Establecimiento = {
                                              id: '',
                                              numero: 0,
                                              nombre: '',
                                              direccion: '',
                                              municipio: '',
                                              departamento: '',
                                              codPostal: '',
                                              pais: '',
                                              estado: '',
                                              granted: true,
                                              nit
                                            }
                                            obj.id = e.idEstablecimiento || ''
                                            obj.numero = e.ne || ''
                                            obj.nombre = e.nombre || ''
                                            obj.direccion = e.direccion || ''
                                            obj.municipio = e.municipio || ''
                                            obj.departamento = e.departamento || ''
                                            obj.codPostal = e.codPostal || ''
                                            obj.pais = e.pais || ''
                                            obj.estado = e.Estado || ''
                                            return obj
                                          })
                                          return globalThis.fetch(urlWsSoap, {
                                            method: 'post',
                                            headers: { 'Content-Type': 'text/xml' },
                                            body: `<soap:Envelope
                                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                                        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                                        <soap:Body>
                                            <RequestTransaction
                                                xmlns="http://www.fact.com.mx/schema/ws">
                                                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                                                <Transaction>EXEC_STORED_PROC</Transaction>
                                                <Country>${country}</Country>
                                                <Entity>000000123456</Entity>
                                                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                                                <UserName>${country}.000000123456.admon</UserName>
                                                <Data1>PLANILLACC_GetConfiguracionApp</Data1>
                                                <Data2>staxid|${taxid}</Data2>
                                                <Data3></Data3>
                                            </RequestTransaction>
                                        </soap:Body>
                                    </soap:Envelope>`
                                          })
                                            .then(res => res.text())
                                            .then(resConfig => {
                                              const configDATA = parser.parse(resConfig)
                                              const configCount = configDATA.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
                                              if (configCount > 0) {
                                                const configRows = configDATA.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
                                                const arrayConfig: ConfiguracionApp[] = []
                                                arrayConfig.push(configRows)
                                                return getPermissionsCatalog({ requestor, taxid, country, userName: Username })
                                                  .then(resCatalogoPermisos => {
                                                    if (resCatalogoPermisos?.code === appCodes.ok) {
                                                      return getUserPermissions({ requestor, taxid, country, userName: Username, usuario: user })
                                                        .then(resUserPermissions => {
                                                          if (resUserPermissions.code === appCodes.ok) {
                                                            const permisos = {}
                                                            return getUserActions({ requestor, taxid, country, userName: Username, usuario: user })
                                                              .then(resA => {
                                                                if (resA?.code === appCodes.ok) {
                                                                  resUserPermissions?.data.forEach(e => {
                                                                    const permiso = {
                                                                      granted: e.granted
                                                                    }
                                                                    resA.data.flat().forEach(a => {
                                                                      if (a.idRight === e.idRight) {
                                                                        permiso[a?.description] = {
                                                                          granted: a?.granted
                                                                        }
                                                                      }
                                                                    })
                                                                    permisos[e.description] = permiso
                                                                  })
                                                                } if (resA.code === appCodes.dataVacio) {
                                                                  resUserPermissions.data.forEach(e => {
                                                                    const permiso = {
                                                                      granted: e.granted
                                                                    }
                                                                    resCatalogoPermisos.data.find(p => p.idRight === e.idRight)?.actions.forEach(
                                                                      a => {
                                                                        permiso[a.description] = {
                                                                          granted: true
                                                                        }
                                                                      }
                                                                    )
                                                                    permisos[e.description] = permiso
                                                                  })
                                                                }
                                                                // Obtener la cantidad  de numeros de acceso a consultar global
                                                                const globalRequestAccesos = arrayConfig.flat().find(e => e.idTipoConfiguracion === 1 && e.tipoOperacion === 'TODOS')?.valor || 0
                                                                /// Obtener la cantidad  de numeros de acceso a consultar individual
                                                                const personalRequestAccesos = arrayConfig.flat().find(e => e.idTipoConfiguracion === 1 && e.tipoOperacion === 'INDIVIDUAL')?.valor || 0
                                                                // Obtener la cantidad minima de numeros de acceso predeterminada global
                                                                const globalMinAccesos = arrayConfig.flat().find(e => e.idTipoConfiguracion === 3 && e.tipoOperacion === 'TODOS')
                                                                // Obtener la cantidad minima de numeros de acceso por usuario si llegase a existir
                                                                const personalMinAccesos = arrayConfig.flat().find(e => e.idTipoConfiguracion === 3 && e.tipoOperacion === 'INDIVIDUAL')
                                                                // Obtener si tiene acceso global a contingencia
                                                                const globalAccesoContingencia = arrayConfig.flat().find(e => e.idTipoConfiguracion === 5 && e.tipoOperacion === 'TODOS')?.valor || 0
                                                                // Obtener si tiene acceso global a contingencia
                                                                const personalAccesoContingencia = arrayConfig.flat().find(e => e.idTipoConfiguracion === 5 && e.tipoOperacion === 'INDIVIDUAL')?.valor || 0
                                                                return getUsersByTaxid({ country, requestor, taxid, Username: user })
                                                                  .then(res => {
                                                                    if (res.code === appCodes.ok) {
                                                                      return getAllClientsService({ country, requestor, taxid, userName: user })
                                                                        .then(resClients => {
                                                                          return getAllProductsService({ country, requestor, taxid, userName: user })
                                                                            .then(resProducts => {
                                                                              if (globalAccesoContingencia || personalAccesoContingencia) {
                                                                                let contingenciaDocsRequest = 0
                                                                                if (globalRequestAccesos) {
                                                                                  console.log('CANTIDAD ACCCESOS GLOBAL', globalRequestAccesos)
                                                                                  contingenciaDocsRequest = globalRequestAccesos
                                                                                }
                                                                                if (personalRequestAccesos) {
                                                                                  console.log('CANTIDAD ACCESSOS PERSONAL', personalRequestAccesos)
                                                                                  contingenciaDocsRequest = personalRequestAccesos
                                                                                }
                                                                                console.log('AL FINAL TIENE QUE PEDIR LA CANTIDAD DE: ', contingenciaDocsRequest)
                                                                                return getTalonarioContingencia({ batchId: 1, taxid, branches: infoFiscalUser.establecimientos, qtyRequested: contingenciaDocsRequest })
                                                                                  .then(resTC => {
                                                                                    const talonarioContingencia = {}
                                                                                    infoFiscalUser.establecimientos.forEach((item, index) => {
                                                                                      talonarioContingencia[item.numero] = resTC[index]
                                                                                    })
                                                                                    return getLogos({ taxid, establecimientos: infoFiscalUser?.establecimientos })
                                                                                      .then(responseEstLogos => {
                                                                                        return getDecimalsService({ taxid })
                                                                                          .then(({ data }) => {
                                                                                            return {
                                                                                              code: appCodes.ok,
                                                                                              country,
                                                                                              taxid,
                                                                                              requestor,
                                                                                              userName: user,
                                                                                              Token,
                                                                                              infoFiscalUser,
                                                                                              sharedData,
                                                                                              Establecimientos,
                                                                                              ConfiguracionApp: arrayConfig.flat(),
                                                                                              permisos,
                                                                                              usuarios: res.data,
                                                                                              clientes: resClients.data,
                                                                                              productos: resProducts.data,
                                                                                              talonarioContingencia,
                                                                                              logos: responseEstLogos,
                                                                                              decimales: data,
                                                                                              APIMSTOKEN,
                                                                                              MIPOS
                                                                                            }
                                                                                          })
                                                                                      })
                                                                                  })
                                                                                  .catch(resError => {
                                                                                    console.log('ERROR EN GET TALONARIO LOGIN', resError)
                                                                                    return {
                                                                                      code: appCodes.processError
                                                                                    }
                                                                                  })
                                                                              } else {
                                                                                return getLogos({ taxid, establecimientos: infoFiscalUser?.establecimientos })
                                                                                  .then(async responseEstLogos => {
                                                                                    return getDecimalsService({ taxid })
                                                                                      .then(({ data }) => {
                                                                                        return {
                                                                                          code: appCodes.ok,
                                                                                          country,
                                                                                          taxid,
                                                                                          requestor,
                                                                                          userName: user,
                                                                                          Token,
                                                                                          infoFiscalUser,
                                                                                          sharedData,
                                                                                          Establecimientos,
                                                                                          ConfiguracionApp: arrayConfig.flat(),
                                                                                          permisos,
                                                                                          usuarios: res.data,
                                                                                          clientes: resClients.data,
                                                                                          productos: resProducts.data,
                                                                                          logos: responseEstLogos,
                                                                                          decimales: data,
                                                                                          APIMSTOKEN,
                                                                                          MIPOS
                                                                                        }
                                                                                      })
                                                                                  })
                                                                              }
                                                                            })
                                                                          // }
                                                                          // return resClients
                                                                        })
                                                                        .catch(err => {
                                                                          return err
                                                                        })
                                                                    }
                                                                    return res
                                                                  })
                                                                  .catch(err => {
                                                                    return err
                                                                  })
                                                              })
                                                          }
                                                          return {
                                                            code: appCodes.dataVacio
                                                          }
                                                        })
                                                    } else {
                                                      return {
                                                        code: appCodes.processError
                                                      }
                                                    }
                                                  })
                                              }
                                              return { code: appCodes.processError }
                                            })
                                            .catch(err => {
                                              console.log('ERROR GET CONFIGURACION APP', err)
                                              return { code: appCodes.processError }
                                            })
                                        }
                                        return { code: appCodes.processError }
                                      }).catch(err => {
                                        console.log('ERROR GET ESTABLECIMIENTOS LOGIN', err)
                                        return { code: appCodes.processError }
                                      })
                                  }
                                  return { code: appCodes.processError }
                                }).catch(err => {
                                  console.log('ERROR CATCH SHARED INFO RESPONSE', err)
                                  return { code: appCodes.processError }
                                })
                            }
                            return { code: appCodes.processError }
                          })
                          .catch(err => {
                            console.log('ERROR GET INFO FISCAL SERVICE', err)
                            return { code: appCodes.processError }
                          })
                      }
                      return { code: appCodes.processError }
                    }).catch(err => {
                      console.log('ERROR CATCH GET REQUESTOR ', err)
                      return { code: appCodes.processError }
                    })
                }
                return { code: appCodes.invalidData }
              })
              .catch(err => {
                console.log('ERROR LOGIN SERVICE API TOKEN MIPOS', err)
                return { code: appCodes.processError }
              })
          })
          .catch(err => {
            console.log('ERROR LOGIN SERVICE API TOKEN MS', err)
            return { code: appCodes.processError }
          })
      }
      return { code: appCodes.invalidData }
    })
    .catch(err => {
      console.log('ERROR LOGIN SERVICE', err)
      return { code: appCodes.processError }
    })
}

export const getTokenMIPOSService = async ({ Username, Password, user, nit, taxid }) => {
  return globalThis.fetch('https://felgtaws.digifact.com.gt/gt.com.bac.mipos/api/Authentication/get_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username, Password })
  })
    .then(res => res.json())
    .then(responseAuth => {
      if (responseAuth?.Token) {
        return globalThis.fetch(`https://felgtaws.digifact.com.gt/gt.com.bac.mipos/api/MiPOS/token?TAXID=${nit}&USERNAME=${user}`, {
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
                apiToken: responseAuth?.Token || '',
                token: responseMIPOSTOKEN?.TokenAPI || '',
                userToken: responseMIPOSTOKEN?.TokenUser || ''
              }
            }
            return {
              apiToken: '',
              token: '',
              userToken: ''
            }
          })
          .catch(err => {
            console.log('ERROR CATCH GET TOKEN MIPOS SERVICE GET CREDENTIALS', err)
            return {
              apiToken: '',
              token: '',
              userToken: ''
            }
          })
      }
      return {
        apiToken: '',
        token: '',
        userToken: ''
      }
    })
    .catch(err => {
      console.log('ERROR CATCH GET TOKEN MIPOS SERVICE', err)
      return {
        apiToken: '',
        token: '',
        userToken: ''
      }
    })
}

export const getDashboardService = async ({ taxid, signal }) => {
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
          const dataDashboard = []
          const rows = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          dataDashboard.push(rows)
          const objD = {}
          // const today = new Date().getMonth()
          const actualYear = new Date().getFullYear()
          const actualMonth = new Date().getMonth() + 1

          objD.resumenMensual = dataDashboard
            ?.flat()
            ?.filter(e => e.tipoInfo === 'MENSUAL')
            ?.sort((a, b) => {
              const at = `${a.anio}  -${a.mes}  -01`.split(/[- :]/)
              const bt = `${b.anio}  -${b.mes}  -01`.split(/[- :]/)
              const aF = new Date(at[0], at[1] - 1, at[2], at[3] || 0, at[4] || 0, at[5] || 0).getTime()
              const bF = new Date(bt[0], bt[1] - 1, bt[2], bt[3] || 0, bt[4] || 0, bt[5] || 0).getTime()

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
              objD.ingresoMensual = objD.resumenMensual.find(e => (e.anio === actualYear && e.mes === actualMonth)).total || 0
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
            ?.filter(e => (e.tipoInfo === 'SEMANAL' && (new Date(e.fechaFin).getMonth() + 1) === actualMonth))
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
            ?.sort((a, b) => {
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
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.error('EXCEPTION GET RESUME DASHBOARD SERVICE', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch(err => {
      console.log('ERROR GET DASHBOARD SERVICE', err)
      if (err.message === 'Aborted') {
        return {
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError,
        data: []
      }
    })
}

export const getInfoByNITService = async ({ nit }) => {
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
            const obj = {}
            dataNIT.forEach(e => {
              obj.nombre = e.N
              obj.TID = e.TID
            })
            return {
              code: appCodes.ok,
              data: obj
            }
          }
          return {
            code: 0,
            data: {}
          }
        }
      } catch (ex) {
        console.error('EXCEPTION GET INFO BY NIT SERVICE', ex)
        return {
          code: appCodes.processError,
          data: {}
        }
      }
    })
    .catch(err => {
      console.error('ERROR CATCH GET INFO BY NIT SERVICE', err)
      return {
        code: appCodes.processError,
        data: {}
      }
    })
}

export const getDTESService = async ({
  country = 'GT',
  taxid,
  requestor,
  userName,
  nitReceptor,
  numeroSerie,
  establecimientos,
  allDTESorUsername,
  documentType,
  dateFrom,
  dateTo,
  amountFrom,
  amountTo,
  paymentType,
  cancelled,
  limit,
  signal
}) => {
  const xml = `<?xml version = "1.0" encoding = "utf-8" ?>
                <soap:Envelope
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                  <soap:Body>
                    <RequestTransaction
                      xmlns="http://www.fact.com.mx/schema/ws">
                      <Requestor>${requestor}</Requestor>
                      <Transaction>SEARCH_BASIC</Transaction>
                      <Country>${country}</Country>
                      <Entity>${taxid}</Entity>
                      <User>${requestor}</User>
                      <UserName>${country}.${taxid}.${userName}</UserName>
                      <Data1>
                        <![CDATA[
                        <SearchCriteria
                          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                          xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                          <ApplySearchCriteria>true</ApplySearchCriteria>
                          <SCountryCode>${country}</SCountryCode>
                          <STaxIdOrName>${taxid}</STaxIdOrName>
                          <Branch>${establecimientos}|${allDTESorUsername}|</Branch>
                          <CurrencyCode>GTQ</CurrencyCode>
                          <RCountryCode>${country}</RCountryCode>
                          <RTaxIdOrName>${nitReceptor}</RTaxIdOrName>
                          <SKind>${documentType}</SKind>
                          <ReturnBatchAsLike>${Boolean(numeroSerie.length)}</ReturnBatchAsLike>
                          <Batch>${numeroSerie}</Batch>
                          <UseSerialFrom>false</UseSerialFrom>
                          <UseSerialTo>false</UseSerialTo>
                          <SerialFrom>0</SerialFrom>
                          <SerialTo>0</SerialTo>
                          <UseInternalIDFrom>false</UseInternalIDFrom>
                          <UseInternalIDTo>false</UseInternalIDTo>
                          <InternalIDFrom>0</InternalIDFrom>
                          <InternalIDTo>0</InternalIDTo>
                          <UseDateFrom>${Boolean(dateFrom.length)}</UseDateFrom>
                          <UseDateTo>${Boolean(dateTo.length)}</UseDateTo>
                          <DateFrom>${dateFrom || '2000-01-01'}T00:00:00</DateFrom>
                          <DateTo>${dateTo || new Date().toISOString().slice(0, 10)}T23:59:59.999</DateTo>
                          <UseAmountFrom>${amountFrom >= 0}</UseAmountFrom>
                          <UseAmountTo>${amountTo > 0}</UseAmountTo>
                          <AmountFrom>${amountFrom}</AmountFrom>
                          <AmountTo>${amountTo}</AmountTo>
                          <Paid>${paymentType}</Paid>
                          <Cancelled>${cancelled}</Cancelled>
                          <Distributed>2</Distributed>
                          <QueryTop>${limit}</QueryTop>
                          <OrderBy>0</OrderBy>
                          <Descending>true</Descending>
                        </SearchCriteria>]]>
                      </Data1>
                      <Data2></Data2>
                      <Data3></Data3>
                    </RequestTransaction>
                  </soap:Body>
                </soap:Envelope>`
  // console.log(xml)
  return global
    .fetch(urlWsSoap, {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    })
    .then((res) => res.text())
    .then((response) => {
      try {
        const dataParser = parser.parse(response)
        // console.log('FETCH DTES', dataParser)
        const rows =
          dataParser.Envelope.Body.RequestTransactionResponse
            .RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const data =
            dataParser.Envelope.Body.RequestTransactionResponse
              .RequestTransactionResult.ResponseData.ResponseDataSet.diffgram
              .NewDataSet.B
          const arrayDTES = []
          arrayDTES.push(data)
          if (arrayDTES.length) {
            const dataDTES = arrayDTES.flat().map((dte) => {
              const obj = {}
              obj.documentType = dte.A
              obj.countryCode = dte.W
              obj.clientTaxid = dte.B
              obj.clientName = dte.C
              obj.userCountryCode = dte.X
              obj.userTaxId = dte.Y
              obj.razonSocial = dte.Z
              obj.numeroSerie = dte.D
              obj.numeroDocumento = dte.E
              obj.establecimiento = dte.S
              obj.fechaEmision = dte.F
              obj.monto = dte.G
              obj.paidTime = dte.H
              obj.cancelled = dte.I
              obj.numeroAuth = dte.DG
              obj.internalID = dte.IntID
              obj.userName = dte.userName
              return obj
            })
            return {
              code: appCodes.ok,
              data: dataDTES
            }
          }
        }
        return {
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.log('EXCEPTION GET DTES SERVICE', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch((err) => {
      console.log('ERROR FECTH DTES', err)
      if (err.message === 'Aborted') {
        return {
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError,
        data: []
      }
    })
}

export const getUsersByTaxid = async ({ taxid, requestor, country, Username }) => {
  const xml = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${Username}</UserName>
      <Data1>GetUsersByTaxID</Data1>
      <Data2>${country}|${taxid}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
  </soap:Envelope>`

  console.log('QUERY USER', xml)
  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml
  })
    .then(res => res.text())
    .then(response => {
      try {
        const dataParser = parser.parse(response)
        const rows =
          dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const data =
            dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const array = []
          array.push(data)
          const arrData = array?.flat()?.map(e => {
            const obj = {}
            obj.taxid = e.TID
            obj.country = e.CC
            obj.userName = e.UN
            obj.firstNames = e.FN
            obj.lastNames = e.LN
            obj.nombre = `${e.FN} ${e.LN} `
            obj.email = e.EM
            obj.telefono = e.PH
            obj.GR = e.GR

            return obj
          })
          return {
            code: appCodes.ok,
            data: arrData
          }
        }
        return {
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.log('EXCEPTION GET USERS BY TAXID', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch(err => {
      console.log('CATCH ERROR GET USERS BY TAXID', err)
      return {
        code: appCodes.processError,
        data: []
      }
    })
}

export const addUserService = async ({ requestor, taxid, userName, country, usuario, nombres, apellidos, email, telefono, permisos, acciones, establecimientos }) => {
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

export const editUserService = async ({ requestor, taxid, userName, country, usuario, nombres, apellidos, email, telefono, permisos, acciones, establecimientos }) => {
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

export const deleteUserService = async ({ requestor, taxid, userName, country, usuario }) => {
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
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError
      }
    })
}

export const getDocumentService = async ({ requestor, taxid, userName, documentType, country, numeroAuth, signal }) => {
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

export const sendDTEForEmailService = async ({ taxid, authorizationNumber, email }) => {
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
  return global.fetch(urlWsSoap, {
    method: 'post',
    headers: { 'Content-Type': 'text/xml' },
    body: xml
  }).then(res => res.text())
    .then(response => {
      const dataResponse = parser.parse(response)
      console.log('EMAIL RESPONSE', dataResponse)
      try {
        return {
          code: appCodes.ok,
          data: dataResponse.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.Response.Result
        }
      } catch (err) {
        console.log('EXCEPTION SEND DTE EMAIL SERVICE', err)
        return {
          code: appCodes.processError,
          data: false
        }
      }
    })
    .catch(err => {
      console.log('ERROR SEND DTE EMAIL SERVICE', err)
      return {
        code: appCodes.processError,
        data: false
      }
    })
}

export const cancelDTEService = async ({ Token, userName, taxid, authorizationNumber, fechaEmision, nitReceptor, motivoAnulacion }) => {
  const tzoffset = (new globalThis.Date()).getTimezoneOffset() * 60000
  const localISOTime = (new globalThis.Date(globalThis.Date.now() - tzoffset)).toISOString()
  console.log('Token', Token)
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
      Authorization: Token
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

export const getAllProductsService = async ({ requestor, taxid, userName, country, signal = new globalThis.AbortController().signal }) => {
  return globalThis.fetch(urlWsSoap, {
    signal,
    method: 'post',
    headers: { 'Content-Type': 'text/xml' },
    body: `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${userName}</UserName>
      <Data1>GetAllProductsAndServices</Data1>
      <Data2>${country}|${taxid}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
      </soap:Envelope>`
  })
    .then(res => res.text())
    .then(response => {
      try {
        const dataParser = parser.parse(response)
        const rows = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const data = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(data)
          const products = dataArr.flat().map(e => {
            const obj = {}
            obj.name = e.D
            obj.price = e.LP
            obj.type = e.CTG
            obj.unit = e.U
            obj.eanprod = e.EAN
            obj.quantity = 1
            obj.discount = 0
            return obj
          })
          return {
            code: appCodes.ok,
            data: products
          }
        }
        console.error('GET ALL PRODUCTS SERVICE DATA EMPTY')
        return {
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.error('EXCEPTION GET ALL PRODUCTS SERVICE', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch(err => {
      console.error('ERROR CATCH GET ALL PRODUCTS SERVICE', err)
      if (err.message === 'Aborted') {
        return {
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError,
        data: []
      }
    })
}

export const addEditProductService = async ({ requestor, taxid, userName, country, name, price, eanprod, type, unit }) => {
  return globalThis.fetch(urlWsSoap, {
    method: 'post',
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
    body: `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${userName}</UserName>
      <Data1>UpsertProductsAndServices</Data1>
      <Data2>GT|${taxid}|${name}|${price}|0|${unit}|0|${eanprod}|0|${userName}|0|0|${type}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
    </soap:Envelope>`
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

export const deleteProductService = async ({ taxid, country, eanprod }) => {
  return globalThis.fetch(urlWsSoap, {
    method: 'post',
    headers: { 'Content-Type': 'text/xml' },
    body: `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>000000123456</Entity>
      <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
      <UserName>${country}.000000123456.MARIESLOSPOSTMAS</UserName>
      <Data1>DeleteProductsAndServices</Data1>
      <Data2>GT|${taxid}|${eanprod}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
              </soap:Envelope>`
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

export const getAllClientsService = async ({ requestor, taxid, country, userName, signal = new globalThis.AbortController().signal }) => {
  return globalThis.fetch(urlWsSoap, {
    signal,
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: `<soap:Envelope
xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd= "http://www.w3.org/2001/XMLSchema"
xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction
      xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>SHARED_INFO_EFACE</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${userName}</UserName>
      <Data1>SHARED_NFRONT_GETCUSTOMERBYSTAXID_2</Data1>
      <Data2>SCountryCode|${country}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
    </soap:Envelope>`
  })
    .then(res => res.text())
    .then(response => {
      try {
        const dataParser = parser.parse(response)
        const rowsCount = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rowsCount > 0) {
          const rowData = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const array = []
          array.push(rowData)
          const data = array.flat().map(e => {
            const obj = {}
            obj.id = e.IDCustomer || ''
            obj.country = e.SCountryCode || ''
            obj.sTaxId = e.STaxID || ''
            obj.tipoCliente = e.TipoCliente || ''
            obj.NIT = e.NIT || ''
            obj.nombreOrganizacion = e.NombreOrganizacion || ''
            obj.nombreContacto = e.NombreContacto || ''
            obj.cargo = e.Cargo || ''
            obj.telefono = e.Telefono || ''
            obj.correo = e.Correo || ''
            obj.IDBitacoraCustomer = e.IDBitacoraCustomer || ''
            obj.estado = e.status || ''
            obj.fechaCreacion = e.fecha || ''
            obj.observaciones = e.observaciones || ''
            obj.direccion = e.Direccion1 || ''
            obj.municipio = e.Municipio || ''
            obj.departamento = e.Departamento || ''
            return obj
          })
          return {
            code: appCodes.ok,
            data
          }
        }
        return {
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.log('EXCEPTION GET ALL CLIENTS SERVICE', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH GET ALL CLIENTS SERVICE', err)
      if (err.message === 'Aborted') {
        return {
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError,
        data: []
      }
    })
}

export const validateNITService = async ({ nit }) => {
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

export const addEditClientService = async ({ requestor, taxid, userName, country, pais, nit, name, telefono, correo, direccion, municipio, departamento }) => {
  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
    body: `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>SHARED_INFO_EFACE</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${userName}</UserName>
      <Data1>SHARED_NFRONT_ADDCUSTOMER_2</Data1>
      <Data2>SCountryCode|${pais}|TipoCliente|INDIVIDUAL|NIT|${nit}|NombreOrganizacion|${name}|NombreContacto|${name}|Cargo|Cliente|Telefono|${telefono}|Correo|${correo}|Direccion1|${direccion}|Municipio|${municipio}|Departamento|${departamento}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
                </soap:Envelope>`
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
        console.log('EXCEPTION ADD CLIENT SERVICE', ex)
        return {
          code: appCodes.processError
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH ADD CLIENT SERVICE', err)
      return {
        code: appCodes.processError
      }
    })
}

export const deleteClientService = async ({ requestor, country, taxid, userName, clientNit }) => {
  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>SHARED_INFO_EFACE</Transaction>
      <Country>GT</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${userName}</UserName>
      <Data1>SHARED_NFRONT_DELETECUSTOMERBYSTAXIDBYNIT</Data1>
      <Data2>ScountryCode|GT|STAXID|${taxid}|NIT|${clientNit}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
</soap:Envelope>`
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
        console.log('EXCEPTION DELETE CLIENT SERVICE', ex)
        return {
          code: appCodes.processError
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH DELETE CLIENT SERVICE', err)
      return {
        code: appCodes.processError
      }
    })
}

export const getPermissionsCatalog = async ({ requestor, taxid, country, userName, signal = new globalThis.AbortController().signal }) => {
  const bodyPermisos = `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${country}.${taxid}.${userName}</UserName>
      <Data1>SHARED_NFRONT_GETRIGHTSBYTIPO</Data1>
      <Data2>TIPO|ADMIN</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
    </soap:Envelope>`

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
      <Data1>SHARED_NFRONT_CATALOGO_ACTIONRIGHTS</Data1>
      <Data2>STAXID|</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
</soap:Envelope>`

  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: bodyPermisos
  }).then(res => res.text())
    .then(response => {
      try {
        const dataParser = parser.parse(response)
        const rows = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const data = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(data)
          return globalThis.fetch(urlWsSoap, {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml' },
            body: bodyAcciones
          }).then(res => res.text())
            .then(responseActions => {
              const dataParserActions = parser.parse(responseActions)
              const rowsActions = dataParserActions.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
              if (rowsActions > 0) {
                const dataActions = dataParserActions.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
                const dataArrActions = []
                dataArrActions.push(dataActions)
                const acciones = dataArrActions.flat().map(a => {
                  const action = {}
                  action.idActionRight = a.idActionRight
                  action.description = a.actionRight
                  action.idRight = a.idRight
                  action.page = a.page
                  action.granted = false
                  return action
                })
                const permisos = dataArr.flat().map(e => {
                  const obj = {}
                  obj.idRight = e.IDRight
                  obj.description = e.Descripcion
                  obj.granted = false
                  obj.actions = [acciones.filter(a => a.idRight === obj.idRight)].flat()
                  return obj
                })
                return {
                  code: appCodes.ok,
                  data: permisos
                }
              }
            }).catch(err => {
              console.log('ERROR CATCH GET PERMISOS POR ACCION', err)
              return {
                code: appCodes.processError
              }
            })
        }
        console.error('GET ALL PRODUCTS SERVICE DATA EMPTY')
        return {
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.error('EXCEPTION GET ALL PRODUCTS SERVICE', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH GET PERMISOS', err)
      return {
        code: appCodes.processError
      }
    })
}

export const getAllEstablecimientos = async ({ requestor, taxid, country, userName, usuario, signal }) => {
  const bd = `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${country}.${taxid}.${userName}</UserName>
      <Data1>SHARED_NFRONT_GETINFOESTABLECIMIENTOSBYUSER</Data1>
      <Data2>SCountryCode|${country}|Staxid|${taxid}|Username|${usuario}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
  </soap:Envelope>`
  return globalThis.fetch(urlWsSoap, {
    method: 'post',
    headers: { 'Content-Type': 'text/xml' },
    body: bd
  })
    .then(res => res.text())
    .then(response => {
      try {
        const dataParser = parser.parse(response)
        const rows = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rows > 0) {
          const data = dataParser.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          const dataArr = []
          dataArr.push(data)

          const establecimientos: Establecimiento[] = dataArr.flat().map(e => {
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
            obj.estado = e.Estado
            obj.codPostal = e.codPostal
            obj.departamento = e.departamento
            obj.municipio = e.municipio
            obj.direccion = e.direccion
            obj.id = e.dirEstablecimiento
            obj.numero = e.ne
            obj.nombre = e.nombre
            obj.nit = e.nit
            return obj
          })
          return {
            code: appCodes.ok,
            data: establecimientos
          }
        }
        console.error('GET ALL PRODUCTS SERVICE DATA EMPTY')
        return {
          code: appCodes.dataVacio,
          data: []
        }
      } catch (ex) {
        console.error('EXCEPTION GET ALL PRODUCTS SERVICE', ex)
        return {
          code: appCodes.processError,
          data: []
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH GET ALL ESTABLECIMIENTOS', err)
      return {
        code: appCodes.processError
      }
    })
}

export const getUserPermissions = async ({ requestor, taxid, country, userName, usuario }) => {
  const query = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
      <UserName>${country}.${taxid}.${userName}</UserName>
      <Data1>SHARED_NFRONT_GETINFORIGHTS</Data1>
      <Data2>SCountryCode|${country}|Taxid|${taxid}|UserName|${usuario}</Data2>
      <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: query
  })
    .then(res => res.text())
    .then(responseFatherAccess => {
      try {
        const father = parser.parse(responseFatherAccess)
        const rowsFather = father.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1

        if (rowsFather > 0) {
          const fatherRows = []
          const dataFather = father.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          fatherRows.push(dataFather)
          const fatherAccess: PermisosPadre[] = fatherRows?.flat()?.map(e => {
            const obj: PermisosPadre = {
              idRight: 0,
              description: '',
              granted: true
            }
            obj.idRight = e.IDRight
            obj.description = e.Descripcion
            obj.granted = e.Granted
            return obj
          })
          return {
            code: appCodes.ok,
            data: fatherAccess
          }
        } else {
          return {
            code: appCodes.dataVacio
          }
        }
      } catch (ex) {
        console.log('ERROR TRY CATCH PERMISOS PADRE', ex)
        return {
          code: appCodes.processError
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH USER PERMISSIONS', err)
      return {
        code: appCodes.processError
      }
    })
}

export const getUserActions = async ({ requestor, taxid, country, userName, usuario }) => {
  const query = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
      <Requestor>${requestor}</Requestor>
      <Transaction>SHARED_INFO_EFACE</Transaction>
      <Country>${country}</Country>
      <Entity>${taxid}</Entity>
      <User>${requestor}</User>
      <UserName>${country}.${taxid}.${userName}</UserName>
      <Data1>SHARED_NFRONT_GETACTIONRIGHTS</Data1>
      <Data2>STAXID|${taxid}|Username|${usuario}</Data2>
      <Data3></Data3>
    </RequestTransaction>
  </soap:Body>
</soap:Envelope>`
  console.log('QUERY ACCIONES', query)
  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: query
  })
    .then(res => res.text())
    .then(dataActions => {
      try {
        const actions = parser.parse(dataActions)
        const rowsActions = actions.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseData1
        if (rowsActions > 0) {
          const actionRows = []
          const dataActions = actions.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData.ResponseDataSet.diffgram.NewDataSet.T
          actionRows.push(dataActions)
          const actionAccess: PermisoPorAccion[] = actionRows?.flat()?.map(a => {
            const action: PermisoPorAccion = {
              description: '',
              granted: true,
              idActionRight: '',
              idRight: '',
              page: ''
            }
            action.idActionRight = a.idActionRight
            action.description = a.actionRight
            action.idRight = a.idRight
            action.page = a.page
            action.granted = a.granted
            return action
          })
          return {
            code: appCodes.ok,
            data: actionAccess
          }
        }
        return {
          code: appCodes.dataVacio
        }
      } catch (ex) {
        console.log('ERROR TRY CATCH USER ACTIONS', ex)
      }
    })
    .catch(err => {
      console.log('ERROR CATCH USER ACTIONS', err)
      return {
        code: appCodes.processError
      }
    })
}

export const addEditUserActionsRights = async ({ requestor, taxid, userName, country, acciones, usuario }) => {
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
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError
      }
    })
}

export const addEditUserRights = async ({ requestor, taxid, userName, country, permisos, usuario }) => {
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
          code: appCodes.ok,
          data: []
        }
      }
      return {
        code: appCodes.processError
      }
    })
}

export const addEditUserBranchRights = async ({ requestor, taxid, userName, country, establecimientos, usuario }) => {
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

export const getTalonarioContingencia = async ({ batchId, taxid, branches, qtyRequested }) => {
  let serial = DeviceInfo.getSerialNumberSync()
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

export const getXMLTransformation = async ({ json }) => {
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

export const certContingencia = async ({ xmlFactura, user }) => {
  return globalThis.fetch(`${urlWsRest}FelRequestV2?NIT=${user.taxid}&TIPO=CERTIFICATE_DTE_XML_TOSIGN&FORMAT=XML&USERNAME=${user.userName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml;charset=UTF-8', Authorization: user.Token, Accept: 'application/json' },
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

export const addContingencia = async ({ invoice, ne, serialTerminal, numAcceso, user }) => {
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

export const agregarErrorContingencia = async ({ invoiceB64, numAcceso, user, error }) => {
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

export const getProductsResumen = async ({ user, filter }) => {
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
          const data = array.flat().map(e => {
            const obj = {}
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

export const getLogos = async ({ taxid = '', establecimientos = [] }): Promise<Logos> => {
  const URL_BASE: string = `https://digifact-logo.s3.amazonaws.com/GT/logo/${taxid}.jpg`
  return ReactNativeBlobUtil
    .fetch('GET', URL_BASE)
    .then(res => res.base64())
    .then(async response => {
      // console.log('RESPONSE IMAGE', response)
      const obj: Logos = {
        logoGeneral: '',
        logoPorEstablecimiento: [{ [-1]: '' }]
      }
      obj.logoGeneral = response?.length > 1000 ? response : ''
      // obj.logoPorEstablecimiento = {}
      let est: Establecimiento
      for (est of establecimientos) {
        const URL_BASE_EST = `https://digifact-logo.s3.amazonaws.com/GT/logo/${taxid}_${est?.numero}_APP.jpg`
        await ReactNativeBlobUtil.fetch('GET', URL_BASE_EST)
          .then(res => res.base64())
          .then(responseEst => {
            obj.logoPorEstablecimiento[est?.numero!] = responseEst?.length > 1000 ? responseEst : ''
          })
      }
      return obj
    })
}

export const getDecimalsService = async ({ taxid = '' }) => {
  return globalThis.fetch(urlWsSoap, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: `<soap:Envelope
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
        <Transaction>SHARED_INFO_EFACE</Transaction>
        <Country>GT</Country>
        <Entity>000000123456</Entity>
        <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
        <UserName>GT.000000123456.DIGIFACT</UserName>
        <Data1>SHARED_GETINFO_CONFIG</Data1>
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
        const responseData = data.Envelope.Body.RequestTransactionResponse.RequestTransactionResult.ResponseData
        const rows = responseData?.ResponseData1 || 0
        // console.log('DECIMALES', responseData)
        // console.log('ROWS', rows)
        if (rows > 0) {
          const decimals = responseData?.ResponseDataSet?.diffgram?.NewDataSet?.T?.FELCONFIG_DECIMALES_CANTIDAD || 6
          // console.log('DECIMALS CONFIG', decimals)
          return {
            code: appCodes.ok,
            data: decimals
          }
        }
        return {
          code: appCodes.ok,
          data: 6
        }
      } catch (err) {
        console.log('ERROR EXCEPTION GET DECIMALS SERVICE', err)
        return {
          code: appCodes.ok,
          data: 6
        }
      }
    })
    .catch(err => {
      console.log('ERROR CATCH GET DECIMALES SERVICE', err)
      return {
        code: appCodes.ok,
        data: 6
      }
    })
}

export const uploadLogoService = async ({ taxid = '', extension = 'jpg', codigoEstablecimiento = '', logobase64 = '', APIMSTOKEN = '' }) => {
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

export const recoverPasswordService = async ({ recoverPassUser }) => {
  return globalThis.fetch(urlWsSoap, {
    method: 'post',
    headers: { 'Content-Type': 'text/xml' },
    body: `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction xmlns="http://www.fact.com.mx/schema/ws">
        <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
        <Transaction>PASSWORD_FORGOT</Transaction>
        <Country>GT</Country>
        <Entity>000000123456</Entity>
        <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
        <UserName>${recoverPassUser}</UserName>
         <Data1></Data1>
        <Data2></Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
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
}
