import { fonts, theme } from '../../Config/theme'
import React, { LegacyRef, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, View, PixelRatio, Image, Platform } from 'react-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'
import MenuItem from '../../Components/MenuItem'
import deviceInfoModule from 'react-native-device-info'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-native'
import { deleteUser } from '../../Redux/userReducer'
import { ReduxState } from '../../Redux/store'

export const SideMenu: React.FC<PropsWithChildren<{drawerRef: LegacyRef<DrawerLayout | null>}>> = ({ children, drawerRef }) => {
  const user = useSelector((state: ReduxState) => state.userDB)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [manufacturer, setManufacturer] = useState('')
  const model = deviceInfoModule.getModel().split(' ')[0]
  const accesos = user?.configuracionApp?.flat().filter(e => e.idTipoConfiguracion === 5 || e.tipoConfiguracion === 'Contingencia').map((e) => { return e.valor }).filter(e => e)?.length || 0

  useEffect(() => {
    console.log('ASHDASHDJ', model)
    if (!manufacturer) {
      console.log('MENU RENDER')
      deviceInfoModule.getManufacturer().then(setManufacturer)
    }
  }, [])

  const closeMenu = useCallback(() => {
    if (drawerRef?.current) {
      drawerRef?.current?.closeDrawer()
    }
  }, [])

  const logout = useCallback(() => {
    dispatch(deleteUser())
    navigate('/')
  }, [])

  function renderDrawer () {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.purple,
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
        padding: 10,
        justifyContent: 'space-evenly'
      }}
      >
        <Image
          source={require('../../Public/img/BlancoHorizontal-07.webp')}
          style={{
            width: 190,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />
        <ScrollView
          style={{
            flex: 1,
            maxHeight: Dimensions.get('window').height - (Dimensions.get('window').height * 0.42),
            marginBottom: 10
          }}
        >
          <MenuItem
            title='Perfil'
            titleStyles={{
              color: theme.white,
              fontSize: fonts.normal
            }}
            onPress={closeMenu}
            withCounter={false}
            icon={{
              color: theme.white,
              name: 'person',
              size: 24,
              type: 'i'
            }}
          />
          {accesos && (
            <MenuItem
              title='Contingencia'
              titleStyles={{
                color: theme.white,
                fontSize: fonts.normal
              }}
              onPress={closeMenu}
              withCounter
              icon={{
                color: theme.white,
                name: 'archive-clock-outline',
                size: 24,
                type: 'm'
              }}
            />
          )}
          <MenuItem
            title='Reportes'
            titleStyles={{
              color: theme.white,
              fontSize: fonts.normal
            }}
            onPress={closeMenu}
            withCounter={false}
            icon={{
              color: theme.white,
              name: 'barschart',
              size: 24,
              type: 'a'
            }}
          />
          <MenuItem
            title='Usuarios'
            titleStyles={{
              color: theme.white,
              fontSize: fonts.normal
            }}
            onPress={closeMenu}
            withCounter={false}
            icon={{
              color: theme.white,
              name: 'user',
              size: 24,
              type: 'a'
            }}
          />
          {(user?.MIPOS?.token && user?.MIPOS?.userToken && Platform.OS === 'android') && (
            <MenuItem
              title='MiPOS'
              titleStyles={{
                color: theme.white,
                fontSize: fonts.normal
              }}
              onPress={closeMenu}
              withCounter={false}
              icon={{
                color: theme.white,
                name: 'credit-card-wireless',
                size: 24,
                type: 'm'
              }}
            />
          )}
          {(manufacturer.toLowerCase() === 'topwise' || model === 'P2') && (
            <MenuItem
              title='VISA'
              titleStyles={{
                color: theme.white,
                fontSize: fonts.normal
              }}
              onPress={closeMenu}
              withCounter={false}
              icon={{
                color: theme.white,
                name: 'credit-card-wireless',
                size: 24,
                type: 'm'
              }}
            />
          )}
          <MenuItem
            title='Configuraciones'
            titleStyles={{
              color: theme.white,
              fontSize: fonts.normal
            }}
            onPress={closeMenu}
            withCounter={false}
            icon={{
              color: theme.white,
              name: 'options',
              size: 24,
              type: 'i'
            }}
          />
        </ScrollView>
        <View>
          <MenuItem
            onPress={logout}
            title='Cerrar Sesión'
            backgroundColor={theme.orange}
            titleStyles={{
              color: theme.white,
              fontSize: fonts.normal
            }}
            withCounter={false}
            icon={{
              color: theme.white,
              name: 'log-out-outline',
              size: 24,
              type: 'i'
            }}
          />
          <Text
            style={{
              color: theme.white,
              textAlign: 'left',
              marginHorizontal: 10 / PixelRatio.getFontScale(),
              fontSize: fonts.small
            }}
          >Version {deviceInfoModule.getVersion()}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={300}
        drawerPosition='left'
        drawerType='front'
        keyboardDismissMode='on-drag'
        drawerBackgroundColor='#FFFFFF00'
        renderNavigationView={renderDrawer}
        useNativeAnimations
        userSelect='auto'
      >
        {children}
      </DrawerLayout>
    </View>
  )
}
