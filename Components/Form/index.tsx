import React from 'react'
import { type KeyboardStatic, StyleSheetProperties, TextStyle } from 'react-native'
import { useForm, Controller, RegisterOptions, FieldValues, FieldPath, UseFormProps } from 'react-hook-form'
import { IconType } from '../../types'
type formulario={
    type: string,
    name: string,
    placeholder: string,
    keyboardType: KeyboardStatic,
    disabled: boolean,
    picker: {
        data: Array<string>,
        labelKey: string,
        valuekey: string,
        defaultValue: string,
        withSearch: boolean,
        searchlabel: string,
        onChange: (value: any) => void,
    },
    icon: IconType,
    rules: Omit<RegisterOptions<FieldValues, FieldPath<FieldValues>>, 'valueAsNumber'|'valueAsDate'|'setValueAs'|'disabled'>,
    style: StyleSheetProperties
}
type formProps={
    form: Array<formulario>,
    settings: UseFormProps,
    onSubmit: () => void,
    inputStyle: StyleSheetProperties,
    buttonText: string,
    buttonTextStyle: TextStyle,
    buttonIcon: IconType,
}
export const Form: React.FC<formProps> = ({ form, settings, buttonIcon, onSubmit, inputStyle, buttonTextStyle, buttonText }) => {
  return (
    <></>
  )
}
