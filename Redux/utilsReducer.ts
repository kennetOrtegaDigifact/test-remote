import { createSlice } from '@reduxjs/toolkit'
import { State } from 'react-native-gesture-handler'
import { UTILSDB } from '../types'

const initialUtils: UTILSDB = {
  corregimientos: [],
  distritos: [],
  provincias: [],
  countryCodes: [],
  currencies: [],
  incoterms: [],
  familias: [], // Codigo de Familias en el Codigo de Bienes y Servicios Panamenos
  segmentos: [], // Codigo de Segmentos en el Codigo de Bienes y Servicios Panamenos
  units: []
}

export const utilsDB = createSlice({
  name: 'utils',
  initialState: initialUtils,
  reducers: {
    setUtils: (state, action) => {
      return {
        ...state,
        ...action.payload
      }
    },
    deleteUtils: () => initialUtils
  }
})

export const { setUtils, deleteUtils } = utilsDB.actions
export default utilsDB.reducer
