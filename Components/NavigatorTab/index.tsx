import React, { memo } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Link, To, useLocation } from 'react-router-native'
import { palette7, theme } from '../../Config/theme'
import { useSelector } from 'react-redux'

import Icon from '../Icon'
import { ReduxState } from '../../Redux/store'
type tabProps={
    to: To,
    icon: {
        name: string,
        size: number,
        type: string,
        color: string
    },
    pathname: string,
    label: string
}
const Tab: React.FC<tabProps> = React.memo(function Tab ({ to, icon, pathname, label }) {
  const active = pathname === to
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
          padding: 5
        }}
      >
        <View style={{
          borderRadius: 5,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        >
          <Icon {...icon} />
          {!active && (
            <Text
              style={{
                color: theme.gray25
              }}
            >{label}
            </Text>
          )}
        </View>
      </Link>
    </>
  )
}, (prev: object, next: object) => prev === next)

const NavigatorTabC: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.userDB)
  const { pathname } = useLocation()
  return (
    <>
      <View style={{ backgroundColor: palette7.cream }}>
        <View style={[styles.container]}>
          <Tab
            pathname={pathname}
            icon={{
              name: 'home',
              type: 'i',
              color: theme.gray25,
              size: 20
            }}
            to={`/${user.country}/Dashboard`}
            label='Inicio'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'search',
              type: 'i',
              color: theme.gray25,
              size: 20
            }}
            to={`/${user.country}/Consultas`}
            label='Consultas'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'add-circle',
              type: 'i',
              color: theme.gray25,
              size: 20
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
              size: 20
            }}
            to={`/${user.country}/Productos`}
            label='Productos'
          />
          <Tab
            pathname={pathname}
            icon={{
              name: 'people',
              type: 'i',
              color: theme.gray25,
              size: 20
            }}
            to={`/${user.country}/Clientes`}
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
    justifyContent: 'space-between'
  }
})

export default memo(NavigatorTabC)
