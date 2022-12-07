import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { Cliente, Producto, XmlProps } from '../types'
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
  const user = useSelector((state: ReduxState) => state.userDB)
  const getAllProductsConstructor = useCallback(({ country = '', taxid = '', requestor = '', userName = '' }: XmlProps) => {
    return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RequestTransaction
                        ${requestTransaction?.[user?.country || country]}>
                        <Requestor>${user?.requestor || requestor}</Requestor>
                        <Transaction>EXEC_STORED_PROC</Transaction>
                        <Country>${user?.country || country}</Country>
                        <Entity>${user?.taxid || taxid}</Entity>
                        <User>${user?.requestor || requestor}</User>
                        <UserName>${user?.country || country}.${user?.taxid || taxid}.${user?.userName || userName}</UserName>
                        <Data1>GetAllProductsAndServices</Data1>
                        <Data2>${user?.country || country}|${user?.taxid || taxid}</Data2>
                        <Data3></Data3>
                    </RequestTransaction>
                </soap:Body>
            </soap:Envelope>`
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const deleteProductsConstructor = useCallback(({
    ean
  }: {ean: string|number}) => {
    const { country, taxid, userName, requestor } = user
    return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RequestTransaction ${requestTransaction?.[country as keyof typeof requestTransaction]}>
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
  }, [user])

  const addEditProductsConstructor = useCallback((item: Producto) => {
    const { name, price, unit, ean, familia, impuestos, segmento, tipo } = item
    const { country, taxid, userName, requestor } = user

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
                  ${requestTransaction?.[country as keyof typeof requestTransaction]}>
                  <Requestor>${requestor}</Requestor>
                  <Transaction>EXEC_STORED_PROC</Transaction>
                  <Country>${country}</Country>
                  <Entity>${taxid}</Entity>
                  <User>${requestor}</User>
                  <UserName>${country}.${taxid}.${userName}</UserName>
                  <Data1>UpsertProductsAndServices</Data1>
                  <Data2>${datos?.data?.[country as keyof typeof datos]}</Data2>
                  <Data3></Data3>
                </RequestTransaction>
              </soap:Body>
            </soap:Envelope>`
  }, [user])

  const getAllClientsConstructor = useCallback(({ country = '', taxid = '', requestor = '', userName = '' }: XmlProps) => {
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
  }, [user?.country, user?.requestor, user?.userName])

  const addEditClientsConstructor = useCallback((item: Cliente) => {
    const { DV, cTaxId, cargo, corregimiento, correo, countryCode, departamento, direccion, distrito, municipio, nombreContacto, provincia, telefono, tipoCliente } = item
    const { country, taxid, userName, requestor } = user

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
                  <RequestTransaction ${requestTransaction?.[country as keyof typeof requestTransaction]}>
                    <Requestor>${requestor}</Requestor>
                    <Transaction>SHARED_INFO_EFACE</Transaction>
                    <Country>${country}</Country>
                    <Entity>${taxid}</Entity>
                    <User>${requestor}</User>
                    <UserName>${userName}</UserName>
                    <Data1>SHARED_NFRONT_ADDCUSTOMER_2</Data1>
                    <Data2>${datos?.data?.[country as keyof typeof datos]}</Data2>
                    <Data3></Data3>
                  </RequestTransaction>
                </soap:Body>
              </soap:Envelope>`
  }, [user])

  const deleteClientXmlConstructor = useCallback((item: Cliente) => {
    const { country, taxid, userName, requestor } = user

    const { cTaxId } = item
    return `<soap:Envelope xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd= "http://www.w3.org/2001/XMLSchema" xmlns:soap= "http://schemas.xmlsoap.org/soap/envelope/" >
              <soap:Body>
                <RequestTransaction ${requestTransaction?.[country as keyof typeof requestTransaction]}>
                  <Requestor>${requestor}</Requestor>
                  <Transaction>SHARED_INFO_EFACE</Transaction>
                  <Country>${country}</Country>
                  <Entity>${taxid}</Entity>
                  <User>${requestor}</User>
                  <UserName>${userName}</UserName>
                  <Data1>SHARED_NFRONT_DELETECUSTOMERBYSTAXIDBYNIT</Data1>
                  <Data2>ScountryCode|${country}|STAXID|${taxid}|${Body?.tag?.[country as keyof typeof Body.tag]}|${cTaxId}</Data2>
                  <Data3></Data3>
                </RequestTransaction>
              </soap:Body>
            </soap:Envelope>`
  }, [user])

  const getAccountDetailsConstructor = useCallback(({ taxid = '', countryCode = '' }: {taxid?: string, countryCode?: string}) => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction ${requestTransaction?.[user?.country || countryCode]}>
            <Requestor>d06a8f37-2d87-43d2-b977-04d503532786</Requestor>
            <Transaction>SHARED_INFO_EFACE</Transaction>
            <Country>${user?.country || countryCode}</Country>
            <Entity>${Body?.entity?.[user?.country || countryCode]}</Entity>
            <User>d06a8f37-2d87-43d2-b977-04d503532786</User>
            <UserName>${user?.country || countryCode}.${Body?.entity?.[user?.country || countryCode]}.${Body?.user?.[user?.country || countryCode]}</UserName>
            <Data1>SHARED_NFRONT_GETACCGRAL</Data1>
            <Data2>SCountryCode|${user?.country || countryCode}|STAXIDTOSEEK|${user?.taxid || taxid}</Data2>
            <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [user?.country, user?.taxid])

  const infoFiscalXMLConstructor = useCallback(({ requestor = '', userName = '', country = '', taxid = '' }: XmlProps) => {
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
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const getAllEstablecimientosXmlConstructor = useCallback(({ requestor = '', userName = '', country = '', taxid = '' }: XmlProps) => {
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
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const getConfigAppXmlConstructor = useCallback(({ country = '', taxid = '' }: XmlProps) => {
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
  }, [user?.country, user?.taxid])

  const getCatalogPermissionsFatherXmlConstructor = useCallback(({ country = '' }: {country?: string}) => {
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
  }, [user?.country])

  const getCatalogPermissionsActionsXmlConstructor = useCallback(({ country = '' }: {country?: string}) => {
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
  }, [user?.country])

  const getUserFatherPermissionsXmlConstructor = useCallback(({ requestor = '', taxid = '', country = '', userName = '' }: XmlProps) => {
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
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const getUserActionsPermissionsXmlConstructor = useCallback(({ requestor = '', taxid = '', country = '', userName = '' }: XmlProps) => {
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
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const getUsersByTaxIdXmlConstructor = useCallback(({ requestor = '', taxid = '', country = '', userName = '' }: XmlProps) => {
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
              <Data1>GetUsersByTaxID</Data1>
              <Data2>${user?.country || country}|${user?.taxid || taxid}</Data2>
              <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const getDecimalesXmlConstructor = useCallback(({ country = '', requestor = '', taxid = '', userName = '' }: XmlProps) => {
    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xsd="http://www.w3.org/2001/XMLSchema"
      xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <RequestTransaction ${requestTransaction?.[user?.country || country]}>
          <Requestor>${user?.requestor || requestor}</Requestor>
          <Transaction>SHARED_INFO_EFACE</Transaction>
          <Country>${user?.country || country}</Country>
          <Entity>${user?.taxid || taxid}</Entity>
          <User>${user?.requestor || requestor}</User>
          <UserName>${user?.country || country}.${user?.taxid || taxid}.${user?.userName || userName}</UserName>
          <Data1>SHARED_GETINFO_CONFIG</Data1>
          <Data2>STAXID|${user?.taxid || taxid}</Data2>
          <Data3></Data3>
        </RequestTransaction>
      </soap:Body>
    </soap:Envelope>`
  }, [user?.country, user?.requestor, user?.taxid, user?.userName])

  const getDistritosXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
                <Data1>PLANILLACC_DistritoCodes</Data1>
                <Data2>ProvinciaCode|</Data2>
                <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getProvinciasXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
                <Data1>PLANILLACC_ProvinciaCodes</Data1>
                <Data2>ProvinciaCode|</Data2>
                <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getCorregimientosXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
                <Data1>PLANILLACC_CorregimientoCodes</Data1>
                <Data2>DistritoCode|</Data2>
                <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getCountryCodesXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
              <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
              <Transaction>EXEC_STORED_PROC</Transaction>
              <Country>PA</Country>
              <Entity>155704849-2-2021</Entity>
              <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
              <UserName>PA.155704849-2-2021.FRANK</UserName>
              <Data1>PLANILLACC_GetAllCountryCodes</Data1>
              <Data2>CountryCode|PA</Data2>
              <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getCurrenciesXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
              <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
              <Transaction>EXEC_STORED_PROC</Transaction>
              <Country>PA</Country>
              <Entity>155704849-2-2021</Entity>
              <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
              <UserName>PA.155704849-2-2021.FRANK</UserName>
              <Data1>PLANILLACC_GetAllCurrencyByCountry</Data1>
              <Data2>CountryCode|PA</Data2>
              <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getIncoTermsXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
                <Data1>PLANILLACC_GetINCOTERMS</Data1>
                <Data2>SCountryCode|PA}</Data2>
                <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getSegmentosXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
                <Data1>PLANILLACC_SegmentoCodes</Data1>
                <Data2>SegmentoCode|</Data2>
                <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getFamiliasXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
                <Data1>PLANILLACC_BienServicioCodes</Data1>
                <Data2>SegmentoCode|</Data2>
                <Data3></Data3>
            </RequestTransaction>
          </soap:Body>
        </soap:Envelope>`
  }, [])

  const getUnitMeasurementXmlConstructor = useCallback(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <RequestTransaction xmlns="https://www.digifact.com.pa/schema/ws">
                <Requestor>D06A8F37-2D87-43D2-B977-04D503532786</Requestor>
                <Transaction>EXEC_STORED_PROC</Transaction>
                <Country>PA</Country>
                <Entity>155704849-2-2021</Entity>
                <User>D06A8F37-2D87-43D2-B977-04D503532786</User>
                <UserName>PA.155704849-2-2021.FRANK</UserName>
          <Data1>PLANILLACC_CATALOGO_UNIDADMEDIDA</Data1>
          <Data2>CountryCode|PA</Data2>
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
    getUserActionsPermissionsXml: getUserActionsPermissionsXmlConstructor,
    getUsersByTaxIdXml: getUsersByTaxIdXmlConstructor,
    getDecimalesXml: getDecimalesXmlConstructor,
    getDistritosXml: getDistritosXmlConstructor,
    getProvinciasXml: getProvinciasXmlConstructor,
    getCorregimientosXml: getCorregimientosXmlConstructor,
    getCountryCodesXml: getCountryCodesXmlConstructor,
    getCurrenciesXml: getCurrenciesXmlConstructor,
    getIncoTermsXml: getIncoTermsXmlConstructor,
    getSegmentosXml: getSegmentosXmlConstructor,
    getFamiliasXml: getFamiliasXmlConstructor,
    getUnitMeasurementXml: getUnitMeasurementXmlConstructor
  }
}
