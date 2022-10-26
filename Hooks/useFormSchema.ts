import { LoginCountries } from '../Config/dictionary'
import { fonts, theme } from '../Config/theme'
import { formulario } from '../types'

export const useFormSchema = () => {
  const loginFormSchema: Array<formulario> = [
    {
      type: 'picker',
      name: 'country',
      icon: {
        name: 'map-marker',
        color: theme.white,
        size: 20,
        type: 'm'
      },
      picker: {
        data: LoginCountries,
        defaultValue: '-- Seleccione un pais --',
        labelKey: 'name_es',
        valueKey: 'code',
        withSearch: true,
        searchlabel: 'Buscar Pais',
        labelStyle: {
          color: theme.white,
          fontSize: fonts.normal
        },
        style: {
          borderColor: theme.orange
        }
      }
    },
    {
      type: 'inputText',
      name: 'taxid',
      keyboardType: 'default',
      icon: {
        name: 'card-account-details',
        color: theme.white,
        size: 20,
        type: 'm'
      },
      placeholder: 'Identificador Tributario'
    },
    {
      type: 'inputText',
      name: 'username',
      keyboardType: 'default',
      icon: {
        name: 'person',
        color: theme.white,
        size: 20,
        type: 'i'
      },
      placeholder: 'Nombre de Usuario'
    },
    {
      type: 'inputText',
      name: 'password',
      keyboardType: 'default',
      secureTextEntry: true,
      icon: {
        name: 'lock',
        color: theme.white,
        size: 20,
        type: 'm'
      },
      placeholder: 'Contraseña'
    }
  ]
  return {
    loginFormSchema
  }
}
