import { theme } from '../Config/theme'
import { formulario } from '../types'

export const useFormSchema: object = () => {
  const loginSchema: Array<formulario> = [
    {
      type: 'inputText',
      name: 'taxid',
      keyboardType: 'default',
      icon: {
        name: 'idcard',
        color: theme.white,
        size: 20,
        type: 'a'
      },
      placeholder: 'Identificador Tributario'
    }
  ]
  return {
    loginSchema
  }
}
