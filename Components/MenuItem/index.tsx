
import React, { memo } from 'react'
import { Icon } from '../../types'
type menuItemProps = {
    title: string,
    icon: Icon,
    onPress: Function,
    withCounter: boolean,
    counter: number,
    backgroundColor: string,
    titleStyles: React.CSSProperties,
    activeIconColor: string,
    inactiveIconColor: string
}

const MenuItemC: React.FC<menuItemProps> = ({ title = '', icon = { color: '', type: '', name: '', size: 24 } }) => {
  return (
    <></>
  )
}

export default memo(MenuItemC, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
