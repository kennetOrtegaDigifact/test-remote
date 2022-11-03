import React, { PropsWithChildren } from 'react'
import { View, StyleSheet, PixelRatio, TouchableOpacity, ScrollView } from 'react-native'
import { palette7, theme } from '../../Config/theme'
import Icon from '../Icon'
import NavigatorTab from '../NavigatorTab'
export const Layout: React.FC<PropsWithChildren<{drawerRef: React.RefObject<React.Component | null>}>> = ({ children, drawerRef }) => {
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
      <ScrollView
        style={[styles.container]}
      >
        {children}
        <View style={{ height: 20 }} />
      </ScrollView>
      <NavigatorTab />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette7.cream,
    borderTopLeftRadius: 20 / PixelRatio.getFontScale(),
    borderTopRightRadius: 20 / PixelRatio.getFontScale(),
    padding: 10
  },
  menu: {
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    flexDirection: 'row'
  }
})
