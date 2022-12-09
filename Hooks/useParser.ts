import base64 from 'react-native-base64'
import { XMLParser } from 'fast-xml-parser'
import { optionsWithAttr } from '../Config/xmlparser'
import { appCodes } from '../Config/appCodes'
import { useCallback } from 'react'
import { NUC } from '../types'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
type NUCResponse = Promise<{
        code: number
        data?: NUC
  }>
const parserXMLBase64 = (XML?: string): {
    code: number
    data: any
} => {
  try {
    if (typeof XML === 'string') {
      const parser = new XMLParser(optionsWithAttr)
      const xmlRep = XML.replace(/(\r\n|\n|\r)/gm, '')
      const xmlString = base64.decode(xmlRep)
      // console.log('XML ORIGINAL', xmlString)
      const data = parser.parse(xmlString)
      return {
        code: appCodes.ok,
        data
      }
    } else {
      return {
        code: appCodes.invalidData,
        data: {}
      }
    }
  } catch (ex) {
    console.log('EXCEPTION parserXMLBase64 FUNCTION IN USE PARSER HOOK', ex)
    return {
      code: appCodes.processError,
      data: {}
    }
  }
}
export const useParser = () => {
  const { country = '' } = useSelector((state: ReduxState) => state.userDB)

  const parseXmlToJsonNUCPA = useCallback(async (xml?: string): NUCResponse => {
    return new Promise((resolve, reject) => {
      try {
        const res = parserXMLBase64(xml)
        const gDGen = res.data.rContFe.xFe.rFE.gDGen
        const gItem = res.data.rContFe.xFe.rFE.gItem
        const gTot = res.data.rContFe.xFe.rFE.gTot
        console.log('PARSE XML TO PRINT ', JSON.stringify(res.data))
        console.log('------------------------------ DEGEN --------------------------', JSON.stringify(gDGen))
        const data: NUC = {
          CountryCode: country,
          Header: {
            DocType: ('00' + gDGen.iDoc).slice(-2),
            IssuedDateTime: gDGen.dFechaEm,
            AdditionalIssueDocInfo: [
              {
                Name: 'TipoEmision',
                Value: '00'
              },
              {
                Name: 'NumeroDF',
                Value: ('0000000000' + gDGen.dNroDF).slice(-10)
              },
              {
                Name: 'PtoFactDF',
                Value: ('0000000000' + gDGen.dPtoFacDF).slice(-10)
              },
              {
                Name: 'CodigoSeguridad',
                Value: ('000000000' + gDGen.dSeg).slice(-9)
              },
              {
                Name: 'NaturalezaOperacion',
                Value: ('00' + gDGen.iNatOp).slice(-2)
              },
              {
                Name: 'TipoOperacion',
                Value: gDGen.iTipoOp
              },
              {
                Name: 'DestinoOperacion',
                Value: gDGen.iDest
              },
              {
                Name: 'FormatoGeneracion',
                Value: gDGen.iFormCAFE
              },
              {
                Name: 'ManeraEntrega',
                Value: gDGen.iEntCAFE
              },
              {
                Name: 'EnvioContenedor',
                Value: gDGen.dEnvFE
              },
              {
                Name: 'ProcesoGeneracion',
                Value: gDGen.iProGen
              },
              {
                Name: 'TipoTransaccion',
                Value: gDGen.iTipoTranVenta
              },
              {
                Name: 'TipoSucursal',
                Value: gDGen.iTipoSuc
              }
            ]
          },
          Seller: {
            TaxID: gDGen.gEmis.gRucEmi.dRuc,
            TaxIDType: gDGen.gEmis.gRucEmi.dTipoRuc,
            TaxIDAdditionalInfo: [
              {
                Name: 'DigitoVerificador',
                Value: gDGen.gEmis.gRucEmi.dDV
              }
            ],
            Name: gDGen.gEmis.dNombEm,
            BranchInfo: {
              Code: gDGen.gEmis.dSucEm,
              AddressInfo: {
                Address: gDGen.gEmis.dDirecEm,
                City: gDGen.gEmis.gUbiEm.dCorreg,
                District: gDGen.gEmis.gUbiEm.dDistr,
                State: gDGen.gEmis.gUbiEm.dProv,
                Country: 'PA'
              },
              AdditionalBranchInfo: [
                {
                  Name: 'CoordEm',
                  Value: gDGen.gEmis.dCoordEm
                },
                {
                  Name: 'CodUbi',
                  Value: gDGen.gEmis.gUbiEm.dCodUbi
                }
              ]
            }
          },
          Buyer: {
            ...gDGen.gDatRec.iTipoRec === '01' || gDGen.gDatRec.iTipoRec === 1
              ? {
                  TaxID: gDGen.gDatRec.gRucRec.dRuc,
                  TaxIDType: gDGen.gDatRec.gRucRec.dTipoRuc
                }
              : {},
            ...gDGen.gDatRec.iTipoRec === '02' || gDGen.gDatRec.iTipoRec === 2 ? { TaxID: 'CF' } : {},
            ...gDGen.gDatRec.iTipoRec === '03' || gDGen.gDatRec.iTipoRec === 3
              ? {
                  TaxID: gDGen?.dRuc || gDGen?.gDatRec?.gRucRec?.dRuc,
                  TaxIDType: gDGen.dTipoRuc
                }
              : {},
            ...gDGen.gDatRec.iTipoRec === '04' || gDGen.gDatRec.iTipoRec === 4 ? { TaxID: 'EXTRANJERO' } : {},

            TaxIDAdditionalInfo: [
              {
                Name: 'TipoReceptor',
                Value: gDGen.gDatRec.iTipoRec?.toString()?.padStart(2, '0')
              },
              ...(gDGen.gDatRec.iTipoRec === '02' || gDGen.gDatRec.iTipoRec === 2) && gDGen?.gDatRec?.gRucRec?.dRuc?.toString()?.length
                ? [{
                    Name: 'CedulaCF',
                    Value: gDGen?.gDatRec?.gRucRec?.dRuc || ''
                  }]
                : [],
              ...(gDGen.gDatRec.iTipoRec === '04' || gDGen.gDatRec.iTipoRec === 4) && gDGen?.gDatRec?.gIdExt?.dIdExt?.toString()?.length
                ? [{
                    Name: 'NumPasaporte',
                    Value: gDGen?.gDatRec?.gIdExt?.dIdExt || ''
                  }]
                : []
            /* ...xml.getElementsByTagName("dCodUbi")[1] !== 'undefined' && [{
                            "Name": "CodUbi",
                            "Value": xml.getElementsByTagName("dCodUbi")[1].firstChild.nodeValue
                        }] */
            ],
            ...gDGen.gDatRec.dNombRec && { Name: gDGen.gDatRec.dNombRec },
            AdditionlInfo: [
              {
                Name: 'PaisReceptorFE',
                Value: gDGen.gDatRec.cPaisRec
              }
            ],

            AddressInfo: {
              ...gDGen.gDatRec.dDirecRec && { Address: gDGen.gDatRec.dDirecRec },
              ...gDGen.gDatRec.gUbiRec && { City: gDGen.gDatRec.gUbiRec.dCorreg },
              ...gDGen.gDatRec.gUbiRec && { District: gDGen.gDatRec.gUbiRec.dDistr },
              ...gDGen.gDatRec.gUbiRec && { State: gDGen.gDatRec.gUbiRec.dProv },
              ...gDGen.gDatRec.cPaisRec && { Country: gDGen.gDatRec.cPaisRec }
            }

          },
          Items: [gItem].flat().map(e => {
            const obj = {
              Codes: [], // Este quedo vacio porque realmente no sive para la reimpresion
              Description: e.dDescProd,
              Qty: e.dCantCodInt,
              UnitOfMeasure: e.cUnidad,
              Price: e.dPrItem,
              ...e.dPrUnitDesc && {
                Discounts: {
                  Discount: [
                    { Amount: e.dPrUnitDesc }
                  ]
                }
              },
              Taxes: {
                Tax: [
                  {
                    Code: e.gITBMSItem.dTasaITBMS,
                    Description: 'ITBMS',
                    Amount: e.gITBMSItem.dValITBMS
                  }
                ]
              },
              Charges: {
                Charge: [
                ]
              },
              Totals: {
                TotalBTaxes: e.gPrecios.dPrUnit,
                TotalWTaxes: e.gPrecios.dPrItem,
                SpecificTotal: e.gPrecios.dValTotItem,
                TotalItem: e.gPrecios.dValTotItem
              }
            }
            return obj
          }),
          Payments: [gTot.gFormaPago].flat().map(e => {
            const obj = {
              Type: ('00' + e.iFormaPago).slice(-2),
              Amount: e.dVlrCuota,
              ...e.iFormaPago.toString() === '99' && {
                Description: e?.dFormaPagoDesc || 'Otra forma de Pago'
              }
            // Comentados pa mientras veo ejemplos de como vienen las cuotas
            // FORMA PAGO OTROS -> Descripcion
            // Description: null,
            // FPAGO A PLAZOS -> Fecha de Pago/Vencimiento de la cuota
            // Date: null,
            }
            return obj
          }),
          // Charges verificar como vienen y como guarlos, esto al estar certificando xd
          // Charges: {

          // },
          Totals: {
            QtyItems: gTot.dNroItems,
            TotalCharges: null,
            TotalDiscounts: null,
            GrandTotal: {
              TotalBTaxes: gTot.dTotNeto,
              TotalBDiscounts: 0.0,
              TotalWDiscounts: gTot.dVTot,
              InvoiceTotal: gTot.dVTot
            }
          },
          AdditionalDocumentInfo: {
            AdditionalInfo: [
              {
                AditionalInfo: [
                  {
                    Name: 'TiempoPago',
                    Value: gTot.iPzPag
                  }
                ],
                ...gDGen.gFExp && [
                  {
                    Name: 'CondEntr',
                    Value: gDGen.gFExp.cCondEntr
                  },
                  {
                    Name: 'PuertoEmbarq',
                    Value: gDGen.gFExp.dPuertoEmbarq
                  }
                ]
              }
            ],
            CUFE: res.data.rContFe.xProtFe.rProtFe.gInfProt.dCUFE,
            Serie: gDGen.dSeg,
            Numero: gDGen.dNroDF,
            FechaEmi: gDGen.dFechaEm,
            FechaCert: gDGen.dFechaEm,
            QRCode: res.data.rContFe.xFe.rFE.gNoFirm.dQRCode
          }
        }
        resolve({
          code: appCodes.ok,
          data
        })
      } catch (ex) {
        console.warn('EXCEPTION PARSE XML TO PRINT', ex)
        reject(ex)
      }
    })
  }, [country])

  const parseXmlToJsonNUCGT = useCallback(async (xml?: string):NUCResponse => {
    return new Promise((resolve) => resolve({
      code: appCodes.ok
    }))
  }, [])
  const parseXmlToJsonNUCPerCountry: {[key: string]: (xml?: string) => NUCResponse} = {
    GT: parseXmlToJsonNUCGT,
    PA: parseXmlToJsonNUCPA
  }
  return {
    parseXmlToJsonNUC: parseXmlToJsonNUCPerCountry?.[country]
  }
}
