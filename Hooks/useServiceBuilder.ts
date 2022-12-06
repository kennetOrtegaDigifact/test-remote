import { useCallback } from 'react'
import { appCodes } from '../Config/appCodes'
import { acceptedCountrys } from '../Config/dictionary'
import { deletePadLeft } from '../Config/utilities'
import { userInterface, UTILSDB } from '../types'
import { useApiService } from './useApiService'
import { useURLS } from './useUrls'
type loginProps={
    userName: string
    password: string
    taxid: string
    country: string
}
export const useServiceBuilder = () => {
  const { urls } = useURLS()
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
    getDecimalesServiceTS
  } = useApiService()
  //   const { country } = useSelector((state: ReduxState) => state.userDB)
  const loginBuilder = useCallback(async ({ userName, country, password, taxid }: loginProps): Promise<{
    code: number
    data: userInterface
  }> => {
    const tokenServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getCertTokenServiceTS, getAccountDetailsServiceTS, getTokenMIPOSServiceTS],
      PA: [getCertTokenServiceTS, getAccountDetailsServiceTS]
    }
    const infoServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getConfigAppServiceTS, getPermissionsServiceTS, getAllClientsServiceTS, getAllProductsServiceTS, getAllUsersByTaxIdServiceTS, getLogosServiceTS, getDecimalesServiceTS],
      PA: [getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getAllPerfilFacturacionServiceTS, getPermissionsServiceTS, getAllClientsServiceTS, getAllProductsServiceTS, getAllUsersByTaxIdServiceTS, getLogosServiceTS, getDecimalesServiceTS]
    }
    // const utilitiesServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
    //   GT: [getCountryCodesServiceTS],
    //   PA: [getCountryCodesServiceTS]
    // }

    let cleanTaxId = ''
    if (country === 'GT') {
      cleanTaxId = deletePadLeft(taxid)?.trim()
      taxid = taxid.padStart(12, '0').replace(/[^0-9Kk]/g, '').replace('k', 'K').replace('-', '').replace('/', '').trim()
    }
    const userInfo: userInterface = {
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
          userInfo[res.key as keyof typeof userInfo] = res.data
        }
      })
    }
    const requestor = userInfo?.sharedData?.requestor || ''
    for (const s of infoServices?.[country]) {
      if (userInfo?.establecimientos?.length) {
        await s({ userName, cleanTaxId, country, password, taxid, requestor, establecimientos: (userInfo?.establecimientos || []) }).then(res => {
          // if (res?.code === appCodes.ok) {
          userInfo[res.key as keyof typeof userInfo] = res.data
          //
        })
      } else {
        await s({ userName, cleanTaxId, country, password, taxid, requestor }).then(res => {
          // if (res?.code === appCodes.ok) {
          userInfo[res.key as keyof typeof userInfo] = res.data
          //
        })
      }
    }
    console.log('RESPONSE LOGIN BUILDER', JSON.stringify(userInfo))
    // let code = (userInfo?.token?.length) ? appCodes.ok : appCodes.unauthorized
    // code = (userInfo?.taxid?.length && acceptedCountrys?.[userInfo?.country || ''] && userInfo?.token?.length) ? appCodes.ok : appCodes.processError
    // return new Promise((resolve) => resolve({
    //   code,
    //   data: userInfo
    // }))

    if (userInfo?.token?.length) {
      if (userInfo?.taxid?.length && acceptedCountrys?.[userInfo?.country || '']) {
        return new Promise((resolve) => resolve({
          code: appCodes.ok,
          data: userInfo
        }))
      } else {
        return new Promise((resolve) => resolve({
          code: appCodes.processError,
          data: {}
        }))
      }
    } else {
      return new Promise((resolve) => resolve({
        code: appCodes.unauthorized,
        data: {}
      }))
    }
  }, [])
  return {
    loginBuilder
  }
}
