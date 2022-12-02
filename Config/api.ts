export const urlWsSoap: string = 'https://felgtaws.digifact.com.gt/gt.com.fel.wsfrontalter/felwsfront.asmx'
export const urlWsRest: string = 'https://felgtaws.digifact.com.gt/gt.com.fel.api.v3/api/'
//                        https://felgtaws.digifact.com.gt/gt.com.fel.api.v3/api/
export const urlWsRestV2: string = 'https://felgtaws.digifact.com.gt/gt.com.fel.api.v3/api/'
export const urlWsToken: string = 'https://felgtaws.digifact.com.gt/gt.com.fel.api.v2/api/login/get_token'
// export const urlXMLTransformation = `https://felgtaws.digifact.com.gt/gt.com.fel.api.jsontoxml.v3/api/Xmljsontransformation`
export const urlXMLTransformation: string = 'https://felgtaws.digifact.com.gt/gt.com.fel.api.jsontoxml/api/Xmljsontransformation'

export const urlApiMs: string = 'https://felgtaws.digifact.com.gt/gt.com.apims/api'
const PAURLBASE = 'https://pactest.digifact.com.pa'
const GTURLBASE = 'https://felgtaws.digifact.com.gt'
type urls={
    urlWsSoap?: string
    urlWsRest?: string
    urlWsRestV2?: string
    urlToken?: string
    urlXMLTransformation?: string
    urlApiMs?: string
    urlApiNUC?: string
    urlWeb?: string
}
export const urlsByCountry: {[key: string]: urls} = {
  GT: {
    urlWsSoap: `${GTURLBASE}/gt.com.fel.wsfrontalter/felwsfront.asmx`,
    urlWsRest: `${GTURLBASE}/gt.com.fel.api.v3/api/`,
    urlWsRestV2: `${GTURLBASE}/gt.com.fel.api.v3/api/`,
    urlToken: `${GTURLBASE}/gt.com.apinuc/api/login/get_token`,
    urlXMLTransformation: `${GTURLBASE}/gt.com.fel.api.jsontoxml/api/Xmljsontransformation`,
    urlApiMs: `${GTURLBASE}/gt.com.apims/api`
  },
  PA: {
    urlWsSoap: `${PAURLBASE}/pa.com.wsfront/FEWSFRONT.asmx`,
    urlApiNUC: `${PAURLBASE}/pa.com.apinuc/api/`,
    urlApiMs: `${PAURLBASE}/pa.com.apims/api/`,
    urlWeb: `${PAURLBASE}/`,
    urlToken: `${PAURLBASE}/pa.com.apinuc/api/login/get_token`
  }
}
