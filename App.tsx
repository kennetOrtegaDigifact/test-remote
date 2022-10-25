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
  StatusBar
} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import { SideMenu } from './Components/SideMenu'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NativeRouter, Outlet, Route, Routes } from 'react-router-native'
import { Provider } from 'react-redux'
import { persistor, store } from './Redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { theme } from './Config/theme'
import { Layout } from './Components/Layout'
import { VerifyScreen } from './Views/VerifyScreen'
import { Login } from './Views/Login'
import { Consultas } from './Views/Consultas'
import { Dashboard } from './Views/Dashboard'
import { Dte } from './Views/DTE'
import { Productos } from './Views/Productos'
import { Clientes } from './Views/Clientes'

const App = () => {
  const drawerRef = useRef(null)
  RNBootSplash.hide({ fade: true })
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    }
    init().finally(async () => {
      await RNBootSplash.hide({ fade: true })
      console.log('Bootsplash has been hidden successfully')
    })
  }, [])

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeRouter basename='/' initialEntries={['/']}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
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
          </PersistGate>
        </Provider>
      </NativeRouter>
    </GestureHandlerRootView>
  )
}

export default App
