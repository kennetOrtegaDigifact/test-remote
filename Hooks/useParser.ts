import base64 from 'react-native-base64'
import { XMLParser } from 'fast-xml-parser'
import { optionsWithAttr } from '../Config/xmlparser'
import { appCodes } from '../Config/appCodes'
import { useCallback } from 'react'
import { AditionalData, ItemNUC, NUC, Tax } from '../types'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { cleanAccents, frase9GT, frasesDictionaryGT } from '../Config/utilities'
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

const parseDirectionGT = (data?: any, key?: string): string => {
  // keys = DireccionEmisor, DireccionReceptor
  const direccion = cleanAccents(`${data?.[key || 'DireccionEmisor']?.Direccion || 'CIUDAD'}`)
  console.log('------------ DIRECCION INGRESADA-------------', direccion)
  const mun = cleanAccents(data?.[key || 'DireccionEmisor']?.Municipio || '')
  const mR = mun.split(' ')
  let municipio = ''
  mR?.forEach(e => {
    console.log(e)
    if (e?.includes('Jos')) {
      municipio += ' Jose'
    } else {
      municipio += ` ${e?.trim()}`
    }
  })
  municipio = municipio?.trim()
  const departamento = cleanAccents(data?.[key || 'DireccionEmisor']?.Departamento || '')
  const direccionPlusMunicipio = !direccion?.toLowerCase()?.includes(municipio?.toLowerCase())
    ? `${direccion}, ${municipio}`
    : direccion
  const direccionPlusDepartamento = !(direccionPlusMunicipio?.split(',')?.length === 3)
    ? `${direccionPlusMunicipio}, ${departamento}`
    : direccionPlusMunicipio

  return direccionPlusDepartamento
}
export const useParser = () => {
  const { country = '', configuracionApp } = useSelector((state: ReduxState) => state.userDB)

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

  const parseXmlToJsonNUCGT = useCallback(async (xml?: string): NUCResponse => {
    try {
      const res = parserXMLBase64(xml)
      const leyendasDictionary = configuracionApp?.filter(e => e.idTipoConfiguracion === 13) // Leyendas subsidio
      const subsidioGasDictionary = configuracionApp?.filter(e => e.idTipoConfiguracion === 11) // Subsidio gasolina
      const subsidioGasDictionaryPropano = configuracionApp?.filter(e => e.idTipoConfiguracion === 12) // Subsidio propano
      const idpGasDictionary = configuracionApp?.map(e => {
        const obj: {
        idp?: number,
        nombre?: string
        codGravable?: string | number
      } = {}
        if (e.idTipoConfiguracion === 7) {
          obj.idp = Number(e?.valor) // monto a descontar
          obj.nombre = e.tipoOperacion // nombre del subsidio
          obj.codGravable = e.nit // codigo de sat para identificar el tipo
          return obj
        }
        return null
      })?.filter(e => e !== null) // IDP gasolina
      console.log('RESPONSE JSON GT', JSON.stringify(res))

      const cuerpoFact = res?.data.GTDocumento?.SAT?.DTE
      const adenda = res?.data?.GTDocumento?.SAT?.Adenda || {}
      const datosEmision = cuerpoFact?.DatosEmision
      const datosReceptor = cuerpoFact?.DatosEmision?.Receptor
      const datosCertificacion = cuerpoFact?.Certificacion
      const emisorData = cuerpoFact?.DatosEmision?.Emisor
      const complementos = datosEmision?.Complementos
      const itemsArr = datosEmision?.Items?.Item || []
      const items = [itemsArr].flat()
      const direccionEmisor = parseDirectionGT(emisorData, 'DireccionEmisor')
      console.log('---------- COMPLEMENTOS -------------', JSON.stringify(complementos))
      console.log('---------- ADENDA -------------------', JSON.stringify(adenda))
      console.log('---------- EMISOR -------------------', JSON.stringify(emisorData))
      console.log('---------- CERTIFICACION -------------------', JSON.stringify(datosCertificacion))
      console.log('---------- DIRECCION EMISOR -------------------', direccionEmisor)
      console.log('---------- DATOS RECEPTOR -------------------', datosReceptor)
      console.log('---------- DATOS ITEMS -------------------', JSON.stringify(items))
      const bienesServicios: {[key: string]: string} = {
        B: 'BIEN',
        S: 'SERVICIO',
        '': ''
      }
      // -------- ARRAY DE FRASES
      const arrFr = []
      arrFr.push(datosEmision?.Frases?.Frase || [])

      // -------- ITEMS
      // frases para gasolina y derivados del petroleo
      const gasIdpsDiscount = items.map(e => {
        const obj: any = {}
        // console.log(e.impuestos.some(e => e.NombreCorto === 'PETROLEO'))
        if ([e?.Impuestos?.Impuesto || []].flat().some((e: any) => e.NombreCorto === 'PETROLEO')) {
          obj.nombre = e.Descripcion
          obj.cantidad = e.Cantidad
          obj.precio = e.PrecioUnitario
          obj.codGravable = [e?.Impuestos?.Impuesto || []].flat().find(e => e.NombreCorto === 'PETROLEO').CodigoUnidadGravable
          const IDP = idpGasDictionary?.find(e => e?.codGravable === obj?.codGravable) || 0
          if (IDP?.nombre === 'GasPropano') { // Gas propano
            subsidioGasDictionaryPropano?.forEach(k => {
              const libs = k?.nombre?.replace('lbs', '')
              const libsNum = parseFloat(libs)
              const cantiLbsXml = parseFloat(e.cantidad) * 4.19// convertimos los galones a libras
              const cantiLimitMin = libsNum - 0.1// limitie min de libras por si los calculos no son exactos
              const cantiLimitMax = libsNum + 0.1
              if (cantiLbsXml >= cantiLimitMin && cantiLbsXml <= cantiLimitMax) {
                obj.descuentoSubsidio += parseFloat(k.valor || 0)
                obj.descuentoSubsidio += e?.cantidad * parseFloat(k.valor || 0)
              }
            })
          } else {
          // console.log('COMOOOOOOOOOO', subsidioGasDictionary, IDP)
            const SUB = subsidioGasDictionary?.find(e => e?.tipoOperacion?.toLowerCase()?.includes(IDP?.nombre?.toLowerCase()))
            obj.descuentoSubsidio = 0
            obj.descuentoSubsidio += e.cantidad * parseFloat(SUB?.valor || 0)
          }
          return obj
        }
        return null
      }).filter(e => e !== null)

      let montoImpuestos = 0.0
      const NUC: NUC = {
        Version: '1.00',
        CountryCode: country || 'GT',
        Header: {
          DocType: datosEmision?.DatosGenerales?.['@_Tipo'] || 'UNKNOWN',
          IssuedDateTime: datosEmision?.DatosGenerales?.['@_FechaHoraEmision'] || '',
          Currency: datosEmision?.DatosGenerales?.['@_CodigoMoneda'] || 'GTQ'
        },
        Seller: {
          TaxID: emisorData?.['@_NITEmisor'] || '',
          TaxIDAdditionalInfo: [
            {
              Name: 'AfiliacionIVA',
              Value: emisorData?.['@_AfiliacionIVA'] || ''
            }
          ],
          Name: emisorData?.['@_NombreEmisor'] || '',
          Contact: {},
          AdditionlInfo: arrFr.flat().map(e => {
            if (e['@_TipoFrase'] !== '9') {
            // console.log('COMOO',`${frasesDictionaryGT[e['@_TipoFrase']]}`)
              return {
                Name: 'TipoFrase',
                Value: `${frasesDictionaryGT[e['@_TipoFrase']][e['@_CodigoEscenario']]}`
              }
            }
            if (e['@_TipoFrase'] === '9') {
              let frase9 = null
              gasIdpsDiscount.forEach(i => {
                frase9 = frase9GT({ tipo: e['@_TipoFrase'], escenario: e['@_CodigoEscenario'], items: i, leyendas: leyendasDictionary, granTotal: datosEmision.Totales.GranTotal })
              })
              return {
                Name: 'TipoFrase',
                Value: frase9 || ''
              }
            }
            return {
              Name: '',
              Value: ''
            }
          })?.filter(e => e?.Name !== '' && e?.Value !== ''),
          AddressInfo: null,
          BranchInfo: {
            Code: emisorData?.['@_CodigoEstablecimiento'] || '',
            Name: emisorData?.['@_NombreComercial'],
            AddressInfo: {
              Address: direccionEmisor, // DIreccion con municipio y departamento agregados
              City: emisorData?.DireccionEmisor?.CodigoPostal || '01010',
              Country: emisorData?.DireccionEmisor?.Pais || 'GT',
              District: emisorData?.DireccionEmisor?.Municipio || 'GUATEMALA', // MUNICIPIO
              State: emisorData?.DireccionEmisor?.Departamento || 'GUATEMALA' // DEPARTAMENTO
            }
          }
        },
        Buyer: {
          TaxID: datosReceptor?.['@_IDReceptor'] || 'CF',
          Name: datosReceptor?.['@_NombreReceptor'] || 'CONSUMIDOR FINAL',
          AddressInfo: {
            Address: parseDirectionGT(datosReceptor, 'DireccionReceptor') || 'CIUDAD',
            City: datosReceptor?.DireccionReceptor?.CodigoPostal || '01010',
            District: datosReceptor?.DireccionReceptor?.Municipio || 'GUATEMALA',
            State: datosReceptor?.DireccionReceptor?.Departamento || 'GUATEMALA',
            Country: datosReceptor?.DireccionReceptor?.Pais || 'GT'
          }
        },
        ThirdParties: null,
        Items: items.map((e: any, i: number) => {
          const obj: ItemNUC = {
            Number: e?.['@_NumeroLinea'] || (i + 1).toString(),
            Description: e?.Descripcion || '',
            Type: bienesServicios?.[e?.['@_BienOServicio'] || ''] || 'BIEN',
            Qty: Number(e?.Cantidad || 1),
            UnitOfMeasure: e?.UnidadMedida || 'UNO',
            Price: Number(e?.Precio || 0.0) / Number(e?.Cantidad || 1),
            Discounts: Number(e?.Descuento || 0),
            Taxes: {
              Tax: [e?.Impuestos?.Impuesto || []].flat().map(im => {
                const tax: Tax = {
                  Code: im?.CodigoUnidadGravable?.toString() || '',
                  Description: im?.NombreCorto || '',
                  TaxableAmount: Number(im?.MontoGravable || 0),
                  Amount: Number(im?.MontoImpuesto || 0)
                }
                if (im.NombreCorto === 'PETROLEO' || im.NombreCorto === 'TURISMO HOSPEDAJE') {
                  montoImpuestos += parseFloat(im.MontoImpuesto || 0)
                }
                return tax
              })
            },
            Totals: {
              TotalBDiscounts: Number(e?.Precio || 0.0),
              TotalWDiscounts: Number(e?.Precio || 0.0) - Number(e?.Descuento || 0),
              TotalBTaxes: Number(e?.Precio || 0.0),
              TotalWTaxes: Number(e?.Precio || 0.0) + montoImpuestos,
              SpecificTotal: 0.0,
              TotalItem: e?.Total
            }
          }
          return obj
        }),
        Totals: {
          GrandTotal: {
            TotalBTaxes: 0.0,
            TotalWTaxes: 0.0,
            TotalBDiscounts: 0.0,
            TotalWDiscounts: 0.0,
            ExplicitTotal: 0.0,
            InvoiceTotal: datosEmision?.Totales?.GranTotal
          },
          InWords: ''
        },
        AdditionalDocumentInfo: {
          FechaEmi: datosEmision?.DatosGenerales?.['@_FechaHoraEmision'] || datosCertificacion?.FechaHoraCertificacion || '',
          FechaCert: datosCertificacion?.FechaHoraCertificacion,
          NumeroAutorizacion: datosCertificacion?.NumeroAutorizacion?.['#text'],
          Serie: datosCertificacion?.NumeroAutorizacion?.['@_Serie'],
          Numero: datosCertificacion?.NumeroAutorizacion?.['@_Numero'],
          QRCode: `https://felpub.c.sat.gob.gt/verificador-web/publico/vistas/verificacionDte.jsf?tipo=autorizacion&numero=${datosCertificacion?.NumeroAutorizacion?.['#text']}&emisor=${emisorData?.['@_NITEmisor']}&receptor=${datosReceptor?.['@_IDReceptor']}&monto=${datosEmision?.Totales?.GranTotal}`,
          AdditionalInfo: [
            ...[adenda?.Informacion_COMERCIAL?.InformacionAdicional || []].flat().map(ad => {
              return {
                Code: ad?.REFERENCIA_INTERNA,
                Type: 'ADENDA',
                AditionalData: {
                  Data: [ad?.INFORMACION_ADICIONAL?.Detalle || []].flat().map((d, i) => {
                    const obj: AditionalData = {
                      Info: d?.['@_Value'] || '',
                      Name: d?.['@_Data'] || '',
                      Id: i
                    }
                    return obj
                  })
                }
              }
            }),
            ...[complementos?.Complemento || []].flat().map(c => {
              if (c?.['@_NombreComplemento'] === 'NCRE' || c?.['@_NombreComplemento'] === 'NDEB') {
                return {
                  Code: c?.['@_NombreComplemento'],
                  Type: 'COMPLEMENTO',
                  AditionalInfo: [
                    {
                      Name: 'NumeroAutorizacionDocumentoOrigen',
                      Value: c?.ReferenciasNota?.['@_NumeroAutorizacionDocumentoOrigen']
                    },
                    {
                      Name: 'SerieDocumentoOrigen',
                      Value: c?.ReferenciasNota?.['@_SerieDocumentoOrigen']
                    },
                    {
                      Name: 'NumeroDocumentoOrigen',
                      Value: c?.ReferenciasNota?.['@_NumeroDocumentoOrigen']
                    },
                    {
                      Name: 'FechaEmisionDocumentoOrigen',
                      Value: c?.ReferenciasNota?.['@_FechaEmisionDocumentoOrigen']
                    },
                    {
                      Name: 'MotivoAjuste',
                      Value: c?.ReferenciasNota?.['@_MotivoAjuste']
                    }
                  ]
                }
              }
              if (c?.AbonosFacturaCambiaria) {
                return {
                  Code: c?.['@_NombreComplemento'],
                  Type: 'AbonosFacturaCambiaria',
                  AditionalInfo: [
                    ...[complementos?.Complemento?.AbonosFacturaCambiaria?.Abono || []].flat().map(c => {
                      return {
                        Name: `${c?.NumeroAbono}`,
                        Data: c?.FechaVencimiento,
                        Value: c?.MontoAbono
                      }
                    })
                  ]
                }
              }
              return {
                Code: 'UNKNOWN'
              }
            }).filter(e => e?.Code !== 'UNKNOWN')
          ]
        }
      }

      console.log('--------------------- RESPONSE FINAL NUC GT --------------------', JSON.stringify(NUC))
      return new Promise((resolve) => resolve({
        code: appCodes.ok,
        data: NUC
      }))
    } catch (err) {
      console.log('EXCEPTION CATCH PARSE XML JSON NUC GT', err)
      return new Promise((resolve) => resolve({
        code: appCodes.processError
      }))
    }
  }, [country, configuracionApp])

  const parseXmlToJsonNUCPerCountry: {[key: string]: (xml?: string) => NUCResponse} = {
    GT: parseXmlToJsonNUCGT,
    PA: parseXmlToJsonNUCPA
  }
  return {
    parseXmlToJsonNUC: parseXmlToJsonNUCPerCountry?.[country]
  }
}
