import React, { useCallback } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Icon from '../../Components/Icon'
import { fonts, theme } from '../../Config/theme'
import { numberFormater } from '../../Config/utilities'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import { Producto } from '../../types'
type ItemProps={
    item: Producto,
    handleEdit?: (item: Producto) => void,
    handleDelete?: (item: Producto) => void,
    country: string
}

const commonKeys: {
    descripcion: {[key: string]: string}
} = {
  descripcion: {
    PA: 'name',
    GT: 'name'
  }
}

export const ItemProducto: React.FC<ItemProps> = React.memo(function Item ({
  item,
  handleEdit = (item: Producto) => { console.log('UNHANDLE EDIT ITEM ', item) },
  handleDelete = (item: Producto) => { console.log('UNHANDLE DELETE ITEM ', item) },
  country = ''
}) {
  const { productosComponentSchema } = useComponentSchema()
  const especialCharacters = useCallback((key: string, value: any) => {
    const configs: {[key: string]: any} = {
      precio: numberFormater({ number: Number(value), toFixed: true })
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
          backgroundColor: theme.white,
          padding: 5,
          paddingHorizontal: 10,
          borderRadius: 10,
          marginVertical: 5,
          minHeight: 80,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <View
          style={{
            flex: 0.7
          }}
        >
          <Text
            style={{
              fontSize: fonts.normal,
              color: theme.graygreen,
              fontWeight: '700'
            }}
          >{item?.name || '---'}
          </Text>
          {Object.keys(item).map((key, i) => {
            if (productosComponentSchema?.labels?.[key]) {
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
                      fontSize: fonts.small,
                      color: theme.gray50
                    }}
                  >{`${productosComponentSchema?.labels?.[key]}`}
                  </Text>
                  <Text
                    style={{
                      fontSize: fonts.small,
                      color: theme.gray50
                    }}
                  >{especialCharacters(key.toLowerCase(), `${item?.[key as keyof typeof item]}`)}
                  </Text>
                </View>
              )
            }
            return null
          })}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            flex: 0.3
          }}
        >
          <TouchableOpacity
            onPress={() => handleDelete(item)}
          >
            <Icon
              name='trash'
              color={theme.red}
              size={24}
              type='i'
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
          >
            <Icon
              name='square-edit-outline'
              color={theme.purple}
              size={24}
              type='m'
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
