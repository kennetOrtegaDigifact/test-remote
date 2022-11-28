import { NativeModules } from 'react-native'
type BluetoothResponse={
    address: string
    majorClass: number
    minorClass: number
    name: string
}
export const useNativeModule = () => {
  const { BluetoothService } = NativeModules
    interface BluetoothInterface {
        getDevices(): Promise<{
            code: number
            data?: BluetoothResponse[]
        }>
    }

    return {
      BluetoothService: BluetoothService as BluetoothInterface
    }
}
