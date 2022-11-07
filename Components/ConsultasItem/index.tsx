import React from 'react'
import { Text, View } from 'react-native'

export const ConsultasItem: React.FC<{item: any}> = React.memo(function ConsultasItem ({ item }) {
//   console.log(item)
  return (
    <>
      <View style={{
        height: 100,
        backgroundColor: 'white',
        marginVertical: 5,
        borderRadius: 13
      }}
      >
        <Text>tem</Text>
      </View>
    </>
  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
