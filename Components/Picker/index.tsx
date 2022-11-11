import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, TextStyle, TouchableHighlight, TouchableHighlightProps, View, ViewStyle, TouchableOpacity } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { IconType } from '../../types'
import { InputIcon } from '../InputIcon'
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import Icon from '../Icon'
interface itemProps extends TouchableHighlightProps {
  item: string,
  selected?: string
}
const Item: React.FC<itemProps> = React.memo(function Item ({ item, selected = '', ...buttonProps }) {
  return (
    <TouchableHighlight
      underlayColor={theme.gray10}
      style={{
        marginVertical: 2,
        paddingVertical: 8,
        paddingHorizontal: 5,
        backgroundColor: theme.white,
        borderRadius: 5,
        minHeight: 40,
        justifyContent: 'center',
        borderTopColor: theme.gray10,
        borderTopWidth: 1
      }}
      {...buttonProps}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      >
        <Text
          style={{
            fontSize: fonts.subHeader,
            color: theme.gray,
            marginHorizontal: 4,
            flex: 0.9
          }}
        >
          {item}
        </Text>
        <Icon
          name={item === selected ? 'record-circle' : 'checkbox-blank-circle-outline'}
          type='m'
          size={20}
          color={item === selected ? theme.purple : theme.gray50}
        />
      </View>
    </TouchableHighlight>
  )
})

const EmptyList: React.FC = React.memo(function EmptyList () {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Icon name='text-search' type='m' size={40} color={theme.gray50} />
      <Text style={{ textAlign: 'center', fontSize: fonts.verySmall }}>Parece que no hay elementos en la lista</Text>
    </View>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))

type pickerProps={
    items: string[] | any[],
    style?: ViewStyle,
    labelStyle?: TextStyle,
    arrowIcon?: IconType,
    inputIcon?: IconType,
    labelKey?: string,
    valueKey?: string,
    defaultValue?: string,
    dropDownMaxHeight?: number,
    minHeight?: number,
    searchlabel?: string,
    withSearch?: boolean,
    validateFunction?: () => boolean,
    onValueChange?: (value: any) => void,
}

