import React, { useCallback, useEffect } from 'react'
import { Text, View } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import Icon from '../Icon'
import { cleanUserName, numberFormater } from '../../Config/utilities'
export const ConsultasItem: React.FC<{item: any}> = React.memo(function ConsultasItem ({ item }) {
//   console.log(item)
  useEffect(() => {
    Object.keys(item).forEach(key => {
      if (consultasComponentSchema?.labels?.[key]) {
        console.log(`${consultasComponentSchema?.labels?.[key]}${item?.[key]}`)
      }
    })
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
      <View style={{
        backgroundColor: 'white',
        marginVertical: 5,
        borderRadius: 10,
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
                  >{especialCharacters(key.toLowerCase(), `${item?.[key]}`)}
                  </Text>
                </View>
              )
            }
            return null
          })}
        </View>
        <View
          style={{
            backgroundColor: theme.red,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
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
      </View>
    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
