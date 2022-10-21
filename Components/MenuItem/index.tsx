
import React, { memo } from 'react'
import { StyleSheet, Text, TextStyle, TouchableHighlight, View } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import Icon from '../Icon'
type iconProps={
       name: string,
    size: number,
    color: string,
    type: string
}
type menuItemProps = {
    title: string,
    icon: iconProps,
    onPress: () => void,
    withCounter: boolean,
    counter: number,
    backgroundColor: string,
    titleStyles: TextStyle,
    inactiveIconColor: string
}

const MenuItemC: React.FC<menuItemProps> = ({ title = '', icon = { color: '', type: '', name: '', size: 24 }, inactiveIconColor, backgroundColor, counter = 0, titleStyles, withCounter = false, onPress = () => {} }) => {
  return (
    <>
      <TouchableHighlight
        style={{
          borderRadius: 13,
          padding: 8,
          marginVertical: 8,
          width: '100%',
          backgroundColor,
          overflow: 'hidden'
        }}
        activeOpacity={1}
        underlayColor={theme.purple}
        onPress={onPress}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon {...icon} />
            <Text style={[styles.title, { color: inactiveIconColor }, titleStyles]}>{title}</Text>
          </View>
          {
            withCounter && (
              <View style={{
                backgroundColor: theme.orange,
                paddingVertical: 2,
                paddingHorizontal: 5,
                height: 25,
                width: 35,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15
              }}
              >
                <Text style={{
                  fontSize: fonts.small,
                  color: theme.white
                }}
                >{counter > 99 ? '99+' : counter}
                </Text>
              </View>
            )
          }
        </View>
      </TouchableHighlight>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginLeft: 10,
    fontSize: fonts.normal
  }
})

export default memo(MenuItemC, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
