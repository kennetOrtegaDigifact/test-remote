import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { ReduxState } from '../Redux/store'
import { DinamycConsultasServiceHook } from '../types'

export const useDinamycServices = () => {
  const user = useSelector((state: ReduxState) => state.userDB)

  const anularGT = useCallback((props: {
        auth?: string
  }) => {
    const { auth } = props
    console.log('ANULAR GT ', auth)
  }, [])
  const consultasServicesSchema: DinamycConsultasServiceHook = {
    anular: {
      GT: anularGT
    }
  }
  return {
    consultasServices: consultasServicesSchema
  }
}