export const Picker: React.FC<pickerProps> = React.memo(function Picke ({
  items = [],
  style,
  labelStyle,
  arrowIcon,
  inputIcon,
  labelKey,
  valueKey,
  defaultValue = '',
  searchlabel = 'Buscar...',
  withSearch = false,
  validateFunction = () => true,
  onValueChange = () => {}
}) {
  const [search, setSearch] = useState<string>('')
  const [select, setSelect] = useState<any>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['25%', '50%', '70%', '90%'], [])
  const renderItem = ({ item }: any) => (
    <Item
      item={item?.[labelKey || '']?.toString() ||
                    item?.[valueKey || '']?.toString() ||
        item || defaultValue}
      selected={select?.[labelKey || '']?.toString() ||
                    select?.[valueKey || '']?.toString() ||
        select || defaultValue}
      onPress={() => {
        bottomSheetModalRef.current?.close()
        if (validateFunction()) {
          setSelect(item)
        }
      }}
    />
  )

  useEffect(() => {
    if (select) {
      console.log(select)
      onValueChange(select)
    }
  }, [select])

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => bottomSheetModalRef.current?.present()}
      >
        <View
          style={styles.containerIconAndSelect}
        >
          <Icon
            name={inputIcon?.name || ''}
            size={inputIcon?.size || 20}
            type={inputIcon?.type || 'i'}
            color={inputIcon?.color || theme.purple}
          />
          <Text
            style={[
              styles.label,
              labelStyle
            ]}
          >{select?.[labelKey || '']?.toString() || select || defaultValue}
          </Text>
          <Icon
            name={arrowIcon?.name || 'chevron-down-outline'}
            type={arrowIcon?.type || 'i'}
            size={arrowIcon?.size || 20}
            color={arrowIcon?.color || theme.white}
          />
        </View>
      </TouchableOpacity>
      {/* <BottomSheetModalProvider> */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={{
          backgroundColor: theme.white
        }}
      >
        <View style={{
          padding: 10,
          flex: 1
        }}
        >
          <Text style={{
            fontSize: fonts.header,
            color: theme.gray,
            textAlign: 'center',
            marginTop: 2,
            marginBottom: 5,
            fontWeight: '700'
          }}
          >Seleccionar
          </Text>
          {withSearch && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <InputIcon
                value={search}
                onChangeText={setSearch}
                keyboardType='default'
                placeholder={searchlabel}
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
            </View>
          )}

          {/* <FlashList
            data={items?.filter(e => {
              if (typeof e === 'string' || typeof e === 'number') {
                return e.toString().toLowerCase().includes(search.toLowerCase())
              }
              if (typeof e === 'object') {
                return e?.[labelKey || '']?.toString().toLowerCase().includes(search.toLowerCase()) || e?.[valueKey || '']?.toString()?.toLowerCase()?.includes(search.toLowerCase())
              }
              return false
            }) || []}
            renderItem={renderItem}
            estimatedItemSize={43}
            ListEmptyComponent={() => <EmptyList />}
            extraData={items}
          /> */}
          <BottomSheetFlatList
            data={items?.filter(e => {
              if (typeof e === 'string' || typeof e === 'number') {
                return e.toString().toLowerCase().includes(search.toLowerCase())
              }
              if (typeof e === 'object') {
                return e?.[labelKey || '']?.toString().toLowerCase().includes(search.toLowerCase()) || e?.[valueKey || '']?.toString()?.toLowerCase()?.includes(search.toLowerCase())
              }
              return false
            }) || []}
            renderItem={renderItem}
            contentContainerStyle={{
              backgroundColor: theme.white
            }}
            ListEmptyComponent={() => <EmptyList />}
          />
        </View>
      </BottomSheetModal>

      {/* </BottomSheetModalProvider> */}
      {/* <Modal
        animationType='fade'
        onRequestClose={() => setVisible(false)}
        visible={visible}
        transparent
      >
        <TouchableOpacity
          onPressOut={() => setVisible(false)}
          activeOpacity={1}
          style={{
            flex: 1,
            justifyContent: 'center'
          }}
        >
          <TouchableWithoutFeedback>

            <View
              style={[styles.modalView]}
            >
              {withSearch && (
                <InputIcon
                  icon={{
                    name: 'search',
                    color: theme.gray,
                    size: 20,
                    type: 'i'
                  }}
                  style={{
                    flex: 1,
                    color: theme.gray
                  }}
                  containerStyle={{
                    borderColor: theme.graygreen
                  }}
                  placeholder={searchlabel}
                  onChangeText={setSearch}
                />
              )}
              <FlashList
                data={items?.filter(e => {
                  if (typeof e === 'string' || typeof e === 'number') {
                    return e.toString().toLowerCase().includes(search.toLowerCase())
                  }
                  if (typeof e === 'object') {
                    return e?.[labelKey || '']?.toString().toLowerCase().includes(search.toLowerCase()) || e?.[valueKey || '']?.toString()?.toLowerCase()?.includes(search.toLowerCase())
                  }
                  return false
                }) || []}
                renderItem={renderItem}
                estimatedItemSize={35}
                ListEmptyComponent={() => <EmptyList />}
                extraData={items}
              />
            </View>

          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal> */}
    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: theme.purple75,
    borderRadius: 13
  },
  label: {
    flex: 1,
    color: theme.gray,
    fontSize: fonts.normal,
    fontWeight: '500',
    textAlign: 'left',
    marginHorizontal: 10
  },
  containerIconAndSelect: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5
  },
  modalView: {
    justifyContent: 'center',
    margin: 20,
    backgroundColor: theme.white,
    borderRadius: 13,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 0.45
  },
  containerModal: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    padding: 10
  }
})
