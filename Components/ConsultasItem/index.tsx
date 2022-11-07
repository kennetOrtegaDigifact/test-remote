import React from 'react'

export const ConsultasItem: React.FC = React.memo(function ConsultasItem () {
  return (
    <></>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
