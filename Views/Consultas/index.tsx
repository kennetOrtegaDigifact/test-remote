import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import { useToast } from 'react-native-toast-notifications'
import { fonts, theme } from '../../Config/theme'
import { InputIcon } from '../../Components/InputIcon'
import Icon from '../../Components/Icon'
import { useSelector } from 'react-redux'
import { ReduxState } from '../../Redux/store'
import { useFormSchema } from '../../Hooks/useFormSchema'
import { Form } from '../../Components/Form'
import { FlashList } from '@shopify/flash-list'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import { ConsultasItem } from '../../Components/ConsultasItem'
import { appCodes } from '../../Config/appCodes'
import { Consultas, Filter } from '../../types'
import { numberFormater } from '../../Config/utilities'
import { currenciePrefix } from '../../Config/dictionary'

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
              name='receipt'
              color={theme.gray50}
              size={24}
              type='i'
            />
            <Text style={{
              color: theme.gray50,
              fontSize: fonts.verySmall
            }}
            >Si desea ver mas documentos modifique el filtro de cantidad de documentos
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
      name='receipt'
      color={theme.gray50}
      size={48}
      type='i'
    />
    <Text style={{
      color: theme.gray50,
      fontSize: fonts.small
    }}
    >Parece que no hemos encontrado ningun documento
    </Text>
  </View>
)
export const ConsultasV: React.FC = () => {
  const toast = useToast()
  const controller = new AbortController()
  const { signal } = controller
  const { country = '', taxid, requestor, userName } = useSelector((state: ReduxState) => state.userDB)
  const { consultasFiltroFormSchema } = useFormSchema()
  const { consultasComponentSchema } = useComponentSchema()
  const [dtes, setDtes] = useState<Array<Consultas>>([])
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  // variables
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], [])
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const onSubmit = useCallback((values: Filter) => {
    bottomSheetModalRef.current?.close()
    console.log(values)
    fetchData({ ...values })
  }, [])

  useLayoutEffect(() => {
    console.log('CONSULTAS RENDER')
    fetchData()
    return () => controller.abort()
  }, [])

  const fetchData = useCallback(async (props?: Filter) => {
    setLoading(true)
    setDtes([])
    return consultasComponentSchema?.functions?.fetchData({ signal, ...(props || {}) })
      .then(res => {
        setLoading(false)
        if (res.code === appCodes.ok) {
          if (res?.data) {
            // console.log('CONSULTAS RESPONSE', res.data)
            setDtes(res?.data)
          }
        } else {
          toast.show('Parece que no posees ningun documento, de ser esto incorrecto porfavor revisa tu conexion a internet', {
            type: 'warning'
          })
        }
      })
      .catch((err: Error) => {
        setLoading(false)
        console.log('ERROR GET CONSULTAS', err)
        toast.show('Algo salio mal al tratar de obtener tus documentos, porfavor revisa tu conexion a internet o intentalo mas tarde, si el error persite porfavor reportalo.', {
          type: 'error'
        })
      })
  }, [signal])

  const calculateTotal = useCallback(() => {
    const datos = dtes.filter(e => e?.numeroAuth?.toString()?.toLowerCase()?.includes(search.toLowerCase())) || []
    let monto = 0
    datos.forEach(e => { monto += Number(e?.monto || 0) })
    // console.log('comoooooooooooooooooooooo', datos)
    return numberFormater({ number: monto, toFixed: true, prefix: currenciePrefix?.[country] })
  }, [dtes, search])

  const renderItem = ({ item }: {item: any}) => <ConsultasItem item={item} country={country} />

  return (

    <>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <InputIcon
            keyboardType='default'
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.gray50}
            placeholder={consultasComponentSchema?.labels?.searchLabel || 'Buscar...'}
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
          />
          <TouchableOpacity
            onPress={handlePresentModalPress}
            style={[styles.button]}
          >
            <Icon
              name='filter-menu'
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
            data={dtes?.filter((p: Consultas) => {
              if (p?.[(consultasComponentSchema?.searchKeys?.[0] || '') as keyof typeof p] || p?.[(consultasComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]) {
                return p?.[(consultasComponentSchema?.searchKeys?.[0] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '') || p?.[(consultasComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '')
              }
              return null
            }) || []}
            estimatedItemSize={431}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchData}
                colors={[theme.orange, theme.purple, theme.graygreen]}
                tintColor={theme.graygreen}
              />
              }
            ListEmptyComponent={() => <ListEmpty />}
            ListFooterComponent={() =>
              <ListLimit
                isEmpty={
                    Boolean((dtes?.filter((p: Consultas) => {
                      if (p?.[(consultasComponentSchema?.searchKeys?.[0] || '') as keyof typeof p] || p?.[(consultasComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]) {
                        return p?.[(consultasComponentSchema?.searchKeys?.[0] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '') || p?.[(consultasComponentSchema?.searchKeys?.[1] || '') as keyof typeof p]?.toString()?.toLowerCase()?.includes(search?.toLowerCase() || '')
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
            >Filtros
            </Text>
            <Form
              form={consultasFiltroFormSchema.schema}
              settings={consultasFiltroFormSchema.settings}
              onSubmit={onSubmit}
              resetButton={consultasFiltroFormSchema?.resetButton}
              buttonText='Filtrar'
              buttonIcon={{
                name: 'filter-check',
                color: theme.gray,
                type: 'm',
                size: 24
              }}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>
      </View>
      <View style={{ backgroundColor: theme.graygreen, borderRadius: 13, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.white, fontSize: fonts.small }}>Total de Documentos Mostrados</Text>
          <Text style={{ color: theme.white, fontSize: fonts.subHeader, fontWeight: 'bold' }}>{numberFormater({ number: dtes.filter(e => e?.numeroAuth?.toString()?.toLowerCase()?.includes(search.toLowerCase()))?.length, toFixed: true, fixedDecimal: 0 })}</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.white, fontSize: fonts.small }}>Total en Efectivo</Text>
          <Text style={{ color: theme.white, fontSize: fonts.subHeader, fontWeight: 'bold' }}>{calculateTotal()}</Text>
        </View>
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
