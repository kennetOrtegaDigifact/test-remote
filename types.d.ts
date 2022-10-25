import { KeyboardType, ViewStyle } from 'react-native'
import { RegisterOptions, FieldValues, FieldPath } from 'react-hook-form'

export interface IconType {
    name: string,
    size: number,
    color: string,
    type: 'm' | 'a' | 'i' | 'v'
}

export interface userInterface {
    taxid: string,
    country: string,
    Token: string,
}

export type formulario = {
    type: 'inputText' | 'picker' | 'dateTime',
    name: string,
    placeholder?: string,
    keyboardType?: KeyboardType,
    disabled?: boolean,
    picker?: {
        data: Array<string>,
        labelKey: string,
        valuekey: string,
        defaultValue: string,
        withSearch: boolean,
        searchlabel: string,
        onChange: (value: any) => void,
    },
    icon?: IconType,
    rules?: Omit<RegisterOptions<FieldValues, FieldPath<FieldValues>>, 'valueAsNumber'|'valueAsDate'|'setValueAs'|'disabled'>,
    style?: ViewStyle
}
