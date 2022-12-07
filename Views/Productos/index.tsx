import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import { yupResolver } from '@hookform/resolvers/yup'
import { fonts, theme } from '../../Config/theme'
import { useFormSchema } from '../../Hooks/useFormSchema'
import { InputIcon } from '../../Components/InputIcon'
import { Form } from '../../Components/Form'
import { FlashList } from '@shopify/flash-list'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import { Familia, formulario, OTI, Producto } from '../../types'
import { useDispatch, useSelector } from 'react-redux'
import { ReduxState } from '../../Redux/store'
import { useToast } from 'react-native-toast-notifications'
import { addUser } from '../../Redux/userReducer'
import { useValidator } from '../../Hooks/useValidator'
import Icon from '../../Components/Icon'
import { productTemplate } from '../../Config/templates'
import { appCodes } from '../../Config/appCodes'
import { Item } from './item'

const ListLimit = ({ isEmpty = false }: {isEmpty: boolean}) => {
  return (
    <>
      {
      isEmpty
        ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10
            }}
          >
            <Icon
              name='cart'
              color={theme.gray50}
              size={24}
              type='i'
            />
            <Text style={{
              color: theme.gray50,
              fontSize: fonts.verySmall
            }}
            >No hay mas productos que mostrar
            </Text>
          </View>
          )
        : null
}
    </>
  )
}

const ListEmpty = () => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10
    }}
  >
    <Icon
      name='cart'
      color={theme.gray50}
      size={48}
      type='i'
    />
    <Text style={{
      color: theme.gray50,
      fontSize: fonts.small
    }}
    >Parece que no hemos encontrado ningun producto
    </Text>
  </View>
)

