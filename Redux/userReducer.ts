import { createSlice } from '@reduxjs/toolkit'
import { userTemplate } from '../Config/templates'
export const userDB = createSlice({
  name: 'user',
  initialState: userTemplate,
  reducers: {
    addUser: (state, action) => {
      return {
        ...state,
        ...action.payload
      }
    },
    deleteUser: () => userTemplate
  }
})

export const {
  addUser,
  deleteUser
} = userDB.actions
export default userDB.reducer
