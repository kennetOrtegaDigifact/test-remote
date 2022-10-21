import React, { memo } from 'react'
import { Dimensions, PixelRatio, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring, withTiming, Easing } from 'react-native-reanimated'
import { PanGestureHandler } from 'react-native-gesture-handler'

const SideMenuC: React.FC = () => {
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
  })

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
      <PanGestureHandler onGestureEvent={eventHandler}>
        <Animated.View style={[styles.box, styleA]} pointerEvents='box-only'>
          <Animated.View style={[{
            flex: 1,
            borderRadius: 13,
            marginRight: 50 / PixelRatio.getFontScale()
          }, backgroundColorA]}
          />
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
    width: 20
  }
})

export default memo(SideMenuC, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
