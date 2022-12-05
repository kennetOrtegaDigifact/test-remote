import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { Cliente, Producto } from '../types'
const requestTransaction: {[key: string]: string} = {
  GT: 'xmlns="http://www.fact.com.mx/schema/ws"',
  PA: 'xmlns="https://www.digifact.com.pa/schema/ws"'
}
const Body: {
      entity: {[key: string]: string}
      user: {[key: string]: string}
      tag: {[key: string]: string}
    } = {
      entity: {
        GT: '000000123456',
        PA: '155704849-2-2021'
      },
      user: {
        GT: 'admon',
        PA: 'FRANK'
      },
      tag: {
        GT: 'NIT',
        PA: 'TAXID'
      }
    }

export const useXmlFetchConstructor = () => {
  const { country, requestor, taxid, userName } = useSelector((state: ReduxState) => state.userDB)
  const user = useSelector((state: ReduxState) => state.userDB)
  const getAllProductsConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RequestTransaction
                        ${requestTransaction?.[country]}>
                        <Requestor>${requestor}</Requestor>
                        <Transaction>EXEC_STORED_PROC</Transaction>
                        <Country>${country}</Country>
                        <Entity>${taxid}</Entity>
                        <User>${requestor}</User>
                        <UserName>${country}.${taxid}.${userName}</UserName>
                        <Data1>GetAllProductsAndServices</Data1>
                        <Data2>${country}|${taxid}</Data2>
                        <Data3></Data3>
                    </RequestTransaction>
                </soap:Body>
            </soap:Envelope>`
  }, [])

  const deleteProductsConstructor = useCallback(({
    ean
  }: {ean: string|number}) => {
    return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RequestTransaction ${requestTransaction?.[country]}>
                        <Requestor>${requestor}</Requestor>
                        <Transaction>EXEC_STORED_PROC</Transaction>
                        <Country>${country}</Country>
                        <Entity>${taxid}</Entity>
                        <User>${requestor}</User>
                        <UserName>${country}.${taxid}.${userName}</UserName>
                        <Data1>DeleteProductsAndServices</Data1>
                        <Data2>${country}|${taxid}|${ean}</Data2>
                        <Data3></Data3>
                    </RequestTransaction>
                </soap:Body>
            </soap:Envelope>`
  }, [])

  const addEditProductsConstructor = useCallback((item: Producto) => {
    const { name, price, unit, ean, familia, impuestos, segmento, tipo } = item
    const datos: {
      data: {[key: string]: string}
    } = {
      data: {
        GT: `${country}|${taxid}|${name}|${price}|0|${unit}|0|${ean}|0|${userName}|0|0|${tipo}`,
        PA: `${country}|${taxid}|${name}|${price}|0|${unit}|0|${ean}|0|${userName}|${segmento}|${familia}|${JSON.stringify(impuestos)}`
      }
    }
    return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xmlns:xsd="http://www.w3.org/2001/XMLSchema"
              xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <RequestTransaction
                  ${requestTransaction?.[country]}>
                  <Requestor>${requestor}</Requestor>
                  <Transaction>EXEC_STORED_PROC</Transaction>
                  <Country>${country}</Country>
                  <Entity>${taxid}</Entity>
                  <User>${requestor}</User>
                  <UserName>${country}.${taxid}.${userName}</UserName>
                  <Data1>UpsertProductsAndServices</Data1>
                  <Data2>${datos?.data?.[country]}</Data2>
                  <Data3></Data3>
                </RequestTransaction>
              </soap:Body>
            </soap:Envelope>`
  }, [])

  const getAllClientsConstructor = useCallback(({ country = '', taxid = '', requestor = '', userName = '' }: {country?: string, taxid?: string, requestor?: string, userName?: string}) => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope
            xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd= "http://www.w3.org/2001/XMLSchema"
            xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
            <soap:Body>
                <RequestTransaction
                ${requestTransaction?.[user?.country || country]}>
                <Requestor>${user?.requestor || requestor}</Requestor>
                <Transaction>SHARED_INFO_EFACE</Transaction>
                <Country>${user?.country || country}</Country>
                <Entity>${taxid}</Entity>
                <User>${user?.requestor || requestor}</User>
                <UserName>${user?.userName || userName}</UserName>
                <Data1>SHARED_NFRONT_GETCUSTOMERBYSTAXID_2</Data1>
                <Data2>SCountryCode|${user?.country || country}</Data2>
                <Data3></Data3>
                </RequestTransaction>
            </soap:Body>
        </soap:Envelope>`
  }, [])

  const addEditClientsConstructor = useCallback((item: Cliente) => {
    const { DV, cTaxId, cargo, corregimiento, correo, countryCode, departamento, direccion, distrito, municipio, nombreContacto, nombreOrga, provincia, telefono, tipoCliente } = item
    const datos: {
      data: {[key: string]: string}
    } = {
      data: {
        GT: `SCountryCode|${countryCode}|TipoCliente|INDIVIDUAL|NIT|${cTaxId}|NombreOrganizacion|${nombreContacto}|NombreContacto|${nombreContacto}|Cargo|Cliente|Telefono|${telefono}|Correo|${correo}|Direccion1|${direccion}|Municipio|${municipio}|Departamento|${departamento}`,
        PA: `SCountryCode|${countryCode}|STAXID|${taxid}|CTAXID|${cTaxId}|DV|${DV}|TipoCliente|${tipoCliente}|NombreOrganizacion|${nombreContacto}|NombreContacto|${nombreContacto}|Cargo|${cargo || ''}|Telefono|${telefono}|Correo|${correo}|Direccion1|${direccion}|Provincia|${provincia}|Distrito|${distrito}|Corregimiento|${corregimiento}`
      }
    }
    return `<?xml version="1.0" encoding="utf-8"?>
              <soap:Envelope 
                xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" 
                xmlns:xsd= "http://www.w3.org/2001/XMLSchema" 
                xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/"
              >
                <soap:Body>
                  <RequestTransaction ${requestTransaction?.[country]}>
                    <Requestor>${requestor}</Requestor>
                    <Transaction>SHARED_INFO_EFACE</Transaction>
                    <Country>${country}</Country>
                    <Entity>${taxid}</Entity>
                    <User>${requestor}</User>
                    <UserName>${userName}</UserName>
                    <Data1>SHARED_NFRONT_ADDCUSTOMER_2</Data1>
                    <Data2>${datos?.data?.[country]}</Data2>
                    <Data3></Data3>
                  </RequestTransaction>
                </soap:Body>
              </soap:Envelope>`
  }, [])

  const deleteClientXmlConstructor = useCallback((item: Cliente) => {
    const { cTaxId } = item
    return `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
              <soap:Body>
                <RequestTransaction ${requestTransaction?.[country]}>
                  <Requestor>${requestor}</Requestor>
                  <Transaction>SHARED_INFO_EFACE</Transaction>
                  <Country>${country}</Country>
                  <Entity>${taxid}</Entity>
                  <User>${requestor}</User>
                  <UserName>${userName}</UserName>
                  <Data1>SHARED_NFRONT_DELETECUSTOMERBYSTAXIDBYNIT</Data1>
                  <Data2>ScountryCode|${country}|STAXID|${taxid}|${Body?.tag?.[country]}|${cTaxId}</Data2>
                  <Data3></Data3>
                </RequestTransaction>
              </soap:Body>
            </soap:Envelope>`
  }, [])

  const getAccountDetailsConstructor = useCallback(({ taxid, countryCode }: {taxid: string, countryCode: string}) => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction ${requestTransaction?.[countryCode]}>
            <Requestor>d06a8f37-2d87-43d2-b977-04d503532786</Requestor>
            <Transaction>SHARED_INFO_EFACE</Transaction>
            <Country>${countryCode}</Country>
            <Entity>${Body?.entity?.[countryCode]}</Entity>
            <User>d06a8f37-2d87-43d2-b977-04d503532786</User>
            <UserName>${countryCode}.${Body?.entity?.[countryCode]}.${Body?.user?.[countryCode]}</UserName>
            <Data1>SHARED_NFRONT_GETACCGRAL</Data1>
            <Data2>SCountryCode|${countryCode}|STAXIDTOSEEK|${taxid}</Data2>
            <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const infoFiscalXMLConstructor = useCallback(({ requestor, userName, country = '', taxid }: { requestor: string, userName: string, country: string, taxid: string }) => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction ${requestTransaction?.[user?.country || country]}>
              <Requestor>${user?.requestor || requestor}</Requestor>
              <Transaction>SHARED_INFO_EFACE</Transaction>
              <Country>${user?.country || country}</Country>
              <Entity>${user?.taxid || taxid}</Entity>
              <User>${user?.requestor || requestor}</User>
              <UserName>${user?.country || country}.${user?.taxid || taxid}.${user?.userName || userName}</UserName>
              <Data1>SHARED_NFRONT_GETINFOFISCALFELBYPARTNER_2</Data1>
              <Data2>SCountryCode|${user?.country || country}</Data2>
              <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getAllEstablecimientosXmlConstructor = useCallback(({ requestor, userName, country = '', taxid }: { requestor?: string, userName?: string, country?: string, taxid?: string }) => {
    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <RequestTransaction ${requestTransaction?.[user?.country || country]}>
        <Requestor>${user?.requestor || requestor}</Requestor>
        <Transaction>EXEC_STORED_PROC</Transaction>
        <Country>${user?.country || country}</Country>
        <Entity>${user?.taxid || taxid}</Entity>
        <User>${user?.requestor || requestor}</User>
        <UserName>${user?.country || country}.${user?.taxid || taxid}.${user?.userName || userName}</UserName>
        <Data1>SHARED_NFRONT_GETINFOESTABLECIMIENTOSBYUSER</Data1>
        <Data2>SCountryCode|${user?.country || country}|Staxid|${user?.taxid || taxid}|Username|${user?.userName || userName}</Data2>
        <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
    </soap:Envelope>`
  }, [])

  const getConfigAppXmlConstructor = useCallback(({ country = '', taxid = '' }: { country: string, taxid: string }) => {
    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <RequestTransaction
                ${requestTransaction?.[user?.country || country]}>
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>${user?.country || country}</Country>
                <Entity>000000123456</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>${user?.country || country}.000000123456.admon</UserName>
                <Data1>PLANILLACC_GetConfiguracionApp</Data1>
                <Data2>staxid|${user?.taxid || taxid}</Data2>
                <Data3></Data3>
            </RequestTransaction>
        </soap:Body>
    </soap:Envelope>`
  }, [])

  const getCatalogPermissionsFatherXmlConstructor = useCallback(({ country = '' }: {country: string}) => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <RequestTransaction ${requestTransaction?.[user?.country || country]}>
                    <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                    <Transaction>EXEC_STORED_PROC</Transaction>
                    <Country>${user?.country || country}</Country>
                    <Entity>${Body?.entity?.[user?.country || country]}</Entity>
                    <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                    <UserName>${user?.country || country}.${Body?.entity?.[user?.country || country]}.${Body?.user?.[user?.country || country]}</UserName>
                    <Data1>SHARED_NFRONT_GETRIGHTSBYTIPO</Data1>
                    <Data2>TIPO|ADMIN</Data2>
                    <Data3></Data3>
                </RequestTransaction>
            </soap:Body>
        </soap:Envelope>`
  }, [])

  const getCatalogPermissionsActionsXmlConstructor = useCallback(({ country = '' }: {country: string}) => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <RequestTransaction ${requestTransaction?.[user?.country || country]}>
                    <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                    <Transaction>EXEC_STORED_PROC</Transaction>
                    <Country>${user?.country || country}</Country>
                    <Entity>${Body?.entity?.[user?.country || country]}</Entity>
                    <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                    <UserName>${user?.country || country}.${Body?.entity?.[user?.country || country]}.${Body?.user?.[user?.country || country]}</UserName>
                    <Data1>SHARED_NFRONT_CATALOGO_ACTIONRIGHTS</Data1>
                    <Data2>STAXID|</Data2>
                    <Data3></Data3>
                </RequestTransaction>
            </soap:Body>
        </soap:Envelope>`
  }, [])

  const getUserFatherPermissionsXmlConstructor = useCallback(({ requestor = '', taxid = '', country = '', userName = '' }: { requestor: string, taxid: string, country: string, userName: string }) => {
    return `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction ${requestTransaction?.[user?.country || country]}>
      <Requestor>${user?.requestor || requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${user?.country || country}</Country>
      <Entity>${user?.taxid || taxid}</Entity>
      <User>${user?.requestor || requestor}</User>
      <UserName>${user?.country || country}.${user?.taxid || taxid}.${user?.userName || userName}</UserName>
      <Data1>SHARED_NFRONT_GETINFORIGHTS</Data1>
      <Data2>SCountryCode|${user?.country || country}|Taxid|${user?.taxid || taxid}|UserName|${user?.userName || userName}</Data2>
      <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
  }, [])

  const getUserActionsPermissionsXmlConstructor = useCallback(({ requestor = '', taxid = '', country = '', userName = '' }: { requestor: string, taxid: string, country: string, userName: string }) => {
    return `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <RequestTransaction ${requestTransaction?.[user?.country || country]}>
      <Requestor>${user?.requestor || requestor}</Requestor>
      <Transaction>EXEC_STORED_PROC</Transaction>
      <Country>${user?.country || country}</Country>
      <Entity>${user?.taxid || taxid}</Entity>
      <User>${user?.requestor || requestor}</User>
      <UserName>${user?.country || country}.${user?.taxid || taxid}.${user?.userName || userName}</UserName>
      <Data1>SHARED_NFRONT_GETACTIONRIGHTS</Data1>
      <Data2>STaxid|${user?.taxid || taxid}|UserName|${user?.userName || userName}</Data2>
      <Data3></Data3>
      </RequestTransaction>
    </soap:Body>
  </soap:Envelope>`
  }, [])

  return {
    getAllClientsXml: getAllClientsConstructor,
    addEditClientXml: addEditClientsConstructor,
    deleteClientXml: deleteClientXmlConstructor,
    getAllProductsXml: getAllProductsConstructor,
    deleteProductsXml: deleteProductsConstructor,
    addEditProductsXml: addEditProductsConstructor,
    getAccountDetailsXml: getAccountDetailsConstructor,
    infoFiscalXml: infoFiscalXMLConstructor,
    getAllEstablecimientosXml: getAllEstablecimientosXmlConstructor,
    getConfigAppXml: getConfigAppXmlConstructor,
    getCatalogPermissionsFatherXml: getCatalogPermissionsFatherXmlConstructor,
    getCatalogPermissionsActionsXml: getCatalogPermissionsActionsXmlConstructor,
    getUserFatherPermissionsXml: getUserFatherPermissionsXmlConstructor,
    getUserActionsPermissionsXml: getUserActionsPermissionsXmlConstructor
  }
}
