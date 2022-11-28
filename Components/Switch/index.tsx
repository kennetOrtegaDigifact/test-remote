import React, { memo } from 'react'
import { Animated, PixelRatio, StyleSheet, TouchableHighlight } from 'react-native'
import { theme } from '../../Config/theme'
type props={
    onStateChange: (state: boolean) => void
    state: boolean
}
const SwitchC: React.FC<props> = ({
  onStateChange = (value) => {},
  state = false
}) => {
  return (
    <>
      <TouchableHighlight
        style={[
          styles.container,
          {
            backgroundColor: state ? theme.purple : theme.gray50,
            alignItems: state ? 'flex-end' : 'flex-start'
          }]}
        onPress={() => onStateChange(!state)}
      >
        <Animated.View style={[styles.bubble]} />
      </TouchableHighlight>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.purple,
    padding: 2 / PixelRatio.getFontScale(),
    width: 36 / PixelRatio.getFontScale(),
    height: 20 / PixelRatio.getFontScale(),
    borderRadius: 40 / PixelRatio.getFontScale(),
    justifyContent: 'center'
  },
  bubble: {
    height: 15 / PixelRatio.getFontScale(),
    width: 15 / PixelRatio.getFontScale(),
    backgroundColor: theme.white,
    borderRadius: 20 / PixelRatio.getFontScale()
  }
})

export const Switch = memo(SwitchC, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
