import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { appCodes } from '../Config/appCodes'
import { acceptedCountrys } from '../Config/dictionary'
import { deletePadLeft } from '../Config/utilities'
import { ReduxState } from '../Redux/store'
import { NUC, printerFunctions, userInterface, UTILSDB } from '../types'
import { useApiService } from './useApiService'
import { useBluetoothService } from './useBluetoothService'
import { usePrinter } from './usePrinter'
type loginProps={
    userName: string
    password: string
    taxid: string
    country: string
}
export const useServiceBuilder = () => {
  const { country = '' } = useSelector((state: ReduxState) => state.userDB)
  const print = usePrinter()
  const { connectToPrint } = useBluetoothService()
  const {
    getCertTokenServiceTS,
    getAccountDetailsServiceTS,
    getTokenMIPOSServiceTS,
    getInfoFiscalServiceTS,
    getAllEstablecimientosServiceTS,
    getAllPerfilFacturacionServiceTS,
    getConfigAppServiceTS,
    getPermissionsServiceTS,
    getAllClientsServiceTS,
    getAllProductsServiceTS,
    getCountryCodesServiceTS,
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
    getUnitMeasurementServiceTS
  } = useApiService()
  //   const { country } = useSelector((state: ReduxState) => state.userDB)
  const loginBuilder = useCallback(async ({ userName, country, password, taxid }: loginProps): Promise<{
    code: number
    data: {
      user: userInterface,
      utilities: UTILSDB
    }
  }> => {
    const tokenServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getCertTokenServiceTS, getAccountDetailsServiceTS, getTokenMIPOSServiceTS],
      PA: [getCertTokenServiceTS, getAccountDetailsServiceTS]
    }
    const infoServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getConfigAppServiceTS, getPermissionsServiceTS, getAllClientsServiceTS, getAllProductsServiceTS, getAllUsersByTaxIdServiceTS, getLogosServiceTS, getDecimalesServiceTS],
      PA: [getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getAllPerfilFacturacionServiceTS, getPermissionsServiceTS, getAllClientsServiceTS, getAllProductsServiceTS, getAllUsersByTaxIdServiceTS, getLogosServiceTS, getDecimalesServiceTS]
    }
    const utilitiesServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getCountryCodesServiceTS, getUnitMeasurementServiceTS],
      PA: [getCountryCodesServiceTS, getProvinciasServiceTS, getDistritosServiceTS, getCorregimientosServiceTS, getCurrenciesServiceTS, getIncoTermsServiceTS, getSegmentosServiceTS, getFamiliasServiceTS, getUnitMeasurementServiceTS]
    }

    let cleanTaxId = ''
    if (country === 'GT') {
      cleanTaxId = deletePadLeft(taxid)?.trim()
      taxid = taxid.padStart(12, '0').replace(/[^0-9Kk]/g, '').replace('k', 'K').replace('-', '').replace('/', '').trim()
    }
    const userInfo: userInterface = {
      userName,
      country,
      taxid,
      cleanTaxId,
      configuracionGeneral: {
        actionsInRealTime: false,
        windowsInRealTime: false,
        instaPrint: true
      }
    }

    for (const s of tokenServices?.[country]) {
      await s({ userName, cleanTaxId, country, password, taxid }).then(res => {
        if (res?.code === appCodes.ok) {
          userInfo[res.key] = res.data
        }
      })
    }
    const requestor = userInfo?.sharedData?.requestor || ''
    for (const s of infoServices?.[country]) {
      if (userInfo?.establecimientos?.length) {
        await s({ userName, cleanTaxId, country, password, taxid, requestor, establecimientos: (userInfo?.establecimientos || []) }).then(res => {
          // if (res?.code === appCodes.ok) {
          userInfo[res.key] = res.data
          //
        })
      } else {
        await s({ userName, cleanTaxId, country, password, taxid, requestor }).then(res => {
          // if (res?.code === appCodes.ok) {
          userInfo[res.key] = res.data
          //
        })
      }
    }
    userInfo.requestor = requestor || ''
    const utilitiesDB: UTILSDB = {}
    for (const s of utilitiesServices?.[country]) {
      await s({ userName, cleanTaxId, country, password, taxid }).then(res => {
        utilitiesDB[res.key as keyof typeof utilitiesDB] = res.data
      })
    }

    console.log('RESPONSE LOGIN BUILDER USER', JSON.stringify(userInfo))
    console.log('RESPONSE LOGIN BUILDER UTILITIES', JSON.stringify(utilitiesDB))

    if (userInfo?.token?.length) {
      if (userInfo?.taxid?.length && acceptedCountrys?.[userInfo?.country || '']) {
        return new Promise((resolve) => resolve({
          code: appCodes.ok,
          data: {
            user: userInfo,
            utilities: utilitiesDB
          }
        }))
      } else {
        return new Promise((resolve) => resolve({
          code: appCodes.processError,
          data: {
            user: {},
            utilities: {}
          }
        }))
      }
    } else {
      return new Promise((resolve) => resolve({
        code: appCodes.unauthorized,
        data: {
          user: {},
          utilities: {}
        }
      }))
    }
  }, [])

  const ticketBuilder = useCallback(async ({ customOrder = {}, json = { Header: {}, Buyer: {}, Seller: {}, ThirdParties: [], Items: [], Totals: { GrandTotal: {} }, AdditionalDocumentInfo: {} } }:{customOrder?: printerFunctions, json: NUC}) => {
    const order: printerFunctions =
      customOrder?.[country]?.length
        ? customOrder
        : {
            GT: ['logo', 'header', 'docInfo', 'clientInfo', 'items', 'totals', 'extras', 'qrcode', 'certInfo'],
            PA: ['logo', 'header', 'docInfo', 'clientInfo', 'items', 'totals', 'qrcode', 'extras', 'certInfo']
          }
    connectToPrint()
      .then(async res => {
        if (res?.code === appCodes.ok) {
          for (const f of order?.[country]) {
            await print?.[f]?.[country](json)
          }
        }
      })
      .catch(err => {
        console.log('ERROR CONNECT TO PRINT TICKET BUILDER', err)
      })
  }, [print, country, connectToPrint])

  return {
    loginBuilder,
    ticketBuilder
  }
}
