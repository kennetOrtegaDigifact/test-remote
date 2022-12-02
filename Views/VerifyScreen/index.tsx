import React, { useEffect } from 'react'
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-native'
import { theme } from '../../Config/theme'
import { useApiService } from '../../Hooks/useApiService'
import { ReduxState } from '../../Redux/store'
import { setUtils } from '../../Redux/utilsReducer'
import { UTILSDB } from '../../types'
export const VerifyScreen: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.userDB)
  const navigate = useNavigate()
  const { countryCodes } = useSelector((state: ReduxState) => state.utilsDB)
  const { getCountryCodes } = useApiService()
  const dispatch = useDispatch()
  useEffect(() => {
    if (user?.token?.length) {
      setTimeout(() => {
        navigate('/-/Dashboard', { replace: true })
      }, 1000)
      if (!countryCodes?.length) {
        getCountryCodes().then(resCountryCodes => {
          const utils: UTILSDB = {
            countryCodes: resCountryCodes.data
          }
          dispatch(setUtils(utils))
        })
      }
    } else {
      setTimeout(() => {
        navigate('/Login', { replace: true })
      }, 1000)
    }
  }, [user])
  return (
    <View style={[styles.container]}>
      <Image
        source={require('../../Public/img/Logo1.webp')}
        style={{
          width: 150,
          height: 125,
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 20
        }}
      />
      <ActivityIndicator
        color={theme.orange}
        size='large'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.purple
  }
})
