import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import { TextStyle, ViewStyle, View, PixelRatio, StyleSheet, Text, TextInputProps, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { useForm, Controller, UseFormProps } from 'react-hook-form'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { formulario, IconType, Producto } from '../../types'
import moment from 'moment'
import { fonts, theme } from '../../Config/theme'
import { InputIcon } from '../InputIcon'
import { ErrorLabel } from '../ErrorLabel'
import { Switch } from '../Switch'
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useSelector } from 'react-redux'
import { ReduxState } from '../../Redux/store'
import { SelectProductForm } from '../SelectProductForm'
import Icon from '../Icon'
import { PickerTS } from '../Picker'
const getItemLayout = (_: any, index: number) => ({ length: 231, offset: 231 * index, index })
type formProps = {
  form: Array<formulario>,
  settings: UseFormProps,
  onSubmit: (values: any) => void,
  observables?: string[],
  inputStyle?: TextStyle,
  inputProps?: TextInputProps,
  buttonText?: string,
  buttonTextStyle?: TextStyle,
  buttonStyles?: ViewStyle,
  buttonIcon?: IconType,
  containerInputStyle?: ViewStyle,
  watchCallback?: (name?: any, value?: any, extraData?: any) => void
}

const commmonKeys: {[key: string]: {ListaProductos: string}} = {
  PA: {
    ListaProductos: 'ListaProductos'
  }
}
export const Form: React.FC<formProps> = ({ form = [], settings, buttonIcon, onSubmit = () => { console.log('UNHANDLE SUBMIT') }, watchCallback = () => { console.log('UNHANDLE WATCH') }, observables = [], inputStyle, buttonTextStyle, buttonText, buttonStyles, containerInputStyle, inputProps }) => {
  const { productos, country } = useSelector((state: ReduxState) => state.userDB)
  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, getValues, reset } = useForm(settings)
  const [date, setDate] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['25%', '50%', '80%'], [])
  const [selectedProducts, setSelectedProducts] = useState<Producto[]>(JSON.parse(settings.defaultValues?.[commmonKeys?.[country]?.ListaProductos || ''] || '[]'))
  // console.log('AAAAAAAAAAAAAAAAAAAAAAAAa', JSON.parse(settings.defaultValues?.[commmonKeys?.[country]?.ListaProductos || ''] || '[]'))
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleChangeDate = useCallback((e: DateTimePickerEvent, fieldName: string) => {
    setDate(() => {
      setValue(fieldName, moment(e.nativeEvent.timestamp).format('DD-MM-YYYY'))
      return ''
    })
  }, [setValue])

  const handleChangePicker = useCallback((fieldName: string, value: { [key: string]: any[] }, valueKey?: string | number) => {
    setValue(fieldName, (value[valueKey || ''] || value))
  }, [setValue])

  const handleDefaultValuePicker = useCallback((data?: any[], labelKey?: string, valueKey?: string, defaultValue?: string, value?: { [key: string]: any[] }) => {
    return data?.find(d => d?.[valueKey || '']?.toString() === value?.toString() || d?.toString() === value?.toString())?.[labelKey || ''] || value || defaultValue
  }, [])

  const handleProduct = useCallback(({ item, name }: { item: Producto, name: string }) => {
    console.log('HANDLE PRODUCTO', item, name)
    const arr = JSON.parse(getValues(name) || '[]')
    const result: Producto[] = arr
    const finded = arr?.find((e: Producto) => e?.ean === item?.ean)
    console.log('como', finded)
    if (finded) {
      result[result.indexOf(finded)] = item
    } else {
      result?.push(item)
    }

    console.log('ARRAY DE PRODUCTOS', result)
    setValue(name, JSON.stringify(result))
    setSelectedProducts(result)
  }, [getValues, setValue])

  const deleteProduct = useCallback(({ item, name }: { item: Producto, name: string }) => {
    console.log('HANDLE DELETE PRODUCTO', item, name)
    const arr = JSON.parse(getValues(name) || '[]')
    const result = arr?.filter((i: Producto) => {
      if (i?.ean === item?.ean) return false
      return true
    })
    console.log('ARRAY DE PRODUCTOS', result)
    setValue(name, JSON.stringify(result))
    setSelectedProducts(result)
  }, [])

  const handleProductList = useCallback(() => {
    console.log('COMOOOOOOOOOOOOOOOO', selectedProducts)
    return productos?.map((e: Producto) => {
      selectedProducts?.forEach((i: Producto) => {
        if (e?.ean === i?.ean) {
          console.log('ESTE ES EL IGUAL', i)
          e = i
        }
      })
      return e
    })
  }, [selectedProducts])

  const renderItem = ({ item, name }: {item: Producto, name: string}) => <SelectProductForm item={item} country={country} onSubmit={handleProduct} name={name} onDelete={deleteProduct} />

  useEffect(() => {
    reset(settings?.defaultValues)
  }, [settings?.defaultValues])

  useEffect(() => {
    const subscription = watch((value, { name = '' }) => {
      if (observables.some(key => key === name)) {
        watchCallback(name, value?.[name || ''], getValues())
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  return (
    <>
      {form.map(f => {
        if (f.type === 'inputText') {
          return (
            <View key={JSON.stringify(f)}>
              <View style={{ flexDirection: 'row' }}>
                {f?.label
                  ? (
                    <Text style={[{
                      color: theme.purple,
                      marginLeft: 10,
                      marginRight: 5,
                      fontSize: fonts.normal,
                      fontWeight: 'bold'
                    }, f?.labelStyle]}
                    >{f?.label}
                    </Text>
                    )
                  : null}
                {f?.required
                  ? (
                    <Text style={[{
                      color: theme.red,
                      fontSize: fonts.subHeader,
                      fontWeight: 'bold'
                    }, f?.labelStyle]}
                    >*
                    </Text>
                    )
                  : null}
              </View>

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputIcon
                    value={value}
                    onBlur={() => {
                      onBlur()
                      f?.onBlur && f?.onBlur(getValues())
                    }}
                    onChangeText={onChange}
                    disabled={f?.disabled}
                    keyboardType={f?.keyboardType || 'default'}
                    placeholder={f?.placeholder || 'default placeholder'}
                    secureTextEntry={f?.secureTextEntry}
                    isSecureTextInput={f?.secureTextEntry}
                    switchIcon={f?.switchIcon}
                    icon={{
                      name: f?.icon?.name || 'reorder-three',
                      size: f?.icon?.size || 24,
                      color: f?.icon?.color || theme.gray75,
                      type: f?.icon?.type || 'i'
                    }}
                    style={[
                      {
                        color: theme.gray,
                        flex: 1
                      }, inputStyle
                    ]}
                    containerStyle={containerInputStyle}
                    {...inputProps}
                  />
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors?.[f?.name]?.message) && (<ErrorLabel message={errors?.[f?.name]?.message} />)}
            </View>
          )
        }
        if (f?.type === 'picker') {
          return (
            <View key={JSON.stringify(f)}>
              <View style={{ flexDirection: 'row' }}>
                {f?.label
                  ? (
                    <Text style={[{
                      color: theme.purple,
                      marginLeft: 10,
                      marginRight: 5,
                      fontSize: fonts.normal,
                      fontWeight: 'bold'
                    }, f?.labelStyle]}
                    >{f?.label}
                    </Text>
                    )
                  : null}
                {f?.required
                  ? (
                    <Text style={[{
                      color: theme.red,
                      fontSize: fonts.subHeader,
                      fontWeight: 'bold'
                    }, f?.labelStyle]}
                    >*
                    </Text>
                    )
                  : null}
              </View>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <PickerTS
                    items={f?.picker?.data || []}
                    defaultValue={handleDefaultValuePicker(f?.picker?.data, f?.picker?.labelKey, f?.picker?.valueKey, f?.picker?.defaultValue, value)}
                    labelKey={f?.picker?.labelKey || ''}
                    valueKey={f?.picker?.valueKey || ''}
                    inputIcon={{
                      name: f?.icon?.name || '',
                      size: f?.icon?.size || 20,
                      type: f?.icon?.type || 'i',
                      color: f?.icon?.color || theme.gray50
                    }}
                    arrowIcon={{
                      name: f?.picker?.arrowIcon?.name || 'chevron-down-outline',
                      color: f?.picker?.arrowIcon?.color || theme.white,
                      size: f?.picker?.arrowIcon?.size || 20,
                      type: f?.picker?.arrowIcon?.type || 'i'
                    }}
                    withSearch={f?.picker?.withSearch}
                    searchlabel={f?.picker?.searchlabel}
                    labelStyle={f?.picker?.labelStyle}
                    style={f?.picker?.style}
                    onValueChange={(e) => {
                      handleChangePicker(f?.name, e, f?.picker?.valueKey)
                    }}
                  />
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors?.[f?.name]?.message) && (<ErrorLabel message={errors?.[f?.name]?.message} />)}
            </View>
          )
        }
        if (f?.type === 'dateTime') {
          return (
            <View key={JSON.stringify(f)}>
              <View style={{ flexDirection: 'row' }}>
                {f?.label
                  ? (
                    <Text style={[{
                      color: theme.purple,
                      marginLeft: 10,
                      marginRight: 5,
                      fontSize: fonts.normal,
                      fontWeight: 'bold'
                    }, f?.labelStyle]}
                    >{f?.label}
                    </Text>
                    )
                  : null}
                {f?.required
                  ? (
                    <Text style={[{
                      color: theme.red,
                      fontSize: fonts.subHeader,
                      fontWeight: 'bold'
                    }, f?.labelStyle]}
                    >*
                    </Text>
                    )
                  : null}
              </View>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TouchableOpacity onPress={() => setDate(f?.name || '')}>
                      <InputIcon
                        value={value}
                        onBlur={onBlur}
                        disabled
                        onChangeText={onChange}
                        keyboardType={f?.keyboardType || 'default'}
                        placeholder={f?.placeholder || 'default placeholder'}
                        secureTextEntry={f?.secureTextEntry}
                        isSecureTextInput={f?.secureTextEntry}
                        switchIcon={f?.switchIcon}
                        icon={{
                          name: f?.icon?.name || 'reorder-three',
                          size: f?.icon?.size || 24,
                          color: f?.icon?.color || theme.gray75,
                          type: f?.icon?.type || 'i'
                        }}
                        style={[
                          {
                            color: theme.gray
                          }, inputStyle
                        ]}
                        containerStyle={containerInputStyle}
                        {...inputProps}
                      />
                    </TouchableOpacity>
                    {date === f?.name
                      ? (
                        <DateTimePicker
                          testID={f?.name || 'dateTimeForm'}
                          value={moment().toDate()}
                          mode='date'
                          is24Hour
                          onChange={(e) => handleChangeDate(e, f?.name)}
                        />
                        )
                      : null}
                  </>
                )}
                rules={f?.rules}
                name={f?.name}
              />
              {(errors[f?.name]) && (<ErrorLabel message={errors?.[f?.name]?.message} />)}
            </View>
          )
        }
        if (f?.type === 'switch') {
          return (
            <View key={JSON.stringify(f)}>
              <Controller
                control={control}
                render={({ field: { value } }) => (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
                      <View style={{
                        flex: 0.8
                      }}
                      >
                        {f?.label
                          ? (
                            <Text style={[{
                              color: theme.gray,
                              marginLeft: 10,
                              marginRight: 5,
                              fontSize: fonts.normal,
                              fontWeight: 'bold'
                            }, f?.labelStyle]}
                            >{f?.label}
                            </Text>
                            )
                          : null}
                      </View>
                      <Switch
                        state={value?.length} onStateChange={(v) => {
                          if (v) {
                            setValue(f?.name, 'true')
                          } else {
                            setValue(f?.name, '')
                          }
                        }}
                      />
                    </View>
                    {value?.length
                      ? f?.switchForm?.map(sf => {
                        if (sf.type === 'inputText') {
                          return (
                            <View key={JSON.stringify(sf)}>
                              <View style={{ flexDirection: 'row' }}>
                                {sf?.label
                                  ? (
                                    <Text style={[{
                                      color: theme.purple,
                                      marginLeft: 10,
                                      marginRight: 5,
                                      fontSize: fonts.normal,
                                      fontWeight: 'bold'
                                    }, sf?.labelStyle]}
                                    >{sf?.label}
                                    </Text>
                                    )
                                  : null}
                                {sf?.required
                                  ? (
                                    <Text style={[{
                                      color: theme.red,
                                      fontSize: fonts.subHeader,
                                      fontWeight: 'bold'
                                    }, sf?.labelStyle]}
                                    >*
                                    </Text>
                                    )
                                  : null}
                              </View>

                              <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                  <InputIcon
                                    value={value}
                                    onBlur={() => {
                                      onBlur()
                                      sf?.onBlur && sf?.onBlur(getValues())
                                    }}
                                    onChangeText={onChange}
                                    disabled={sf?.disabled}
                                    keyboardType={sf?.keyboardType || 'default'}
                                    placeholder={sf?.placeholder || 'default placeholder'}
                                    secureTextEntry={sf?.secureTextEntry}
                                    isSecureTextInput={sf?.secureTextEntry}
                                    switchIcon={sf?.switchIcon}
                                    icon={{
                                      name: sf?.icon?.name || 'reorder-three',
                                      size: sf?.icon?.size || 24,
                                      color: sf?.icon?.color || theme.gray75,
                                      type: sf?.icon?.type || 'i'
                                    }}
                                    style={[
                                      {
                                        color: theme.gray,
                                        flex: 1
                                      }, inputStyle
                                    ]}
                                    containerStyle={containerInputStyle}
                                    {...inputProps}
                                  />
                                )}
                                rules={sf?.rules}
                                name={sf?.name}
                              />
                              {(errors?.[sf?.name]?.message) && (<ErrorLabel message={errors?.[sf?.name]?.message} />)}
                            </View>
                          )
                        }
                        if (sf?.type === 'picker') {
                          return (
                            <View key={JSON.stringify(sf)}>
                              <View style={{ flexDirection: 'row' }}>
                                {sf?.label
                                  ? (
                                    <Text style={[{
                                      color: theme.purple,
                                      marginLeft: 10,
                                      marginRight: 5,
                                      fontSize: fonts.normal,
                                      fontWeight: 'bold'
                                    }, sf?.labelStyle]}
                                    >{sf?.label}
                                    </Text>
                                    )
                                  : null}
                                {sf?.required
                                  ? (
                                    <Text style={[{
                                      color: theme.red,
                                      fontSize: fonts.subHeader,
                                      fontWeight: 'bold'
                                    }, f?.labelStyle]}
                                    >*
                                    </Text>
                                    )
                                  : null}
                              </View>
                              <Controller
                                control={control}
                                render={({ field: { value } }) => (
                                  <PickerTS
                                    items={sf?.picker?.data || []}
                                    defaultValue={handleDefaultValuePicker(sf?.picker?.data, sf?.picker?.labelKey, sf?.picker?.valueKey, sf?.picker?.defaultValue, value)}
                                    labelKey={sf?.picker?.labelKey || ''}
                                    valueKey={sf?.picker?.valueKey || ''}
                                    inputIcon={{
                                      name: sf?.icon?.name || '',
                                      size: sf?.icon?.size || 20,
                                      type: sf?.icon?.type || 'i',
                                      color: sf?.icon?.color || theme.gray50
                                    }}
                                    arrowIcon={{
                                      name: sf?.picker?.arrowIcon?.name || 'chevron-down-outline',
                                      color: sf?.picker?.arrowIcon?.color || theme.white,
                                      size: sf?.picker?.arrowIcon?.size || 20,
                                      type: sf?.picker?.arrowIcon?.type || 'i'
                                    }}
                                    withSearch={sf?.picker?.withSearch}
                                    searchlabel={sf?.picker?.searchlabel}
                                    labelStyle={sf?.picker?.labelStyle}
                                    style={sf?.picker?.style}
                                    onValueChange={(e) => {
                                      handleChangePicker(sf?.name, e, sf?.picker?.valueKey)
                                    }}
                                  />
                                )}
                                rules={sf?.rules}
                                name={sf?.name}
                              />
                              {(errors?.[sf?.name]?.message) && (<ErrorLabel message={errors?.[sf?.name]?.message} />)}
                            </View>
                          )
                        }
                        if (sf?.type === 'dateTime') {
                          return (
                            <View key={JSON.stringify(sf)}>
                              <View style={{ flexDirection: 'row' }}>
                                {sf?.label
                                  ? (
                                    <Text style={[{
                                      color: theme.purple,
                                      marginLeft: 10,
                                      marginRight: 5,
                                      fontSize: fonts.normal,
                                      fontWeight: 'bold'
                                    }, sf?.labelStyle]}
                                    >{sf?.label}
                                    </Text>
                                    )
                                  : null}
                                {sf?.required
                                  ? (
                                    <Text style={[{
                                      color: theme.red,
                                      fontSize: fonts.subHeader,
                                      fontWeight: 'bold'
                                    }, sf?.labelStyle]}
                                    >*
                                    </Text>
                                    )
                                  : null}
                              </View>
                              <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                  <>
                                    <TouchableOpacity onPress={() => setDate(sf?.name || '')}>
                                      <InputIcon
                                        value={value}
                                        onBlur={onBlur}
                                        disabled
                                        onChangeText={onChange}
                                        keyboardType={sf?.keyboardType || 'default'}
                                        placeholder={sf?.placeholder || 'default placeholder'}
                                        secureTextEntry={sf?.secureTextEntry}
                                        isSecureTextInput={sf?.secureTextEntry}
                                        switchIcon={sf?.switchIcon}
                                        icon={{
                                          name: sf?.icon?.name || 'reorder-three',
                                          size: sf?.icon?.size || 24,
                                          color: sf?.icon?.color || theme.gray75,
                                          type: sf?.icon?.type || 'i'
                                        }}
                                        style={[
                                          {
                                            color: theme.gray
                                          }, inputStyle
                                        ]}
                                        containerStyle={containerInputStyle}
                                        {...inputProps}
                                      />
                                    </TouchableOpacity>
                                    {date === sf?.name
                                      ? (
                                        <DateTimePicker
                                          testID={sf?.name || 'dateTimeForm'}
                                          value={moment().toDate()}
                                          mode='date'
                                          is24Hour
                                          onChange={(e) => handleChangeDate(e, sf?.name)}
                                        />
                                        )
                                      : null}
                                  </>
                                )}
                                rules={sf?.rules}
                                name={sf?.name}
                              />
                              {(errors[sf?.name]) && (<ErrorLabel message={errors?.[sf?.name]?.message} />)}
                            </View>
                          )
                        }
                        if (sf?.type === 'selectProduct') {
                          return (
                            <View key={JSON.stringify(f)}>
                              <Controller
                                control={control}
                                render={() => (
                                  <>
                                    <TouchableOpacity
                                      onPress={handlePresentModalPress}
                                      style={[styles.button, sf?.style]}
                                    >
                                      <Icon
                                        name={sf?.icon?.name || 'cart'}
                                        size={sf?.icon?.size || 20}
                                        color={sf?.icon?.color || theme.white}
                                        type={sf?.icon?.type || 'i'}
                                      />
                                      <Text style={[styles.buttonText, sf?.labelStyle]}>{sf?.label || 'Agregar Producto'}</Text>
                                    </TouchableOpacity>
                                    <BottomSheetModal
                                      ref={bottomSheetModalRef}
                                      index={2}
                                      snapPoints={snapPoints}
                                      backdropComponent={BottomSheetBackdrop}
                                    >
                                      <View style={{ flex: 1, padding: 10 }}>
                                        <View style={{ flex: 0.15 }}>
                                          <InputIcon
                                            value={search}
                                            onChangeText={setSearch}
                                            keyboardType='default'
                                            placeholder='Buscar Producto...'
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
                                        </View>
                                        <View style={{ flex: 1 }}>
                                          <BottomSheetFlatList
                                            renderItem={({ item }) => renderItem({ item, name: sf?.name })}
                                            data={handleProductList()}
                                            removeClippedSubviews
                                            initialNumToRender={7}
                                            maxToRenderPerBatch={2}
                                            onEndReachedThreshold={0.5}
                                            getItemLayout={getItemLayout}
                                            updateCellsBatchingPeriod={10}
                                            legacyImplementation
                                          />
                                        </View>
                                      </View>
                                    </BottomSheetModal>
                                  </>
                                )}
                                name={sf?.name}
                              />
                              {(errors?.[sf?.name]?.message) && (<ErrorLabel message={errors?.[sf?.name]?.message} />)}
                              <View style={{
                                height: 150
                              }}
                              >
                                <Text>Listado de Productos</Text>
                                <TouchableWithoutFeedback>
                                  <BottomSheetScrollView style={{ flex: 1 }}>
                                    {selectedProducts?.length
                                      ? selectedProducts?.map(item => {
                                        return (
                                          <View
                                            key={JSON.stringify(item)}
                                            style={{
                                              margin: 2,
                                              backgroundColor: theme.gray10,
                                              borderRadius: 13,
                                              paddingVertical: 10,
                                              paddingHorizontal: 5,
                                              flexDirection: 'row',
                                              justifyContent: 'space-between',
                                              alignItems: 'center'
                                            }}
                                          >
                                            <Text style={{ color: theme.gray }}>{item?.name} X {item?.quantity}</Text>
                                            <TouchableOpacity
                                              onPress={() => deleteProduct({ item, name: sf?.name })}
                                            >
                                              <Icon
                                                name='close-circle'
                                                color={theme.orange}
                                                size={20}
                                                type='i'
                                              />
                                            </TouchableOpacity>
                                          </View>
                                        )
                                      })
                                      : (
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                          <Icon
                                            name='cart'
                                            color={theme.gray50}
                                            size={30}
                                            type='i'
                                          />
                                          <Text style={{ color: theme.gray50 }}>No hay Productos Seleccionados</Text>
                                        </View>
                                        )}
                                  </BottomSheetScrollView>
                                </TouchableWithoutFeedback>
                              </View>
                            </View>
                          )
                        }
                        return null
                      })
                      : null}
                  </>
                )}
                name={f?.name}
              />
            </View>
          )
        }
        if (f?.type === 'selectProduct') {
          return (
            <View key={JSON.stringify(f)}>
              <Controller
                control={control}
                render={() => (
                  <>
                    <TouchableOpacity
                      onPress={handlePresentModalPress}
                      style={[styles.button, f?.style]}
                    >
                      <Icon
                        name={f?.icon?.name || 'cart'}
                        size={f?.icon?.size || 20}
                        color={f?.icon?.color || theme.white}
                        type={f?.icon?.type || 'i'}
                      />
                      <Text style={[styles.buttonText, f?.labelStyle]}>{f?.label || 'Agregar Producto'}</Text>
                    </TouchableOpacity>
                    <BottomSheetModal
                      ref={bottomSheetModalRef}
                      index={2}
                      snapPoints={snapPoints}
                      backdropComponent={BottomSheetBackdrop}
                    >
                      <View style={{ flex: 1, padding: 10 }}>
                        <View style={{ flex: 0.15 }}>
                          <InputIcon
                            value={search}
                            onChangeText={setSearch}
                            keyboardType='default'
                            placeholder='Buscar Producto...'
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
                        </View>
                        <View style={{ flex: 1 }}>
                          <BottomSheetFlatList
                            renderItem={({ item }) => renderItem({ item, name: f?.name })}
                            data={productos}
                            removeClippedSubviews
                            initialNumToRender={7}
                            maxToRenderPerBatch={2}
                            onEndReachedThreshold={0.5}
                            getItemLayout={getItemLayout}
                            updateCellsBatchingPeriod={10}
                            legacyImplementation
                          />
                        </View>
                      </View>
                    </BottomSheetModal>
                  </>
                )}
                name={f?.name}
              />
              {(errors?.[f?.name]?.message) && (<ErrorLabel message={errors?.[f?.name]?.message} />)}
            </View>
          )
        }
        return null
      })}
      <TouchableOpacity
        style={[styles.button, buttonStyles]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {!isSubmitting
          ? (
            <>
              <Icon
                name={buttonIcon?.name || ''}
                size={buttonIcon?.size || 20}
                color={buttonIcon?.color || theme.gray50}
                type={buttonIcon?.type || 'i'}
              />
              <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
            </>
            )
          : (
            <ActivityIndicator
              size='large'
              color={theme.gray}
            />
            )}
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13 / PixelRatio.getFontScale(),
    paddingVertical: 10 / PixelRatio.getFontScale(),
    paddingHorizontal: 15 / PixelRatio.getFontScale(),
    marginVertical: 10 / PixelRatio.getFontScale(),
    backgroundColor: theme.orange
  },
  buttonText: {
    textAlign: 'center',
    color: theme.gray,
    fontSize: fonts.subHeader,
    fontWeight: '600',
    marginLeft: 5 / PixelRatio.getFontScale()
  }
})
