import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Icon from '../../Components/Icon'
import { fonts, theme } from '../../Config/theme'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import { Cliente } from '../../types'

type ItemProps={
    item: Cliente,
    handleEdit?: (item: Cliente) => void,
    handleDelete?: (item: Cliente) => void,
    country: string
}

const commonKeys = {
  nombre: {
    GT: '',
    PA: 'nombreContacto'
  }
}

export const ItemClient: React.FC<ItemProps> = React.memo(function Item ({
  item,
  handleEdit = (item: Cliente) => { console.log('UNHANDLE EDIT ITEM ', item) },
  handleDelete = (item: Cliente) => { console.log('UNHANDLE DELETE ITEM ', item) },
  country = ''
}) {
  const { clientesComponentSchema } = useComponentSchema()
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
          >{item[commonKeys?.nombre?.[country]] || '---'}
          </Text>
          {Object.keys(item).map((key, i) => {
            if (clientesComponentSchema?.labels?.[key]) {
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
                  >{`${clientesComponentSchema?.labels?.[key]}`}
                  </Text>
                  <Text
                    style={{
                      fontSize: fonts.small,
                      color: theme.gray50
                    }}
                  >{`${item?.[key]}`}
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
})
