import { useCallback } from 'react'
import { useToast } from 'react-native-toast-notifications'
import { useNativeModule } from './useNativeModule'
import { checkMultiple, PERMISSIONS, requestMultiple } from 'react-native-permissions'
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer'
import { appCodes } from '../Config/appCodes'
// const tests = [{ address: '86:67:7A:FA:74:EE', majorClass: 1536, minorClass: 1664, name: 'MTP-TEST2' }, { address: '86:67:7A:FA:74:EA', majorClass: 1536, minorClass: 1664, name: 'MTP-II_74EA' }, { address: '86:67:7A:FA:74:9E', majorClass: 1536, minorClass: 1664, name: 'MTP-TEST' }]
export const useBluetoothService = () => {
  const { BluetoothService } = useNativeModule()
  const toast = useToast()
  const connectToPrint = useCallback(async (): Promise<{code: number}|undefined> => {
    const t = toast.show('Buscando Impresoras Disponibles', {
      type: 'loading',
      data: {
        theme: 'dark'
      },
      duration: 60000
    })
    /* Checking if the bluetooth permission is granted, if not request permission */
    return checkMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN
    ]).then(async (res: any) => {
      console.log('RESULT BLUETOOTH BLUETOOTH_CONNECT', res[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT])
      console.log('RESULT BLUETOOTH BLUETOOTH_ADVERTISE', res[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE])
      console.log('RESULT BLUETOOTH BLUETOOTH_SCAN', res[PERMISSIONS.ANDROID.BLUETOOTH_SCAN])
      /* Requesting the permissions. */
      return requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN
      ])
        .then(async (res: any) => {
          console.log('RESPONSE BLUETOOTH BLUETOOTH_CONNECT', res[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT])
          console.log('RESPONSE BLUETOOTH BLUETOOTH_ADVERTISE', res[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE])
          console.log('RESPONSE BLUETOOTH BLUETOOTH_SCAN', res[PERMISSIONS.ANDROID.BLUETOOTH_SCAN])
          return BluetoothService.getDevices()
            .then(async res => {
              console.log('RESPUESTA BLUETOOTH SERVICE', res)
              if (res?.code === appCodes.ok) {
                if (res?.data) {
                  if (res?.data?.length > 0) {
                    let flag = false
                    for (const device of res?.data) {
                      console.log('INTENTANDO CONECTAR CON', device)
                      try {
                        await BluetoothManager.connect(device.address)
                          .then(async () => {
                            setTimeout(() => {
                              toast.update(t, `Conexion exitosa con ${device.name || 'la impresora'}`, {
                                type: 'ok',
                                duration: 5000
                              })
                            }, 500)
                            console.log('EXITO CONECTANDO CON', device)
                            flag = true
                          })
                          .catch((err: Error) => {
                            console.log('ERROR CATCH BLUETOOTH SERVICE', err)
                          })
                      } catch (err) {
                        console.log('EXCEPTION BLUETOOTH SERVICE', err)
                        setTimeout(() => {
                          toast.update(t, 'Ocurrio un error tratando de conectar con alguna impresora', {
                            type: 'error',
                            duration: 5000
                          })
                        }, 500)
                      }
                      if (flag) {
                        console.log('Saliendo del for')
                        return {
                          code: appCodes.ok
                        }
                      } else {
                        setTimeout(() => {
                          toast.update(t, `Conectando con ${device.name || 'la impresora'}`)
                        }, 500)
                      }
                    }
                    setTimeout(() => {
                      toast.update(t, 'No fue posible conectar con ninguna impresora', {
                        type: 'error',
                        duration: 5000
                      })
                    }, 500)
                    return {
                      code: appCodes.processError
                    }
                  }
                }
              }
            })
            .catch(err => {
              console.log('ERROR BLUETOOTH SERVICE', err)
              return {
                code: appCodes.processError
              }
            })
        })
        .catch((err: Error) => {
          console.log('requestMultiple SERVICE', err)
          return {
            code: appCodes.processError
          }
        })
    })
      .catch((err: Error) => {
        console.log('CHECK Multiple SERVICE', err)
        return {
          code: appCodes.processError
        }
      })
  }, [])
  return {
    connectToPrint
  }
}
