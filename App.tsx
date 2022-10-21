/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useRef, type PropsWithChildren } from 'react'
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import {
  Colors,
  DebugInstructions,
  LearnMoreLinks,
  ReloadInstructions
} from 'react-native/Libraries/NewAppScreen'
import SideMenu from './Components/SideMenu'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'

const App = () => {
  const isDarkMode = useColorScheme() === 'dark'
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
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
  }

  function renderDrawer () {
    return (
      <View>
        <Text>I am in the drawer!</Text>
      </View>
    )
  }

  const drawerRef = useRef(null)

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={250}
          drawerPosition='left'
          drawerType='front'
          keyboardDismissMode='on-drag'
          drawerBackgroundColor='#ddd'
          renderNavigationView={renderDrawer}
          onDrawerSlide={() => {
            console.log('0CDIAJSIDYNAODNHOASYN')
          }}
        >
          <View>
            <Button title='open' onPress={() => drawerRef.current.closeDrawer()} />
            <Button
              title='close'
              onPress={() => drawerRef.current.closeDrawer()}
            />
          </View>
        </DrawerLayout>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600'
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400'
  },
  highlight: {
    fontWeight: '700'
  }
})

export default App
