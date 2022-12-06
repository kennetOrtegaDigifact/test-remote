import * as yup from 'yup'

export const loginSchema: yup.AnyObjectSchema = yup.object().shape({
  taxid: yup.string().required('El Identificador Tributario es un campo obligatorio').min(1),
  userName: yup.string().required('El nombre de usuario es un campo obligatorio'),
  password: yup.string().required('La contraseña es un campo obligatorio'),
  country: yup.string().required('Debe seleccionar un pais')
})
