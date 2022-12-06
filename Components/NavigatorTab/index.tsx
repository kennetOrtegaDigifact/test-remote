import React, { memo, useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Link, To, useLocation } from 'react-router-native'
import { fonts, palette7, theme } from '../../Config/theme'
import { useSelector } from 'react-redux'
import Icon from '../Icon'
import { ReduxState } from '../../Redux/store'
import { IconType } from '../../types'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
type tabProps={
    to: To,
    icon: IconType,
    pathname: string,
    label: string
}
const Tab: React.FC<tabProps> = React.memo(function Tab ({ to, icon, pathname, label }) {
  const offset = useSharedValue(0)
  const active = pathname === to
  useEffect(() => {
    active ? offset.value = -20 : offset.value = 25
  }, [active])
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(offset.value, {
            damping: 9,
            stiffness: 115
          })
        }
      ]
    }
  })
  return (
    <>
      <Link
        to={to}
        underlayColor={palette7.cream}
        style={{
          borderRadius: 5,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 35,
          maxHeight: 35,
          overflow: 'hidden',
          flex: 1
        }}
      >
        <Animated.View style={[{
          borderRadius: 5,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          height: 95
        }, animatedStyles]}
        >
          <Icon
            name={icon.name}
            color={icon.color}
            size={icon.size}
            type={icon.type}
          />
          <Text
            style={{
              color: active ? theme.purple : theme.gray25,
              fontWeight: active ? '800' : '400',
              fontSize: active ? fonts.normal : fonts.small
            }}
          >{label}
          </Text>
          <Icon name='circle' size={6} color={active ? theme.purple : theme.gray50} type='m' />
        </Animated.View>
      </Link>
    </>
  )
}, (prev: object, next: object) => JSON.stringify(prev) === JSON.stringify(next))

const NavigatorTabC: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.userDB)
  const { pathname } = useLocation()
  return (
    <>
      <View style={{
        backgroundColor: palette7.cream

      }}
      >
        <View style={[styles.container]}>
          <Tab
            pathname={pathname}
            icon={{
              name: 'home',
              type: 'i',
              color: theme.gray25,
              size: 22
            }}
            to='/-/Dashboard'
            label='Inicio'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'search',
              type: 'i',
              color: theme.gray25,
              size: 22
            }}
            to='/-/Consultas'
            label='Consultas'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'add-circle',
              type: 'i',
              color: theme.gray25,
              size: 22
            }}
            to={`/${user.country}/DTE`}
            label='Facturar'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'cart',
              type: 'i',
              color: theme.gray25,
              size: 22
            }}
            to='/-/Productos'
            label='Productos'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'people',
              type: 'i',
              color: theme.gray25,
              size: 22
            }}
            to='/-/Clientes'
            label='Clientes'
          />
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: theme.white,
    flexDirection: 'row',
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: -10
    },
    shadowColor: theme.gray,
    elevation: 5
  }
})

export default memo(NavigatorTabC)
