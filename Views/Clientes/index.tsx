import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, RefreshControl, Alert } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import { useDispatch, useSelector } from 'react-redux'
// import { AccessDeniedScreen } from '../../Components/AccessDeniedScreen'
import { fonts, theme } from '../../Config/theme'
import { addUser } from '../../Redux/userReducer'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import { useFormSchema } from '../../Hooks/useFormSchema'
import { InputIcon } from '../../Components/InputIcon'
import { Form } from '../../Components/Form'
import { FlashList } from '@shopify/flash-list'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import { ReduxState } from '../../Redux/store'
import { Cliente, formulario } from '../../types'
import { ItemClient } from './ItemClient'
import { clientsCustomFormCountry, MunicipiosGT } from '../../Config/dictionary'
import { appCodes } from '../../Config/appCodes'
import Icon from '../../Components/Icon'
import { useApiService } from '../../Hooks/useApiService'

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
              name='person'
              color={theme.gray50}
              size={24}
              type='i'
            />
            <Text style={{
              color: theme.gray50,
              fontSize: fonts.verySmall
            }}
            >No hay mas clientes que mostrar
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
      name='person'
      color={theme.gray50}
      size={48}
      type='i'
    />
    <Text style={{
      color: theme.gray50,
      fontSize: fonts.small
    }}
    >Parece que no hemos encontrado ningun cliente
    </Text>
  </View>
)

