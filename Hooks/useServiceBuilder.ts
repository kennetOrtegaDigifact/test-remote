import { useCallback } from 'react'
import { appCodes } from '../Config/appCodes'
import { deletePadLeft } from '../Config/utilities'
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
  const { getCertTokenServiceTS, getAccountDetailsServiceTS, getTokenMIPOSServiceTS, getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getAllPerfilFacturacionServiceTS, getConfigAppServiceTS, getPermissionsServiceTS } = useApiService()
  //   const { country } = useSelector((state: ReduxState) => state.userDB)
  const loginBuilder = useCallback(async ({ userName, country, password, taxid }: loginProps) => {
    const tokenServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getCertTokenServiceTS, getAccountDetailsServiceTS, getTokenMIPOSServiceTS],
      PA: [getCertTokenServiceTS, getAccountDetailsServiceTS]
    }
    const infoServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getConfigAppServiceTS, getPermissionsServiceTS],
      PA: [getInfoFiscalServiceTS, getAllEstablecimientosServiceTS, getAllPerfilFacturacionServiceTS, getPermissionsServiceTS]
    }
    let cleanTaxId = ''
    if (country === 'GT') {
      cleanTaxId = deletePadLeft(taxid)?.trim()
      taxid = taxid.padStart(12, '0').replace(/[^0-9Kk]/g, '').replace('k', 'K').replace('-', '').replace('/', '').trim()
    }
    const response: any = {
      taxid,
      cleanTaxId
    }
    for (const s of tokenServices?.[country]) {
      await s({ userName, cleanTaxId, country, password, taxid }).then(res => {
        if (res?.code === appCodes.ok) {
          response[res.key] = res.data
        }
      })
    }
    const requestor = response?.sharedData?.requestor || ''
    for (const s of infoServices?.[country]) {
      await s({ userName, cleanTaxId, country, password, taxid, requestor }).then(res => {
        // if (res?.code === appCodes.ok) {
        response[res.key] = res.data
        //
      })
    }
    console.log('RESPONSE LOGIN BUILDER', JSON.stringify(response))
  }, [])
  return {
    loginBuilder
  }
}
