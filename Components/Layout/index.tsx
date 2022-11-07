import React, { PropsWithChildren } from 'react'
import { View, StyleSheet, PixelRatio, TouchableOpacity, ScrollView } from 'react-native'
import { DrawerLayout } from 'react-native-gesture-handler'
import { palette7, theme } from '../../Config/theme'
import Icon from '../Icon'
import NavigatorTab from '../NavigatorTab'
export const Layout: React.FC<PropsWithChildren<{drawerRef: React.RefObject<DrawerLayout | null>}>> = ({ children, drawerRef }) => {
  return (
    <View style={{
      backgroundColor: theme.purple,
      flex: 1
    }}
    >
      <View style={[styles.menu]}>
        <TouchableOpacity
          onPress={() => drawerRef?.current?.openDrawer()}
        >
          <Icon
            color={theme.white}
            name='menu'
            type='i'
            size={34}
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.container]}>
        {/* <ScrollView nestedScrollEnabled style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {children}
          <View style={{ height: 10 }} />
        </ScrollView> */}
        {children}
      </View>
      <NavigatorTab />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette7.cream,
    borderTopLeftRadius: 20 / PixelRatio.getFontScale(),
    borderTopRightRadius: 20 / PixelRatio.getFontScale(),
    paddingTop: 10,
    paddingHorizontal: 10
  },
  menu: {
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    flexDirection: 'row'
  }
})
