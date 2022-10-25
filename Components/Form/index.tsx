import React, { useCallback, useState } from 'react'
import { TextStyle, ViewStyle, View } from 'react-native'
import { useForm, Controller, UseFormProps } from 'react-hook-form'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { formulario, IconType } from '../../types'
import moment from 'moment'
import { theme } from '../../Config/theme'
import { InputIcon } from '../InputIcon'
import { ErrorLabel } from '../ErrorLabel'

type formProps={
    form: Array<formulario>,
    settings: UseFormProps,
    onSubmit: () => void,
    inputStyle: ViewStyle,
    buttonText: string,
    buttonTextStyle: TextStyle,
    buttonIcon: IconType,
}
export const Form: React.FC<formProps> = ({ form, settings, buttonIcon, onSubmit, inputStyle, buttonTextStyle, buttonText }) => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm(settings)
  const [date, setDate] = useState<boolean>(false)
  const handleChangeDate = useCallback((e: DateTimePickerEvent, fieldName: string) => {
    setValue(fieldName, moment(e.nativeEvent.timestamp).format('DD-MM-YYYY'))
    setDate(false)
  }, [setValue])

  const handleChangePicker = useCallback((fieldName: string, value: {[key: string]: any[]}, valueKey: string | number) => {
    setValue(fieldName, (value[valueKey] || value))
  }, [setValue])

  const handleDefaultValuePicker = useCallback((data: [], labelKey: string, valueKey: string, defaultValue: string, value: {[key: string]: any[]}) => {
    return data?.find(d => d?.[valueKey] === value || d === value)?.[labelKey || ''] || value || defaultValue
  }, [])

  return (
    <>
      {form.map(f => {
        if (f.type === 'inputText') {
          return (
            <View key={JSON.stringify(f)}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputIcon
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType={f?.keyboardType || 'default'}
                    placeholder={f?.placeholder || 'default placeholder'}
                    icon={{
                      name: f?.icon?.name || 'reorder-three',
                      size: f?.icon?.size || 24,
                      color: f?.icon?.color || theme.gray75,
                      type: f?.icon?.type || 'i'
                    }}
                    style={[
                      {
                        color: theme.gray
                      }, inputStyle
                    ]}
                  />
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors?.[f?.name]?.message) && (<ErrorLabel message={errors} />)}
            </View>
          )
        }
        return null
      })}
    </>
  )
}
