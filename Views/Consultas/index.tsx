import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { useApiService } from '../../Hooks/useApiService'
import { useComponentSchema } from '../../Hooks/useComponentSchema'
import { ConsultasItem } from '../../Components/ConsultasItem'
import { appCodes } from '../../Config/appCodes'
const renderItem = ({ item }: {item: any}) => <ConsultasItem item={item} />

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
export const Consultas: React.FC = () => {
  const { } = useApiService()
  const toast = useToast()
  const { country, taxid, requestor, userName } = useSelector((state: ReduxState) => state.userDB)
  const { consultasFiltroFormSchema } = useFormSchema()
  const { consultasComponentSchema } = useComponentSchema()
  const [dtes, setDtes] = useState<Array<any>>([])
  const [loading, setLoading] = useState<boolean>(false)
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  // variables
  const snapPoints = useMemo(() => ['25%', '50%', '80%'], [])
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index)
  }, [])

  const onSubmit = useCallback((values: any) => {
    bottomSheetModalRef.current?.close()
    console.log(values)
  }, [])

  useLayoutEffect(() => {
    console.log('CONSULTAS RENDER')
    const controller = new AbortController()
    const { signal } = controller
    setLoading(true)
    // Services.getDTESService?.[country]({ userName, taxid, country, requestor, signal })
    //   .then((res: {code: number, data?: Array<any>}) => {
    //     setLoading(false)
    //     if (res.code === appCodes.ok) {
    //       if (res?.data) {
    //         console.log('CONSULTAS RESPONSE', res.data)
    //         setDtes(res?.data)
    //       }
    //     } else {
    //       toast.show('Parece que no posees ningun documento, de ser esto incorrecto porfavor revisa tu conexion a internet', {
    //         type: 'warning'
    //       })
    //     }
    //   })
    //   .catch((err: Error) => {
    //     setLoading(false)
    //     console.log('ERROR GET CONSULTAS', err)
    //     toast.show('Algo salio mal al tratar de obtener tus documentos, porfavor revisa tu conexion a internet o intentalo mas tarde, si el error persite porfavor reportalo.', {
    //       type: 'error'
    //     })
    //   })

    return () => controller.abort()
  }, [])

  return (

    <>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <InputIcon
            keyboardType='default'
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
            data={dtes}
            estimatedItemSize={231}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                colors={[theme.orange, theme.purple, theme.graygreen]}
                tintColor={theme.graygreen}
              />
              }
            ListEmptyComponent={() => <ListEmpty />}
            ListFooterComponent={() => <ListLimit isEmpty={Boolean(dtes.length)} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={2}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
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
