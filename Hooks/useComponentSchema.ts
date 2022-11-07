import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'

export const useComponentSchema = () => {
  const { country } = useSelector((state: ReduxState) => state.userDB)

  const consultas: {
      [key: string]: {
          labels: {
              searchLabel: string,
              [key: string]: string
          }
      }
  } = {
    GT: {
      labels: {
        searchLabel: 'Buscar por No.Autorizacion/Serie',
        numeroDocumento: 'Numero de Documento: ',
        numeroAuth: 'Numero de Autorizacion: ',
        numeroSerie: 'Numero de Serie: ',
        establecimiento: 'Establecimiento: ',
        clientName: 'Cliente: ',
        fechaEmision: 'Fecha de emision: ',
        clientTaxid: 'NIT: ',
        cancelled: 'Documento Anulado: ',
        documentType: 'Tipo de documento: ',
        razonSocial: 'Razon Social: ',
        userName: 'Usuario que la emitio: ',
        monto: 'Monto: '
      }
    },
    PA: {
      labels: {
        searchLabel: 'Buscar por No.Autorizacion/RUC'
      }
    }
  }
  return {
    consultasComponentSchema: consultas[country]
  }
}
