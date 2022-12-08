import React, { useCallback, useLayoutEffect, useState } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import Icon from '../Icon'
import { cleanUserName, numberFormater } from '../../Config/utilities'
import { Consultas, IconType } from '../../types'
type ButtonBarProps={
  icon?: IconType
  title?: string
}
const ButtonBar: React.FC<ButtonBarProps> = React.memo(function ButtonBar ({
  icon,
  title = ''
}) {
  return (
    <TouchableOpacity
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
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

export const ConsultasItem: React.FC<{item: Consultas}> = React.memo(function ConsultasItem ({ item }) {
  const [cancelled, setCancelled] = useState<boolean>(false)
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
      monto: numberFormater({ number: Number(value), toFixed: true })
    }
    if (configs?.[key]) {
      return configs?.[key]
    }
    return value
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
          />
        </View>
      </View>

    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
