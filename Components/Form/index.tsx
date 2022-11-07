import React, { useCallback, useState } from 'react'
import { TextStyle, ViewStyle, View, PixelRatio, StyleSheet, Text, TextInputProps, StyleProp, TextInput, ActivityIndicator } from 'react-native'
import { useForm, Controller, UseFormProps } from 'react-hook-form'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { formulario, IconType } from '../../types'
import moment from 'moment'
import { fonts, theme } from '../../Config/theme'
import { InputIcon } from '../InputIcon'
import { ErrorLabel } from '../ErrorLabel'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from '../Icon'
import { Picker } from '../Picker'
type formProps={
    form: Array<formulario>,
    settings: UseFormProps,
    onSubmit: (values: any) => void,
    inputStyle?: TextStyle,
    inputProps?: TextInputProps,
    buttonText?: string,
    buttonTextStyle?: TextStyle,
    buttonStyles?: ViewStyle,
    buttonIcon?: IconType,
    containerInputStyle?: ViewStyle
}
export const Form: React.FC<formProps> = ({ form = [], settings, buttonIcon, onSubmit = () => {}, inputStyle, buttonTextStyle, buttonText, buttonStyles, containerInputStyle, inputProps }) => {
  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm(settings)
  const [date, setDate] = useState<boolean>(false)
  const handleChangeDate = useCallback((e: DateTimePickerEvent, fieldName: string) => {
    setValue(fieldName, moment(e.nativeEvent.timestamp).format('DD-MM-YYYY'))
    setDate(false)
  }, [setValue])

  const handleChangePicker = useCallback((fieldName: string, value: {[key: string]: any[]}, valueKey: string | number) => {
    setValue(fieldName, (value[valueKey] || value))
  }, [setValue])

  const handleDefaultValuePicker = useCallback((data: any[], labelKey: string, valueKey: string, defaultValue: string, value: {[key: string]: any[]}) => {
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
                render={({ field: { onChange, onBlur } }) => (
                  <InputIcon
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType={f?.keyboardType || 'default'}
                    placeholder={f?.placeholder || 'default placeholder'}
                    secureTextEntry={f?.secureTextEntry}
                    isSecureTextInput={f?.secureTextEntry}
                    switchIcon={f?.switchIcon}
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
                    containerStyle={containerInputStyle}
                    {...inputProps}
                  />
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors?.[f?.name]?.message) && (<ErrorLabel message={errors?.[f?.name!]?.message} />)}
            </View>
          )
        }
        if (f?.type === 'picker') {
          return (
            <View key={JSON.stringify(f)}>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <Picker
                    items={f?.picker?.data || []}
                    defaultValue={handleDefaultValuePicker(f?.picker?.data!, f?.picker?.labelKey!, f?.picker?.valueKey!, f?.picker?.defaultValue!, value)}
                    labelKey={f?.picker?.labelKey || ''}
                    valueKey={f?.picker?.valueKey || ''}
                    inputIcon={{
                      name: f?.icon?.name || '',
                      size: f?.icon?.size || 20,
                      type: f?.icon?.type || 'i',
                      color: f?.icon?.color || theme.gray50
                    }}
                    withSearch={f?.picker?.withSearch}
                    searchlabel={f?.picker?.searchlabel}
                    labelStyle={f?.picker?.labelStyle}
                    style={f?.picker?.style}
                    onValueChange={(e) => {
                      handleChangePicker(f?.name, e, f?.picker?.valueKey!)
                    }}
                  />
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors?.[f?.name]?.message) && (<ErrorLabel message={errors?.[f?.name!]?.message} />)}
            </View>
          )
        }
        if (f?.type === 'dateTime') {
          return (
            <View key={JSON.stringify(f)}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TouchableOpacity onPress={() => setDate(true)}>
                      <InputIcon
                        onBlur={onBlur}
                        onChangeText={onChange}
                        keyboardType={f?.keyboardType || 'default'}
                        placeholder={f?.placeholder || 'default placeholder'}
                        secureTextEntry={f?.secureTextEntry}
                        isSecureTextInput={f?.secureTextEntry}
                        switchIcon={f?.switchIcon}
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
                        containerStyle={containerInputStyle}
                        {...inputProps}
                      />
                    </TouchableOpacity>
                    {date && (
                      <DateTimePicker
                        testID={f?.name || 'dateTimeForm'}
                        value={moment().toDate()}
                        mode='date'
                        is24Hour
                        onChange={(e) => handleChangeDate(e, f?.name)}
                      />
                    )}
                  </>
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors[f?.name]) && (<ErrorLabel message={errors?.[f?.name]?.message} />)}
            </View>
          )
        }
        return null
      })}
      <TouchableOpacity
        style={[styles.button, buttonStyles]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {!isSubmitting
          ? (
            <>
              <Icon
                name={buttonIcon?.name || ''}
                size={buttonIcon?.size || 20}
                color={buttonIcon?.color || theme.gray50}
                type={buttonIcon?.type || 'i'}
              />
              <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
            </>
            )
          : (
            <ActivityIndicator
              size='large'
              color={theme.gray}
            />
            )}
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13 / PixelRatio.getFontScale(),
    paddingVertical: 10 / PixelRatio.getFontScale(),
    paddingHorizontal: 15 / PixelRatio.getFontScale(),
    marginVertical: 10 / PixelRatio.getFontScale(),
    backgroundColor: theme.orange
  },
  buttonText: {
    textAlign: 'center',
    color: theme.gray,
    fontSize: fonts.subHeader,
    fontWeight: '600',
    marginLeft: 5 / PixelRatio.getFontScale()
  }
})
