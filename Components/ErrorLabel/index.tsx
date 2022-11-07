import React from 'react'
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form'
import { Text, View } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import Icon from '../Icon'
type props={
    message: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined
}
export const ErrorLabel: React.FC<props> = React.memo(function ErrorLabel ({ message = '' }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8
      }}
    >
      <Icon name='alert-circle' type='i' size={16} color={theme.orange} />
      <Text style={{
        textAlign: 'left',
        fontSize: fonts.small,
        color: theme.orange,
        marginHorizontal: 2,
        fontWeight: '600'
      }}
      >{message.toString()}
      </Text>
    </View>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
