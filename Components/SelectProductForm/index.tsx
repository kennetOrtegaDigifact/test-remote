import React, { useEffect, useState } from 'react'

import { TouchableOpacity, TouchableWithoutFeedback, Text, StyleSheet, View } from 'react-native'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { fonts, theme } from '../../Config/theme'
import { useFormSchema } from '../../Hooks/useFormSchema'
import { Producto } from '../../types'
import { Form } from '../Form'
import Icon from '../Icon'
type props = {
  item: Producto,
  country: string,
  onSubmit: (values?: any) => void,
  onDelete: (values?: any) => void,
  name: string
}

const commmonKeys: {[key: string]: {name: string}} = {
  PA: {
    name: 'name'
  }
}
export const SelectProductForm: React.FC<props> = React.memo(function SelectProductForm ({
  item,
  country,
  onSubmit = (values: any) => { console.log('UNHADLED VALUES', values) },
  onDelete = (values: any) => { console.log('UNHADLED VALUES', values) },
  name = ''
}) {
  const [active, setActive] = useState(item?.selected)
  const { selectProductFormSchema } = useFormSchema()
  const h = useSharedValue(0)
  const height = useAnimatedStyle(() => {
    const scale = interpolate(0, [0, 0], [h.value, 0], { extrapolateRight: Extrapolation.EXTEND })
    return {
      height: withSpring(scale, {
        damping: 100,
        stiffness: 300
      })
    }
  })
  useEffect(() => {
    if (active) {
      h.value = 410
      onSubmit({ item: { ...item, selected: active }, name })
    }
  }, [active])

  // console.log(JSON.stringify(item))

  return (
    <>
      <TouchableOpacity
        style={[styles.container, {
          backgroundColor: active ? theme.purple : theme.transparent,
          borderStyle: active ? 'solid' : 'dashed',
          borderColor: active ? theme.purple : theme.gray50,
          borderWidth: active ? 0 : 1
        }]}
        onPress={() => setActive(prev => {
          const i = { ...item, quantity: 1, selected: !prev }
          // console.log('WHATAAAAFUUUCKKKKKKKK', i)
          if (!prev) {
            h.value = 410
            onSubmit({ item: i, name })
          } else {
            h.value = 0
            onDelete({ item: i, name })
          }
          return !prev
        })}
      >
        <View style={[styles.header]}>
          <View style={{ flex: 0.8 }}>
            <Text style={[styles.titleText, { color: active ? theme.white : theme.gray50 }]}>
              {item?.[commmonKeys?.[country]?.name] || '---'}
            </Text>
          </View>
          <Icon
            name={active ? 'checkmark-circle' : 'add-circle'}
            type='i'
            color={active ? theme.white : theme.gray50}
            size={24}
          />
        </View>
        {active
          ? (
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.content, height]}>
                <View style={{ padding: 10 }}>
                  <Form
                    form={selectProductFormSchema.schema}
                    settings={{
                      ...selectProductFormSchema.settings,
                      defaultValues: {
                        ...item,
                        name: item?.name || '',
                        quantity: item?.quantity?.toString() || '112321',
                        'impuestos.ITBMS': item?.impuestos?.ITBMS || ''
                      }
                    }}
                    onSubmit={(values) => onSubmit({ item: values, name })}
                    buttonText='Guardar'
                    buttonIcon={{
                      name: 'inbox-arrow-down',
                      color: theme.gray,
                      type: 'm',
                      size: 24
                    }}
                  />
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
            )
          : null}
      </TouchableOpacity>
    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))

const styles = StyleSheet.create({
  container: {
    borderRadius: 13,
    padding: 2,
    marginVertical: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10
  },
  content: {
    // padding: 10,
    backgroundColor: theme.white,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    overflow: 'hidden'
  },
  titleText: {
    fontSize: fonts.subHeader
  }
})
