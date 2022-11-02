import React, { useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, PixelRatio, TouchableOpacity, ActivityIndicator } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { yupResolver } from '@hookform/resolvers/yup'
import { useToast } from 'react-native-toast-notifications'
import { loginSchema } from '../../Validators/loginSchema'
import deviceInfoModule from 'react-native-device-info'
import { loginService, recoverPasswordService } from '../../Services/apiService'
import { deletePadLeft } from '../../Config/utilities'
import { appCodes } from '../../Config/appCodes'
import { useDispatch } from 'react-redux'
import { addUser } from '../../Redux/userReducer'
import { useNavigate } from 'react-router-native'
import { Controller, useForm } from 'react-hook-form'
import { InputIcon } from '../../Components/InputIcon'
import { ErrorLabel } from '../../Components/ErrorLabel'
import Icon from '../../Components/Icon'
import { Picker } from '../../Components/Picker'
import { LoginCountries } from '../../Config/dictionary'

export const Login: React.FC = () => {
  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue, getValues } = useForm({
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
  })
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const handleChangePicker = useCallback((fieldName: 'username' | 'password' | 'taxid' | 'country' = 'country', value: {[key: string]: any}, valueKey: string | number) => {
    setValue(fieldName, (value[valueKey] || value))
  }, [setValue])

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

  const handleRecoverPassword = useCallback(() => {
    const country = getValues('country')
    const username = getValues('username')
    let taxid = getValues('taxid')
    if (taxid && country && username) {
      if (country === 'GT') {
        taxid = taxid.padStart(12, '0')
        const recoverPassUser = `${country}.${taxid.trim()}.${username.trim()}`
        console.log('RECOVER USER', recoverPassUser)
        recoverPasswordService({ recoverPassUser })
          .then(res => {
            console.log('RESPONSE RECOVER PASSWORD LOGIN', res)
            if (res.code === appCodes.ok) {
              toast.show(`Contraseña nueva enviada al correo asociado al usuario ${username}, porfavor verifique la informacion.`, {
                type: 'ok'
              })
            } else if (res.code === appCodes.invalidData) {
              toast.show('Datos incorrectos y no se pudo recuperar su contraseña asegurese que el usuario exista y todos los datos sean los correctos, verfique la informacion o vuelvalo a intentarlo', {
                type: 'error'
              })
            } else if (res.code === appCodes.processError) {
              toast.show('Algo salio mal al tratar recuperar su contraseña, verfique la informacion y vuelvalo a intentarlo', {
                type: 'error'
              })
            }
          })
          .catch((err: Error) => {
            console.log('ERROR CATCH RECOVER PASSWORD LOGIN', err)
            toast.show('Ocurrio un error tratando de recuperar su contraseña, verfique la informacion o vuelvalo a intentarlo', {
              type: 'error'
            })
          })
      }
    } else {
      toast.show('Porfavor Indique su: Pais, Identificador Tributario y Nombre de Usuario; para recuperar su contraseña', {
        type: 'warning'
      })
    }
  }, [])
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
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Picker
              items={LoginCountries}
              defaultValue='-- Seleccione un pais --'
              labelKey='name_es'
              valueKey='code'
              inputIcon={{
                name: 'map-marker',
                color: theme.white,
                size: 20,
                type: 'm'
              }}
              withSearch
              searchlabel='Buscar Pais...'
              labelStyle={{
                color: theme.white,
                fontSize: fonts.normal
              }}
              style={{
                borderColor: theme.orange
              }}
              onValueChange={(e) => {
                handleChangePicker('country', e, 'code')
              }}
            />
          )}
          name='country'
        />
        {(errors?.country?.message) && (<ErrorLabel message={errors?.country?.message} />)}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputIcon
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType='default'
              placeholderTextColor={theme.white}
              placeholder='Identificador Tributario'
              icon={{
                name: 'card-account-details',
                color: theme.white,
                size: 20,
                type: 'm'
              }}
              style={[
                {
                  color: theme.white,
                  flex: 1
                }
              ]}
              containerStyle={{
                borderColor: theme.orange
              }}
            />
          )}
          name='taxid'
        />
        {(errors?.taxid?.message) && (<ErrorLabel message={errors?.taxid?.message} />)}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputIcon
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType='default'
              placeholderTextColor={theme.white}
              placeholder='Nombre de Usuario'
              icon={{
                name: 'person',
                color: theme.white,
                size: 20,
                type: 'i'
              }}
              style={[
                {
                  color: theme.white,
                  flex: 1
                }
              ]}
              containerStyle={{
                borderColor: theme.orange
              }}
            />
          )}
          name='username'
        />
        {(errors?.username?.message) && (<ErrorLabel message={errors?.username?.message} />)}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputIcon
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType='default'
              placeholderTextColor={theme.white}
              isSecureTextInput
              placeholder='Contraseña'
              icon={{
                name: 'lock',
                color: theme.white,
                size: 20,
                type: 'm'
              }}
              switchIcon={{
                name: 'eye',
                color: theme.white,
                size: 24,
                type: 'i'
              }}
              style={[
                {
                  color: theme.white,
                  flex: 1
                }
              ]}
              containerStyle={{
                borderColor: theme.orange
              }}
            />
          )}
          name='password'
        />
        {(errors?.password?.message) && (<ErrorLabel message={errors?.password?.message} />)}
        <TouchableOpacity
          style={[styles.button]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {!isSubmitting
            ? (
              <>
                <Icon
                  name='log-in'
                  size={20}
                  color={theme.gray}
                  type='i'
                />
                <Text style={[styles.buttonText]}>Iniciar Sesion</Text>
              </>
              )
            : (
              <ActivityIndicator
                size='large'
                color={theme.gray}
              />
              )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRecoverPassword}
        >
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
  },
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
