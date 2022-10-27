import React, { useState } from 'react'
import { PixelRatio, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { IconType } from '../../types'
import Icon from '../Icon'
interface inputProps extends TextInputProps {
    icon?: IconType,
    switchIcon?: IconType,
    isSecureTextInput?: boolean,
    containerStyle?: ViewStyle,
    disabled?: boolean
}
export const InputIcon: React.FC<inputProps> = React.memo(function InputIcon ({ containerStyle, icon, switchIcon, isSecureTextInput = false, disabled = false, ...props }) {
  const [visible, setVisible] = useState(isSecureTextInput)
  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <Icon
          name={icon?.name || ''}
          size={icon?.size || 20}
          type={icon?.type || 'i'}
          color={icon?.color || theme.purple}
        />
        <TextInput
          {...props}
          returnKeyType='next'
          secureTextEntry={visible}
          editable={!disabled}
        />
        {isSecureTextInput && (
          <TouchableOpacity
            onPress={() => {
              setVisible((prev: boolean) => !prev)
            }}
          >
            <Icon
              name={visible ? (switchIcon?.name || 'eye') : 'eye-off'}
              size={switchIcon?.size || 24}
              type={switchIcon?.type || 'i'}
              color={switchIcon?.color || theme.purple}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8 / PixelRatio.getFontScale(),
    borderWidth: 1.5 / PixelRatio.getFontScale(),
    borderRadius: 13 / PixelRatio.getFontScale(),
    borderColor: theme.purple75,
    paddingHorizontal: 7 / PixelRatio.getFontScale()
  },
  input: {
    flex: 1,
    fontSize: fonts.normal,
    color: theme.white,
    minHeight: 35 / PixelRatio.getFontScale(),
    marginHorizontal: 10 / PixelRatio.getFontScale()
  }
})
