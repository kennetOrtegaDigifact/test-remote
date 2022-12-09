import React, { useCallback, useLayoutEffect, useState } from 'react'
import { Text, View, TouchableOpacity, GestureResponderEvent } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import Icon from '../Icon'
import { cleanUserName, numberFormater } from '../../Config/utilities'
import { Consultas, IconType } from '../../types'
import { currenciePrefix } from '../../Config/dictionary'
import { useServiceBuilder } from '../../Hooks/useServiceBuilder'
import { useApiService } from '../../Hooks/useApiService'
import { appCodes } from '../../Config/appCodes'
import { useToast } from 'react-native-toast-notifications'
type ButtonBarProps={
  icon?: IconType
  title?: string
  disabled?: boolean
  onPress?: (event: GestureResponderEvent) => void
}
const ButtonBar: React.FC<ButtonBarProps> = React.memo(function ButtonBar ({
  icon,
  title = '',
  disabled = false,
  onPress = () => { console.log('UNHANDLED BUTTON BAR FUNCTION') }
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onPress={onPress}
    >
      <Icon
        name={icon?.name}
        size={icon?.size}
        color={icon?.color || theme.purple}
        type={icon?.type || 'i'}
      />
      <Text
        style={{
          color: theme.gray50,
          fontSize: fonts.verySmall
        }}
      >{title}
      </Text>
    </TouchableOpacity>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))

const cancelledKeys = (key: string, value: string) => {
  switch (key) {
    case 'cancelled': return value.toLowerCase() !== 'no'
    default: return false
  }
}

export const ConsultasItem: React.FC<{item: Consultas, country?: string}> = React.memo(function ConsultasItem ({ item, country = '' }) {
  const [cancelled, setCancelled] = useState<boolean>(false)
  const { ticketBuilder } = useServiceBuilder()
  const { getDocumentServiceTS } = useApiService()
  const toast = useToast()
  useLayoutEffect(() => {
    // Object.keys(item).forEach(key => {
    //   if (consultasComponentSchema?.labels?.[key]) {
    //     console.log(`${consultasComponentSchema?.labels?.[key]}${item?.[key as keyof typeof item]}`)
    //   }
    // })
    const anulado = Object.keys(item).some(key => cancelledKeys(key, item?.[key as keyof typeof item] || ''))
    setCancelled(anulado)
  }, [])
  const { consultasComponentSchema } = useComponentSchema()

  const especialCharacters = useCallback((key: string, value: any) => {
    const configs: {[key: string]: any} = {
      username: cleanUserName({ usuario: value }),
      monto: numberFormater({ number: Number(value), toFixed: true, prefix: currenciePrefix?.[country] })
    }
    if (configs?.[key]) {
      return configs?.[key]
    }
    return value
  }, [])

  const printDocument = useCallback(() => {
    // ticketBuilder({ json: {}, customOrder: {} })
    const t = toast.show('Obtiendo documento...', {
      type: 'loading',
      duration: 60000,
      data: {
        theme: 'dark'
      }
    })
    getDocumentServiceTS({ documentType: 'XML', numeroAuth: item?.numeroAuth || '' })
      .then(res => {
        if (res?.code === appCodes.ok) {
          if (res?.data?.XML?.length > 0) {
            setTimeout(() => {
              toast.update(t, 'Documento obtenido exitosamente!', {
                type: 'ok',
                duration: 3000
              })
            }, 500)
            console.log('PARSER XML')
          } else {
            setTimeout(() => {
              toast.update(t, 'Algo salio mal al obtener tu documento, revisa tu conexion a internet o intentalo nuevamente mas tarde, si el error persiste reportalo.', {
                type: 'error',
                duration: 5000
              })
            }, 500)
          }
        } else {
          setTimeout(() => {
            toast.update(t, 'Algo salio mal al obtener tu documento, revisa tu conexion a internet o intentalo nuevamente mas tarde, si el error persiste reportalo.', {
              type: 'error',
              duration: 5000
            })
          }, 500)
        }
      })
  }, [])

  return (
    <>
      <View
        style={{
          backgroundColor: 'white',
          marginVertical: 5,
          borderRadius: 10
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
        >
          <View
            style={{
              padding: 10,
              flex: 0.7
            }}
          >
            {Object.keys(item).map((key, i) => {
              if (consultasComponentSchema?.labels?.[key]) {
                return (
                  <View
                    key={`lbl-${i}`}
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <Text
                      style={{
                        color: theme.gray,
                        fontSize: fonts.verySmall + 1,
                        marginVertical: 2,
                        fontWeight: 'bold'
                      }}
                    >{`${consultasComponentSchema?.labels?.[key]}`}
                    </Text>
                    <Text
                      style={{
                        color: theme.gray,
                        fontSize: fonts.verySmall,
                        marginVertical: 2
                      }}
                    >{especialCharacters(key.toLowerCase(), `${item?.[key as keyof typeof item]}`)}
                    </Text>
                  </View>
                )
              }
              return null
            })}
          </View>
          {cancelled
            ? (
              <View
                style={{
                  backgroundColor: theme.red,
                  borderTopRightRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 1,
                  flex: 0.3
                }}
              >
                <Icon
                  name='cancel'
                  color={theme.white}
                  size={34}
                  type='m'
                />
                <Text
                  style={{
                    color: theme.white,
                    fontSize: fonts.small,
                    textAlign: 'center',
                    flexWrap: 'wrap'
                  }}
                >Documento Anulado
                </Text>
              </View>
              )
            : null}
        </View>
        <View style={{
          borderTopWidth: 0.5,
          borderTopColor: theme.gray50,
          flexDirection: 'row',
          paddingVertical: 5,
          paddingHorizontal: 10,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        >
          <ButtonBar
            icon={{
              name: 'print',
              color: theme.purple,
              size: 20,
              type: 'i'
            }}
            title='Imprimir'
            onPress={printDocument}
          />
          <ButtonBar
            icon={{
              name: 'file-eye',
              color: theme.purple,
              size: 20,
              type: 'm'
            }}
            title='PDF'
          />
          <ButtonBar
            icon={{
              name: 'share-social',
              color: theme.purple,
              size: 20,
              type: 'i'
            }}
            title='Compartir'
          />
          <ButtonBar
            icon={{
              name: 'code-slash',
              color: theme.purple,
              size: 20,
              type: 'i'
            }}
            title='HTML'
          />
          <ButtonBar
            icon={{
              name: 'email',
              color: theme.purple,
              size: 20,
              type: 'm'
            }}
            title='Enviar'
          />
          <ButtonBar
            icon={{
              name: 'cancel',
              color: cancelled ? theme.red50 : theme.red,
              size: 20,
              type: 'm'
            }}
            title='Anular'
            disabled={cancelled}
          />
        </View>
      </View>

    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
