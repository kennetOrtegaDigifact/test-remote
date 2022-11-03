import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, PixelRatio } from 'react-native'
import Icon from '../../Components/Icon'
import { appCodes } from '../../Config/appCodes'
import { fonts, theme } from '../../Config/theme'
import { numberFormater } from '../../Config/utilities'
import { getInfoByNITService } from '../../Services/apiService'
type props={
    clients?: [{nit: string|number, total:number}] | any[]
}
/* An object that has a key of type number and a value of type string. */
const topColors: { [key: number]: string } = {
  1: theme.purple,
  2: theme.purple75,
  3: theme.orange,
  4: theme.orange75,
  5: theme.gray75
}
/* A React component that receives an array of objects as a prop and returns a list of the top 5
clients. */
export const ClientTop: React.FC<props> = ({ clients }) => {
  const [top, setTop] = useState<{nit?: number|string, total?: number, nombre?: string}[]>([{ nit: -1, total: 0, nombre: '' }])
  useEffect(() => {
    if (clients?.length && clients.some(e => e.nit !== -1)) {
      const promises: Promise<{nit?: number|string, total?: number, nombre?: string}>[] = []
      /* Creating an array of promises. */
      clients.forEach(e => {
        promises.push(getInfoByNITService({ nit: String(e.nit || '') })
          .then(res => {
            /* Checking if the response has a code property and if it is equal to appCodes.ok, then it
           is returning an object with the properties nit, total and nombre. If it is not equal to
           appCodes.ok, then it is returning an object with the properties nit, total and nombre, but empty. */
            if (res?.code === appCodes.ok) {
              const { data: { nombre, taxid } } = res
              return {
                nit: taxid,
                total: e.total,
                nombre
              }
            } else {
              return {
                nit: -1,
                total: 0,
                nombre: ''
              }
            }
          })
          .catch((e: Error) => {
            console.log('GET CLIENTS TOP ', e.message)
            return {
              nit: -1,
              total: 0,
              nombre: ''
            }
          }))
      })
      /* Waiting for all the promises to be resolved and then it is setting the state. */
      Promise.all(promises).then((res) => {
        setTop(res)
      })
    }
  }, [clients])
  return (
    <>
      {(top?.length && top?.some(e => Number(e.total || 0) > 0))
        ? top.map((e, i) => (
          <View
            key={e.nit}
            style={[styles.clientItem, { backgroundColor: topColors[i + 1] }]}
          >
            <Text
              style={{
                fontSize: fonts.small,
                fontWeight: '700',
                margin: 7 / PixelRatio.getFontScale(),
                color: theme.white,
                flex: 1
              }}
            >#{i + 1} {e.nombre}
            </Text>
            <Text
              style={{
                fontSize: fonts.normal,
                fontWeight: '700',
                margin: 7 / PixelRatio.getFontScale(),
                color: theme.white,
                flex: 1,
                textAlign: 'right'
              }}
            >Q{numberFormater({ number: Number(e.total || 0), toFixed: true })}
            </Text>
          </View>
        ))
        : (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Icon
              name='person'
              size={60}
              color={theme.gray75}
              type='i'
            />
            <Text style={{ color: theme.gray75, fontSize: fonts.small }}>Sin Clientes</Text>
          </View>
          )}
    </>
  )
}

const styles = StyleSheet.create({
  clientItem: {
    borderRadius: 7,
    padding: 5,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})
