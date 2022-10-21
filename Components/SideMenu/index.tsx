import React, { Children, useRef } from 'react'
import { View, Button, Text, Dimensions } from 'react-native'
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout'

export default function Drawerable () {
  const drawerRef = useRef(null)

  function renderDrawer () {
    return (
      <View>
        <Text>I am in the drawer!</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={250}
        drawerPosition='left'
        drawerType='front'
        keyboardDismissMode='on-drag'
        drawerBackgroundColor='#ddd'
        renderNavigationView={renderDrawer}
        useNativeAnimations
        userSelect='auto'
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
  )
}
