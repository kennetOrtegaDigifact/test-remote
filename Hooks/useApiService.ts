import { XMLParser } from 'fast-xml-parser'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { appCodes } from '../Config/appCodes'
import { options } from '../Config/xmlparser'
import { ReduxState } from '../Redux/store'
import { ConsultaDTE, Filter } from '../types'
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
export const useApiService = () => {
  const { urls } = useSelector((state: ReduxState) => state.userDB)
  const getDTESServiceGT = useCallback(({
    country = '',
    taxid = '',
    requestor = '',
    userName = '',
    nitReceptor = '',
    numeroSerie = '',
    establecimientos,
    allDTESorUsername = '',
    tipoDocumento,
    fechaInicio = '',
    fechaFin = '',
    amountFrom,
    amountTo,
    paymentType,
    porAnulados,
    limit = 30,
    signal
  }: FetchProps & Filter): Promise<{
  code: number
  data?: ConsultaDTE[]
}> => {
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
                          <Branch>${establecimientos || '1'}|${allDTESorUsername || 'n'}|</Branch>
                          <CurrencyCode>GTQ</CurrencyCode>
                          <RCountryCode>${country}</RCountryCode>
                          <RTaxIdOrName>${nitReceptor}</RTaxIdOrName>
                          <SKind>${tipoDocumento || '0'}</SKind>
                          <ReturnBatchAsLike>${Boolean(numeroSerie?.length)}</ReturnBatchAsLike>
                          <Batch>${numeroSerie}</Batch>
                          <UseSerialFrom>false</UseSerialFrom>
                          <UseSerialTo>false</UseSerialTo>
                          <SerialFrom>0</SerialFrom>
                          <SerialTo>0</SerialTo>
                          <UseInternalIDFrom>false</UseInternalIDFrom>
                          <UseInternalIDTo>false</UseInternalIDTo>
                          <InternalIDFrom>0</InternalIDFrom>
                          <InternalIDTo>0</InternalIDTo>
                          <UseDateFrom>${Boolean(fechaInicio?.length)}</UseDateFrom>
                          <UseDateTo>${Boolean(fechaFin?.length)}</UseDateTo>
                          <DateFrom>${fechaInicio || '2000-01-01'}T00:00:00</DateFrom>
                          <DateTo>${fechaFin || new Date().toISOString().slice(0, 10)}T23:59:59.999</DateTo>
                          <UseAmountFrom>${(amountFrom || 0) >= 0}</UseAmountFrom>
                          <UseAmountTo>${(amountTo || 0) > 0}</UseAmountTo>
                          <AmountFrom>${amountFrom || '0'}</AmountFrom>
                          <AmountTo>${amountTo || '0'}</AmountTo>
                          <Paid>${paymentType || '2'}</Paid>
                          <Cancelled>${porAnulados || '0'}</Cancelled>
                          <Distributed>2</Distributed>
                          <QueryTop>${limit || '30'}</QueryTop>
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
    return globalThis.fetch(urls?.urlWsSoap, {
      signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml
    })
      .then(res => res.text())
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
              const dataDTES: ConsultaDTE[] = arrayDTES.flat().map((dte) => {
                const obj: ConsultaDTE = {
                  documentType: dte.A,
                  countryCode: dte.W,
                  clientTaxid: dte.B,
                  clientName: dte.C,
                  userCountryCode: dte.X,
                  userTaxId: dte.Y,
                  razonSocial: dte.Z,
                  numeroSerie: dte.D,
                  numeroDocumento: dte.E,
                  establecimiento: dte.S,
                  fechaEmision: dte.F,
                  monto: dte.G,
                  paidTime: dte.H,
                  cancelled: dte.I,
                  numeroAuth: dte.DG,
                  internalID: dte.IntID,
                  userName: dte.userName
                }
                return obj
              })
              return {
                code: appCodes.ok,
                data: dataDTES
              }
            }
          }
          return {
            code: appCodes.dataVacio
          }
        } catch (ex) {
          console.log('EXCEPTION GET DTES SERVICE', ex)
          return {
            code: appCodes.processError
          }
        }
      })
      .catch((err) => {
        console.log('ERROR FECTH DTES', err)
        if (err.message === 'Aborted') {
          return {
            code: appCodes.ok
          }
        }
        return {
          code: appCodes.processError
        }
      })
  }, [urls?.urlWsSoap])

  const schema: {
        getDTESService: {
          [key: string]: any
      }
  } = {
    getDTESService: {
      GT: getDTESServiceGT
    }
  }
  return {
    Services: schema
  }
}
