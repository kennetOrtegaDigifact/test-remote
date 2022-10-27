import React, { useEffect } from 'react'
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-native'
import { theme } from '../../Config/theme'
import { ReduxState } from '../../Redux/store'
export const VerifyScreen: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.userDB)
  const navigate = useNavigate()
  useEffect(() => {
    if (user?.token?.length) {
      setTimeout(() => {
        navigate(`/${user.country}/Dashboard`, { replace: false })
      }, 1000)
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
