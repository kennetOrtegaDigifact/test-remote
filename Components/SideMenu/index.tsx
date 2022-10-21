import React, { memo, useRef } from 'react'
import { Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withTiming, Easing } from 'react-native-reanimated'
import { PanGestureHandler, ScrollView, Swipeable } from 'react-native-gesture-handler'
import MenuItem from '../MenuItem'
import { fonts, theme } from '../../Config/theme'
import deviceInfoModule from 'react-native-device-info'

const SideMenuC: React.FC = () => {
  const scrollRef = useRef(null)
  const panRef = useRef(null)
  const widthUI = useSharedValue(20)
  const pressed = useSharedValue(false)
  const active = useSharedValue('#fff')
  const endingPosition = Dimensions.get('window').width
  const eventHandler = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      pressed.value = true
      ctx.startX = widthUI.value
      active.value = '#2E317E'
    },
    onActive: (event, ctx) => {
      widthUI.value = ctx.startX + event.translationX
    },
    onEnd: (event, ctx) => {
      pressed.value = false
      console.log('END ANIMATION', event)
      if (event.translationX > 50) {
        widthUI.value = endingPosition
      } else {
        active.value = '#fff'
        widthUI.value = 20
      }
    }
  }, [])

  const styleA = useAnimatedStyle(() => {
    return {
      width: withTiming(widthUI.value, {
        duration: 250,
        easing: Easing.bezier(0.47, 0, 0.745, 0.715)
      })
    }
  })

  const backgroundColorA = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(active.value, {
        duration: 250,
        easing: Easing.linear
      })
    }
  })

  return (
    <>
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={scrollRef}
        onGestureEvent={eventHandler}
      >
        <Animated.View style={[styles.box, styleA]} pointerEvents='box-only'>
          <Animated.View style={[styles.menuItems, backgroundColorA]}>
            <ScrollView
              ref={scrollRef}
              simultaneousHandlers={scrollRef}
              indicatorStyle='white'
              style={{
                flex: 1,
                maxHeight: Dimensions.get('window').height - (Dimensions.get('window').height * 0.42),
                marginBottom: 10
              }}
              contentContainerStyle={{
                flexGrow: 1
              }}
            >
              <View>
                <MenuItem
                  title='Perfil'
                  icon={{
                    name: 'person',
                    color: theme.white,
                    size: 24,
                    type: 'i'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Contingencia'
                  icon={{
                    name: 'archive-clock-outline',
                    color: theme.white,
                    size: 24,
                    type: 'm'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Reportes'
                  icon={{
                    name: 'barschart',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Usuarios'
                  icon={{
                    name: 'user',
                    color: theme.white,
                    size: 24,
                    type: 'a'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
                <MenuItem
                  title='Configuracion'
                  icon={{
                    name: 'options',
                    color: theme.white,
                    size: 24,
                    type: 'i'
                  }}
                  titleStyles={{
                    color: theme.white,
                    fontSize: fonts.normal
                  }}
                />
              </View>
            </ScrollView>
            <View>
              <MenuItem
                backgroundColor={theme.orange}
                title='Cerrar Sesión'
                icon={{
                  name: 'log-out-outline',
                  color: theme.white,
                  size: 24,
                  type: 'i'
                }}
                titleStyles={{
                  color: theme.white,
                  fontSize: fonts.normal,
                  fontWeight: '600'
                }}
              />
              <Text style={{
                color: theme.white,
                textAlign: 'left',
                marginHorizontal: 10 / PixelRatio.getFontScale(),
                fontSize: fonts.small
              }}
              >Version {deviceInfoModule.getVersion()}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </>
  )
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 2,
    height: '100%',
    width: 20,
    overflow: 'hidden'
  },
  menuItems: {
    flex: 1,
    justifyContent: 'space-between',
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    marginRight: 50 / PixelRatio.getFontScale(),
    padding: 10
  }
})

export default memo(SideMenuC, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
