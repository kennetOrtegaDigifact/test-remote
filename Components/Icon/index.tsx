import React, { memo } from 'react'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntIcon from 'react-native-vector-icons/AntDesign'
import Ionicon from 'react-native-vector-icons/Ionicons'
import Visa from 'react-native-vector-icons/FontAwesome5'
import { PixelRatio } from 'react-native'
import { IconType } from '../../types'

const IconC: React.FC<IconType> = ({ name, size, color, type }) => {
  const material = MaterialIcon.hasIcon(name)
  const ant = AntIcon.hasIcon(name)
  const ionic = Ionicon.hasIcon(name)
  return (
    <>
      {material && type === 'm' ? <MaterialIcon name={name} size={size / PixelRatio.getFontScale()} color={color} /> : null}
      {ant && type === 'a' ? <AntIcon name={name} size={size / PixelRatio.getFontScale()} color={color} /> : null}
      {ionic && type === 'i' ? <Ionicon name={name} size={size / PixelRatio.getFontScale()} color={color} /> : null}
      {type === 'v' ? <Visa name='cc-visa' size={size / PixelRatio.getFontScale()} color={color} /> : null}
    </>
  )
}

export default memo(IconC, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
