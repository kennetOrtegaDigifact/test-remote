import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image, PixelRatio, TouchableOpacity } from 'react-native'
import { Form } from '../../Components/Form'
import { fonts, theme } from '../../Config/theme'
import { yupResolver } from '@hookform/resolvers/yup'
import { useToast } from 'react-native-toast-notifications'
import { useFormSchema } from '../../Hooks/useFormSchema'
import { loginSchema } from '../../Validators/loginSchema'
import deviceInfoModule from 'react-native-device-info'
import { loginService } from '../../Services/apiService'
import { deletePadLeft } from '../../Config/utilities'
import { appCodes } from '../../Config/appCodes'
import { useDispatch } from 'react-redux'
import { addUser } from '../../Redux/userReducer'
import { useNavigate } from 'react-router-native'
export const Login: React.FC = () => {
  const { loginFormSchema } = useFormSchema()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const onSubmit = async (values: {taxid: string, country: string, password: string, username: string}): Promise<void> => {
    console.log('LOGIN VALUES', values)
    const { country, password, taxid, username } = values
    let TAXID: string = ''
    if (country === 'GT') {
      const nit = deletePadLeft(taxid)
      TAXID = taxid.padStart(12, '0').replace(/[^0-9Kk]/g, '').replace('k', 'K').replace('-', '').replace('/', '').trim()
      return loginService({
        country,
        nit,
        taxid: TAXID,
        Password: password,
        Username: `${country}.${TAXID.trim()}.${username.trim()}`,
        user: username.trim()
      })
        .then(res => {
          console.log('COMO', res)
          if (res.code === appCodes.ok) {
            toast.show('Verifcacion exitosa', { type: 'ok' })
            dispatch(addUser(res))
            navigate('/')
            console.log('USUARIO FINAL', res)
          } else if (res.code === appCodes.invalidData) {
            toast.show('Credenciales Incorrectas', { type: 'error' })
          } else if (res.code === appCodes.processError) {
            toast.show('Algo salio mal al iniciar sesion, porfavor verifique sus credenciales, conexion a internet o intentelo mas tarde', { type: 'error' })
          }
        })
    }
  }
  return (
    <View style={[styles.container]}>
      <ScrollView
        centerContent
        automaticallyAdjustKeyboardInsets
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          padding: 10
        }}
      >
        <View
          style={{
            alignItems: 'center',
            margin: 5
          }}
        >
          <Image
            source={require('../../Public/img/Logo1.webp')}
            style={{
              width: 120 / PixelRatio.getFontScale(),
              height: 100 / PixelRatio.getFontScale(),
              margin: 5
            }}
          />
          <Text
            style={{
              fontSize: fonts.small,
              textAlign: 'center',
              flexWrap: 'wrap',
              color: theme.white,
              paddingHorizontal: 10
            }}
          >Ya eres cliente de Digifact, ingresa con tu Identificador Tributario, usuario y contraseña. Si no recuerdas tu contraseña haz click en recuperar contraseña
          </Text>
        </View>
        <Form
          form={loginFormSchema}
          inputStyle={{
            color: theme.white,
            flex: 1
          }}
          containerInputStyle={{
            borderColor: theme.orange
          }}
          inputProps={{
            placeholderTextColor: theme.white
          }}
          buttonIcon={{
            name: 'log-out',
            color: theme.gray,
            size: 20,
            type: 'i'
          }}
          buttonText='Iniciar Sesion'
          settings={{
            defaultValues: {
              username: '',
              password: '',
              taxid: '',
              country: ''
            },
            resolver: yupResolver(loginSchema),
            reValidateMode: 'onChange',
            mode: 'onSubmit',
            shouldFocusError: true
          }}
          onSubmit={onSubmit}
        />
        <TouchableOpacity>
          <Text
            style={{
              color: theme.white,
              textAlign: 'center',
              fontSize: fonts.normal,
              textDecorationLine: 'underline'
            }}
          >Recuperar Contraseña
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Text style={{
        color: theme.white,
        textAlign: 'center',
        fontSize: fonts.small
      }}
      >Version {deviceInfoModule.getVersion()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.purple,
    padding: 10
  }
})
