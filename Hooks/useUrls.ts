import { useState, useCallback, useEffect } from 'react'

import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { ConfiguracionApp } from '../types'

export const useURLS = (): {urls: {[key: string]: string}} => {
  const { country, configuracionApp } = useSelector((state: ReduxState) => state.userDB)
  const [urls, setUrls] = useState<{[key: string]: string}>({
    urlWsRestV2: '',
    urlWsRestV3: '',
    urlWsSoap: '',
    urlWsJsonToXml: '',
    urlWsJsonToXml2: '',
    urlWsToken: '',
    urlApiNUC: ''
  })
  const getURLSGT = useCallback(() => {
    const urlsConfig = configuracionApp?.filter(e => e.idTipoConfiguracion === 8)
    const obj: {[key: string]: string } = {}
    urlsConfig?.forEach((e: ConfiguracionApp) => {
      obj[`url${e?.tipoOperacion || ''}`] = e?.valor?.toString() || ''
    })
    setUrls(obj)
    console.log('URLS OBJECT', obj)
  }, [configuracionApp])

  useEffect(() => {
    if (country === 'GT') {
      getURLSGT()
    }
  }, [country])

  return {
    urls
  }
}