const keyExtractor = (_: any, index: number) => `item-${index}`
export const Productos: React.FC = () => {
  const { productos, permisos, country = '' } = useSelector((state: ReduxState) => state.userDB)
  const { familias } = useSelector((state: ReduxState) => state.utilsDB)
  const dispatch = useDispatch()
  const { productsSchema } = useFormSchema({})
  const [productsDynamicSchema, setProductsDynamicSchema] = useState<formulario[]>(productsSchema.schema)
  const [search, setSearch] = useState<string>('')
  const [defaultValuesSchema, setDefaultValuesSchema] = useState<{[x: string]: any}|undefined>(productsSchema.settings.defaultValues)
  const [item, setItem] = useState<Producto>(productTemplate)
  const controller = useRef<AbortController>(new AbortController()).current
  const { productosComponentSchema } = useComponentSchema()
  const { productosValidatorSchema } = useValidator()
  const [loading, setLoading] = useState<boolean>(false)
  const toast = useToast()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], [])
  const watcher = useCallback((name: string, value: any) => {
    console.log('VALUES WATCHER PRODUCTO', name, value)
    switch (name) {
      case 'segmento': {
        const familiasFilter = familias?.filter((e: Familia) => {
          const code = e?.codFamilia?.toString()?.split('')
          const filter = `${code[0]}${code[1]}`
          if (filter === value?.toString()) {
            return true
          }
          return false
        })
        console.log('FAMILIAS FILTRADAS', productsDynamicSchema)
        const schema = productsDynamicSchema.map((e: formulario) => {
          let sch: any = e
          if (e?.name === 'familia') {
            sch = {
              ...e,
              picker: {
                ...e.picker,
                data: familiasFilter
              }
            }
          }
          return sch
        })
        setProductsDynamicSchema(schema)
        break
      }
      default:
    }
  }, [])
  const handlePresentModalPress = useCallback(() => {
    if (permisos?.Productos?.['Crear Nuevo']?.granted) {
      bottomSheetModalRef.current?.present()
      const dictionary = Object.keys(productsSchema?.settings?.defaultValues || {})
      const obj: any = {}
      dictionary.forEach(key => {
        if (dictionary.some(k => k === key)) {
          obj[key] = ''
        }
      })
      setDefaultValuesSchema(obj)
    } else {
      toast.show('', { type: 'deniedAction' })
    }
  }, [productsSchema?.settings, permisos])

  const onSubmit = useCallback((values: any) => {
    bottomSheetModalRef.current?.close()
    productosComponentSchema?.functions?.addEdit(values)
      .then(async res => {
        console.log('RESPONSE CREATE PRODUCT', res)
        if (res?.code === appCodes.ok) {
          await fecthData()
        }
      })
  }, [])

  const handleEdit = useCallback((item: Producto) => {
    if (permisos?.Productos?.['Modificar Descripcion']?.granted || permisos?.Productos?.['Modificar Precio']?.granted) {
      console.log('EDIT ITEM', JSON.stringify(item))
      const dictionary = Object.keys(productsSchema?.settings?.defaultValues || {})
      const obj: any = {}
      Object.keys(item || {}).forEach(key => {
        if (dictionary.some(k => k === key)) {
          obj[key] = item?.[key as keyof typeof item]?.toString()
        }
      })
      Object.keys(item?.impuestos || {})?.forEach(key => {
        if (dictionary.some(k => k === key)) {
          if (key === 'ISC') {
            obj[key] = ((parseFloat(item?.impuestos?.[key]?.Tasa?.toString() || '0')))?.toString()
          } else {
            obj[key] = ((parseFloat(item?.impuestos?.[key as keyof typeof item.impuestos]?.Tasa?.toString() || '0')) || item?.impuestos?.[key as keyof typeof item.impuestos])?.toString()
          }
        }
      })
      const dictionaryOTI: any = {
        '01': 'SUME911',
        '02': 'TasaPortabilidadNumerica',
        '03': 'ImpuestoSobreSeguro'
      }
      item?.impuestos?.OTI?.forEach((ot: OTI) => {
        if (dictionary.some(k => k === dictionaryOTI?.[ot?.Codigo])) {
          obj[dictionaryOTI?.[ot?.Codigo]] = ot?.Tasa?.toString()
        }
      })
      console.log('AL FINAL SALIO', obj)
      setDefaultValuesSchema(obj)
      setItem(item)
      bottomSheetModalRef.current?.present()
    } else {
      toast.show('', { type: 'deniedAction' })
    }
  }, [productsSchema.settings.defaultValues, permisos])

  const handleDelete = useCallback((item: Producto) => {
    if (permisos?.Productos?.Eliminar?.granted) {
      Alert.alert(
        'Borrar Producto',
            `Esta seguro de eliminar el producto${item.name ? ` "${item.name}"` : ''}`,
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Si, Eliminar',
                style: 'default',
                onPress: () => {
                  productosComponentSchema.functions?.borrar(item).then(async res => {
                    if (res === appCodes.ok) {
                      await fecthData()
                    }
                  })
                }
              }
            ],
            { cancelable: true }
      )
    } else {
      toast.show('', { type: 'deniedAction' })
    }
  }, [permisos])

  const renderItem = useCallback(({ item }: {item: Producto}) => (<Item item={item} handleEdit={handleEdit} handleDelete={handleDelete} country={country} />), [handleEdit, handleDelete])

  const fecthData = useCallback(async () => {
    setLoading(true)
    return productosComponentSchema
      ?.functions
      ?.fetchData(controller.signal)
      .then(res => {
        setLoading(false)
        if (res.code === appCodes.ok) {
          console.log(res.data)
          if (res.data) {
            dispatch(addUser({
              productos: res.data
            }))
          }
        }
        if (res.code === appCodes.dataVacio) {
          toast.show('Parece que no posees productos', {
            type: 'advertise'
          })
        }
        if (res.code === appCodes.processError) {
          toast.show('Algo salio mal al tratar de obtener tus productos, porfavor revisa tu conexion a internet e intentalo mas tarde, si el error persiste reportalo.', {
            type: 'error'
          })
        }
      })
  }, [])

  const onRefresh = useCallback(() => {
    console.log('refrescando')
    fecthData()
  }, [])

  useEffect(() => {
    if (!productos?.length) {
      fecthData()
    } else {
      console.log('PRODUCTOS PRECARGADOS')
    }
    return () => controller.abort()
  }, [])

  // if (!permisos?.Productos?.Consultar?.granted) {
  //   return <AccessDeniedScreen />
  // }

  return (
    <>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <InputIcon
            value={search}
            onChangeText={setSearch}
            keyboardType='default'
            placeholder={productosComponentSchema?.labels?.searchLabel || 'Buscar...'}
            icon={{
              name: 'search1',
              color: theme.graygreen,
              size: 20,
              type: 'a'
            }}
            containerStyle={{
              flex: 1,
              borderColor: theme.graygreen
            }}
            style={{
              fontSize: fonts.small,
              flex: 1
            }}
          />
          <TouchableOpacity
            onPress={handlePresentModalPress}
            style={[styles.button]}
          >
            <Icon
              name='store-plus'
              size={24}
              color={theme.gray}
              type='m'
            />
          </TouchableOpacity>
        </View>
        <View style={{
          flex: 1
        }}
        >
          <FlashList
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            data={productos?.filter((p: Producto) => {
              if (p?.[(productosComponentSchema?.searchKeys?.[0] || '') as keyof typeof p] || p?.[(productosComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]) {
                return p?.[(productosComponentSchema?.searchKeys?.[0] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '') || p?.[(productosComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '')
              }
              return null
            }) || []}
            estimatedItemSize={100}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                colors={[theme.orange, theme.purple, theme.graygreen]}
                tintColor={theme.graygreen}
              />
              }
            ListEmptyComponent={() => <ListEmpty />}
            ListFooterComponent={() =>
              <ListLimit
                isEmpty={
                    Boolean((productos?.filter((p: Producto) => {
                      if (p?.[(productosComponentSchema?.searchKeys?.[0] || '') as keyof typeof p] || p?.[(productosComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]) {
                        return p?.[(productosComponentSchema?.searchKeys?.[0] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '') || p?.[(productosComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '')
                      }
                      return null
                    }) || []).length)
                }
              />}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={2}
          snapPoints={snapPoints}
          backdropComponent={BottomSheetBackdrop}
        >

          <BottomSheetScrollView style={styles.contentContainer}>
            <Text
              style={{
                fontSize: fonts.header,
                fontWeight: '700',
                textAlign: 'center',
                color: theme.gray75
              }}
            >Crear/Editar Producto
            </Text>
            <Form
              form={productsDynamicSchema}
              settings={{
                ...productsSchema.settings,
                defaultValues: defaultValuesSchema,
                resolver: yupResolver(productosValidatorSchema({ array: productos, item }))
              }}
              watchCallback={watcher}
              observables={['segmento']}
              onSubmit={onSubmit}
              buttonText='Guardar'
              buttonIcon={{
                name: 'inbox-arrow-down',
                color: theme.gray,
                type: 'm',
                size: 24
              }}
            />

          </BottomSheetScrollView>
        </BottomSheetModal>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    padding: 10
  },
  button: {
    backgroundColor: theme.orange,
    padding: 10,
    margin: 5,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
