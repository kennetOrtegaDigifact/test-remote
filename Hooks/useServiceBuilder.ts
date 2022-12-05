import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { appCodes } from '../Config/appCodes'
import { deletePadLeft } from '../Config/utilities'
import { ReduxState } from '../Redux/store'
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
  const { getCertTokenServiceTS, getAccountDetailsServiceTS, getTokenMIPOSServiceTS } = useApiService()
  //   const { country } = useSelector((state: ReduxState) => state.userDB)

  const loginBuilder = useCallback(async ({ userName, country, password, taxid }: loginProps) => {
    const tokenServices: {[key: string]: Array<(props: any) => Promise<{code: number, data: any, key: string}>>} = {
      GT: [getCertTokenServiceTS, getAccountDetailsServiceTS, getTokenMIPOSServiceTS],
      PA: [getCertTokenServiceTS, getAccountDetailsServiceTS]
    }
    let cleanTaxId = ''
    if (country === 'GT') {
      cleanTaxId = deletePadLeft(taxid)?.trim()
      taxid = taxid.padStart(12, '0').replace(/[^0-9Kk]/g, '').replace('k', 'K').replace('-', '').replace('/', '').trim()
    }
    const response: any = {}
    for (const s of tokenServices?.[country]) {
      await s({ userName, cleanTaxId, country, password, taxid }).then(res => {
        // if (res?.code === appCodes.ok) {
        response[res.key] = res.data
        //
      })
    }
    console.log('RESPONSE LOGIN BUILDER', response)
  }, [urls])
  return {
    loginBuilder
  }
}
