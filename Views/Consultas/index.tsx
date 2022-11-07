import React, { useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, PixelRatio } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetModalProvider,
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
export const Consultas: React.FC = () => {
  const toast = useToast()
  const user = useSelector((state: ReduxState) => state.userDB)
  const { consultasFiltroFormSchema } = useFormSchema()
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

  return (

    <>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <InputIcon
              keyboardType='default'
              placeholder='Buscar por No.Autorizacion/Serie'
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
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={2}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={BottomSheetBackdrop}
          >
            {/* <View style={styles.contentContainer}> */}
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
            {/* </View> */}
          </BottomSheetModal>
        </View>
      </BottomSheetModalProvider>
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
