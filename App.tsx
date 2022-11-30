/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useRef } from 'react'
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  LogBox
} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import { SideMenu } from './Components/SideMenu'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NativeRouter, Outlet, Route, Routes } from 'react-router-native'
import { Provider } from 'react-redux'
import { persistor, store } from './Redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { fonts, theme } from './Config/theme'
import { Layout } from './Components/Layout'
import { VerifyScreen } from './Views/VerifyScreen'
import { Login } from './Views/Login'
import { Consultas } from './Views/Consultas'
import { Dashboard } from './Views/Dashboard'
import { Dte } from './Views/DTE'
import { Productos } from './Views/Productos'
import { Clientes } from './Views/Clientes'
import { ToastProvider } from 'react-native-toast-notifications'
import Icon from './Components/Icon'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

const App = () => {
  LogBox.ignoreAllLogs()
  const drawerRef = useRef(null)
  RNBootSplash.hide({ fade: true })
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    }
    init().finally(async () => {
      await RNBootSplash.hide({ fade: true })
    })
  }, [])

  return (

    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <NativeRouter basename='/' initialEntries={['/']}>
            <PersistGate loading={null} persistor={persistor}>
              <ToastProvider
                placement='top'
                duration={10000}
                animationType='slide-in'
                animationDuration={250}
                successColor={theme.green}
                dangerColor={theme.red}
                warningColor={theme.orange}
                normalColor={theme.gray}
                successIcon={<Icon name='checkmark-circle' type='i' color={theme.white} size={20} />}
                dangerIcon={<Icon name='close-circle' type='i' color={theme.white} size={20} />}
                warningIcon={<Icon name='alert-circle' type='i' color={theme.black} size={20} />}
                textStyle={{ fontSize: fonts.small, flexWrap: 'wrap', paddingHorizontal: 5, flex: 1 }}
                offsetTop={50}
                offsetBottom={50}
                swipeEnabled
                style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
                renderType={{
                  info: (toast: ToastProps) => (
                    <View style={{
                      padding: 15,
                      margin: 5,
                      backgroundColor: toast?.data?.theme === 'dark' ? theme.gray : theme.white,
                      width: '90%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 7
                    }}
                    >
                      <Icon
                        name='information-circle'
                        type='i'
                        color={theme.white} size={20}
                      />
                      <Text
                        style={{
                          flex: 1,
                          flexWrap: 'wrap',
                          marginHorizontal: 5,
                          fontSize: fonts.normal
                        }}
                      >{toast.message}
                      </Text>
                    </View>
                  ),
                  loading: (toast: ToastProps) => (
                    <View style={{
                      padding: 15,
                      margin: 5,
                      backgroundColor: toast?.data?.theme === 'dark' ? theme.gray : theme.white,
                      width: '90%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 7
                    }}
                    >
                      <ActivityIndicator
                        size='small'
                        color={toast?.data?.theme === 'dark' ? theme.white : theme.purple}
                      />
                      <Text
                        style={{
                          flex: 1,
                          flexWrap: 'wrap',
                          marginHorizontal: 5,
                          fontSize: fonts.normal,
                          color: toast?.data?.theme === 'dark' ? theme.white : theme.gray
                        }}
                      >{toast.message}
                      </Text>
                    </View>
                  ),
                  error: (toast: ToastProps) => (
                    <View style={{
                      padding: 15,
                      margin: 5,
                      backgroundColor: theme.red,
                      width: '90%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 7
                    }}
                    >
                      <Icon
                        name='close-circle'
                        type='i'
                        color={theme.white} size={20}
                      />
                      <Text
                        style={{
                          flex: 1,
                          flexWrap: 'wrap',
                          marginHorizontal: 5,
                          fontSize: fonts.normal,
                          color: theme.white
                        }}
                      >{toast.message}
                      </Text>
                    </View>
                  ),
                  ok: (toast: ToastProps) => (
                    <View style={{
                      padding: 15,
                      margin: 5,
                      backgroundColor: theme.green,
                      width: '90%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 7
                    }}
                    >
                      <Icon
                        name='checkmark-circle'
                        type='i'
                        color={theme.white} size={20}
                      />
                      <Text
                        style={{
                          flex: 1,
                          flexWrap: 'wrap',
                          marginHorizontal: 5,
                          fontSize: fonts.normal,
                          color: theme.white
                        }}
                      >{toast.message}
                      </Text>
                    </View>
                  ),
                  warning: (toast: ToastProps) => (
                    <View style={{
                      padding: 15,
                      margin: 5,
                      backgroundColor: theme.orange,
                      width: '90%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 7
                    }}
                    >
                      <Icon name='alert-circle' type='i' color={theme.black} size={20} />
                      <Text
                        style={{
                          flex: 1,
                          flexWrap: 'wrap',
                          marginHorizontal: 5,
                          fontSize: fonts.normal,
                          color: theme.black
                        }}
                      >{toast.message}
                      </Text>
                    </View>
                  )
                }}
              >
                <SafeAreaView style={{ flex: 1 }}>
                  <StatusBar barStyle='light-content' backgroundColor={theme.purple} />
                  <Routes>
                    <Route path='/' element={<VerifyScreen />} />
                    <Route path='/Login' element={<Login />} />
                    <Route path='/GT' element={<SideMenu drawerRef={drawerRef}><Layout drawerRef={drawerRef}><Outlet /></Layout></SideMenu>}>
                      <Route path='Dashboard' element={<Dashboard key={1} />} />
                      <Route path='Consultas' element={<Consultas key={2} />} />
                      <Route path='DTE' element={<Dte key={3} />} />
                      <Route path='Productos' element={<Productos key={4} />} />
                      <Route path='Clientes' element={<Clientes key={5} />} />
                    </Route>
                  </Routes>
                </SafeAreaView>
              </ToastProvider>
            </PersistGate>
          </NativeRouter>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}

export default App
