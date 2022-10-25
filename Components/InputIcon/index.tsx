import React from 'react'
import { PixelRatio, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { IconType } from '../../types'
import Icon from '../Icon'
interface inputProps extends TextInputProps {
    icon?: IconType,
    switchIcon?: IconType,
    switchState?: React.Dispatch<React.SetStateAction<boolean>>,
    containerStyle?: ViewStyle,
    disabled?: boolean
}
export const InputIcon: React.FC<inputProps> = React.memo(function InputIcon ({ containerStyle, icon, switchIcon, switchState, disabled = false, ...props }) {
  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <Icon {...icon} />
        <TextInput
          {...props}
          returnKeyType='next'
          editable={!disabled}
        />
        {switchState && (
          <TouchableOpacity
            onPress={() => {
              switchState((prev: boolean) => !prev)
            }}
          >
            <Icon
              {...switchIcon}
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