const ClientesV = () => {
  const toast = useToast()
  const dispatch = useDispatch()
  const controller = useRef<AbortController>(new AbortController()).current
  const { country = '', permisos, clientes, token = '' } = useSelector((state: ReduxState) => state.userDB)
  const { distritos, corregimientos } = useSelector((state: ReduxState) => state.utilsDB)
  const [loading, setLoading] = useState<boolean>(false)
  const [customCountry, setCustomCountry] = useState<string>(country)
  const [search, setSearch] = useState<string>('')
  const { clientesComponentSchema } = useComponentSchema()
  const { verifyRUC, getInfoByNITService } = useApiService()
  const onBlur = useCallback((values: any) => {
    const dictionary = clientsFormSchema(customCountry)?.onBlurValues || []
    const keys = Object.keys(values || {}) || []
    if (keys.some(v => dictionary.some((d: any) => d === v))) { // si entra significa que hay campos captados por el onblur
      switch (values?.countryCode) {
        case 'PA': {
          const obj: {
             [key: string]: any
          } = {}
          dictionary.forEach((key: any) => {
            obj[key] = values?.[key] || ''
          })
          // console.log('OBJECTO FINAL ONBLUR PA', obj)
          verifyRUC({ token, RUC: obj?.cTaxId, tipo: obj?.tipoCliente })
            .then(res => {
              // console.log('LO LOGRAMO?', res)
              if (res.code === appCodes.ok) {
                const schema: any = {}
                keys.forEach((key: string) => {
                  schema[key] = res?.data?.[key as keyof typeof res.data] || values[key]
                })
                // console.log('saliooo', schema)
                setDefaultValuesSchema(schema)
              } else {
                const schema = values
                keys.forEach(key => {
                  if (!dictionary.some((d: any) => d === key)) {
                    schema[key] = ''
                  }
                })
                setDefaultValuesSchema(schema)
              }
            })
          return null
        }
        case 'GT': {
          console.log('GT CAPTADO')
          const obj: {
             [key: string]: any
          } = {}
          dictionary.forEach((key: any) => {
            obj[key] = values?.[key] || ''
          })
          console.log('OBJETO GT', obj)
          getInfoByNITService({ cTaxId: obj?.cTaxId })
            .then(res => {
              if (res?.code === appCodes.ok) {
                const schema: any = {}
                keys.forEach((key: string) => {
                  schema[key] = res?.data?.[key as keyof typeof res.data]?.toString() || values[key]?.toString()
                })
                // console.log('saliooo', schema)
                setDefaultValuesSchema(schema)
              } else {
                const schema = values
                keys.forEach(key => {
                  if (!dictionary.some((d: any) => d === key)) {
                    schema[key] = ''
                  }
                })
                console.log('ESQUEMA', schema)
                setDefaultValuesSchema(schema)
              }
            })
          return null
        }
      }
    }
  }, [])

  const { clientsFormSchema } = useFormSchema({ onBlur })
  const [defaultSchema, setDefaultSchema] = useState<formulario[]>(clientsFormSchema(customCountry).schema)
  const [defaultValuesSchema, setDefaultValuesSchema] = useState<{[x: string]: any}|undefined>(clientsFormSchema(customCountry).settings.defaultValues)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], [])
  const handlePresentModalPress = useCallback(() => {
    if (permisos?.Clientes?.['Crear Nuevo']?.granted) {
      setCustomCountry(country)
      const dictionary = Object.keys(defaultValuesSchema || {})
      const obj: any = {}
      dictionary.forEach((key: string) => {
        obj[key as keyof typeof obj] = ''
      })
      console.log('ESQUEMA FINAL', obj)
      setDefaultValuesSchema(obj)
      bottomSheetModalRef.current?.present()
    } else {
      toast.show('', { type: 'deniedAction' })
    }
  }, [])

  const onSubmit = useCallback((values: Cliente) => {
    bottomSheetModalRef.current?.close()
    console.log(values)
    return clientesComponentSchema?.functions?.addEdit(values)
      .then(async res => {
        console.log('RESPONSE CREATE CLIENT', res)
        if (res?.code === appCodes.ok) {
          await fecthData()
        }
      })
  }, [])

  const handleEdit = useCallback((item: Cliente) => {
    if (permisos?.Clientes?.Editar?.granted) {
      const dictionary = Object.keys(defaultValuesSchema || {})
      const obj: any = {}
      dictionary.forEach((key: string) => {
        obj[key as keyof typeof obj] = item?.[key as keyof typeof item]?.toString() || ''
      })
      console.log('ESQUEMA FINAL', obj)
      setDefaultValuesSchema(obj)
      bottomSheetModalRef.current?.present()
    } else {
      toast.show('', { type: 'deniedAction' })
    }
  }, [])

  const handleDelete = useCallback((item: Cliente) => {
    if (permisos?.Clientes?.Eliminar?.granted) {
      Alert.alert(
        'Borrar Cliente',
            `Esta seguro de eliminar el cliente${item.nombreContacto ? ` "${item.nombreContacto}"` : ''}`,
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Si, Eliminar',
                style: 'default',
                onPress: () => {
                  clientesComponentSchema?.functions?.borrar(item).then(async res => {
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
  }, [])

  const renderItem = useCallback(({ item }: {item: Cliente}) => (<ItemClient item={item} handleEdit={handleEdit} handleDelete={handleDelete} country={country} />), [handleEdit, handleDelete])

  const fecthData = useCallback(async () => {
    setLoading(true)
    return clientesComponentSchema
      ?.functions
      ?.fetchData(controller.signal)
      .then(res => {
        setLoading(false)
        if (res.code === appCodes.ok) {
          if (res.data) {
            dispatch(addUser({
              clientes: res.data
            }))
          }
        }
        if (res.code === appCodes.dataVacio) {
          toast.show('Parece que no posees Clientes', {
            type: 'warning'
          })
        }
        if (res.code === appCodes.processError) {
          toast.show('Algo salio mal al tratar de obtener tus clientes, porfavor revisa tu conexion a internet e intentalo mas tarde, si el error persiste reportalo.', {
            type: 'error'
          })
        }
      })
  }, [])

  const onRefresh = useCallback(() => {
    console.log('refrescando')
    fecthData()
  }, [])

  const watcher = useCallback((name: string, value: any) => {
    console.log('WATCHER CALLBACK', name, value)
    switch (name) {
      case 'countryCode': {
        if (clientsCustomFormCountry.every(v => v !== value)) {
          setCustomCountry('generico')
          setDefaultSchema(clientsFormSchema('generico').schema)
        } else {
          if (value !== '-1') {
            setCustomCountry(value)
            setDefaultSchema(clientsFormSchema(value).schema)
          }
        }
        return null
      }
      case 'provincia': {
        if (value?.toString()?.length) {
          const data: any[] = distritos?.filter((d: any) => {
            const dis = (d?.codDistrito || '')?.split('-')?.[0] || ''
            // console.log(dis)
            return dis?.toString() === value?.toString()
          }) || []
          // console.log('DISTRITOS FILTRADOS', data)
          const defaultSchemaFiltered: formulario|undefined = defaultSchema?.find((s: formulario) => s.name === 'distrito')
          // console.log('SCHEMA FILTRADO', defaultSchemaFiltered)
          const finalSchema: any = {
            ...defaultSchemaFiltered,
            picker: {
              ...(defaultSchemaFiltered?.picker || {}),
              data: [
                { nombre: '-- Selecccione un Distrito  --', codDistrito: '' },
                ...data
              ]
            }
          }
          // console.log('final schema', finalSchema)
          const result: formulario[] = defaultSchema?.map((s: formulario) => {
            const obj: formulario = s
            if (s?.name === 'distrito') {
              return finalSchema
            }
            return obj
          })

          // console.log('AL FINAL QUEDA', result)
          setDefaultSchema(result)
        }
        return null
      }
      case 'distrito': {
        if (value?.toString()?.length) {
          const data: any[] | undefined = corregimientos?.filter((c: any) => {
            // console.log(c)
            const corrProps = (c?.codCorregimiento)?.split('-')
            return `${(corrProps?.[0] || '')}-${(corrProps?.[1] || '')}` === value?.toString()
          })
          // console.log('CORREGIMIENTOS FILTRADOS', data)
          const defaultSchemaFiltered: formulario|undefined = defaultSchema?.find((s: formulario) => s.name === 'corregimiento')
          // console.log('ESQUEMA FILTRADO', defaultSchemaFiltered)
          const finalSchema: any = {
            ...defaultSchemaFiltered,
            picker: {
              ...(defaultSchemaFiltered?.picker || {}),
              data: [
                { nombre: '-- Selecccione un Corregimiento  --', codCorregimiento: '' },
                ...(data || [])
              ]
            }
          }
          console.log('ESQUEMA FINAl', finalSchema)
          const result: formulario[] = defaultSchema?.map((s: formulario) => {
            const obj: formulario = s
            if (s?.name === 'corregimiento') {
              return finalSchema
              // console.log(JSON.stringify(obj))
            }
            return obj
          })

          // console.log('AL FINAL QUEDA', result)
          setDefaultSchema(result)
        }
        return null
      }
      case 'departamento': {
        console.log('DEFAULT SCHEMA', defaultSchema)
        const data: string[] = MunicipiosGT?.[(value || '') as keyof typeof MunicipiosGT] || []
        const defaultSchemaFiltered: formulario|undefined = defaultSchema?.find((s: formulario) => s.name === 'municipio')
        const finalSchema: any = {
          ...defaultSchemaFiltered,
          picker: {
            ...(defaultSchemaFiltered?.picker || {}),
            data: [
              { '': '-- Selecccione un Municipio  --' },
              ...data
            ]
          }
        }
        console.log('MUNICIPIOS FILTRADOS', data)
        const result: formulario[] = defaultSchema?.map((s: formulario) => {
          const obj: formulario = s
          if (s?.name === 'municipio') {
            return finalSchema
            // console.log(JSON.stringify(obj))
          }
          return obj
        })

        // console.log('AL FINAL QUEDA', result)
        setDefaultSchema(result)
        return null
      }
      default:
    }
  }, [defaultSchema])

  useEffect(() => {
    if (!clientes?.length) {
      fecthData()
    } else {
      console.log('CLIENTES PRECARGADOS')
    }
    return () => controller && controller.abort()
  }, [])

  // if (!permisos?.Clientes?.granted || false) {
  //   return (
  //     <>
  //       <AccessDeniedScreen />
  //     </>
  //   )
  // }
  return (
    <>
      {/* <BottomSheetModalProvider> */}
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <InputIcon
            value={search}
            onChangeText={setSearch}
            keyboardType='default'
            placeholder={clientesComponentSchema?.labels?.searchLabel || 'Buscar...'}
            placeholderTextColor={theme.gray50}
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
              fontSize: fonts.small
            }}
          />
          <TouchableOpacity
            onPress={handlePresentModalPress}
            style={[styles.button]}
          >
            <Icon
              name='person-add'
              size={24}
              color={theme.gray}
              type='i'
            />
          </TouchableOpacity>
        </View>
        <View style={{
          flex: 1
        }}
        >
          <FlashList
            renderItem={renderItem}
            data={clientes?.filter((p: Cliente) => {
              if (p?.[(clientesComponentSchema?.searchKeys?.[0] || '') as keyof typeof p] || p?.[(clientesComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]) {
                return p?.[(clientesComponentSchema?.searchKeys?.[0] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '') || p?.[(clientesComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '')
              }
              return null
            }) || []}
            estimatedItemSize={231}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                colors={[theme.orange, theme.purple, theme.graygreen]}
                tintColor={theme.graygreen}
                onRefresh={onRefresh}
              />
              }
            ListEmptyComponent={() => <ListEmpty />}
            ListFooterComponent={() => <ListLimit isEmpty={
                Boolean((clientes?.filter((p: Cliente) => {
                  if (p?.[(clientesComponentSchema?.searchKeys?.[0] || '') as keyof typeof p] || p?.[(clientesComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]) {
                    return p?.[(clientesComponentSchema?.searchKeys?.[0] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '') || p?.[(clientesComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '')
                  }
                  return null
                }) || [])?.length)
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
            >Crear/Editar Cliente
            </Text>
            <Form
              form={defaultSchema}
              settings={{
                ...clientsFormSchema(customCountry).settings,
                defaultValues: defaultValuesSchema
              }}
              observables={clientsFormSchema(customCountry)?.observables}
              watchCallback={watcher}
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
      {/* </BottomSheetModalProvider> */}
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

export const Clientes = memo(ClientesV, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
