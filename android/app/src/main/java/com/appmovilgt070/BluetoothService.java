package com.appmovilgt070;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.NativeArray;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.Set;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

@RequiresApi(api = Build.VERSION_CODES.M)
public class BluetoothService extends ReactContextBaseJavaModule {
    private Promise mPromise;
    private final static int REQUEST_ENABLE_BT = 2;
    ReactApplicationContext mContext = null;
    BluetoothManager bluetoothManager;
    BluetoothAdapter bluetoothAdapter;
    String manufacturer = Build.MANUFACTURER.toLowerCase();

    BluetoothService(ReactApplicationContext context) {
        super(context);
        mContext = context;
        context.addActivityEventListener(mActivityEventListener);
        bluetoothManager = context.getSystemService(BluetoothManager.class);
        bluetoothAdapter = bluetoothManager.getAdapter();
    }

    @NonNull
    @Override
    public String getName() {
        return "BluetoothService";
    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(
                final Activity activity,
                final int requestCode,
                final int resultCode,
                final Intent intent) {
            switch (requestCode) {
                case REQUEST_ENABLE_BT: {
                    if (resultCode == Activity.RESULT_OK && mPromise != null) {
                        if (bluetoothAdapter != null) {
                            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
                            WritableMap result = new WritableNativeMap();
                            WritableArray devicesList = new WritableNativeArray();
                            if (pairedDevices.size() > 0) {
                                // There are paired devices. Get the name and address of each paired device.

                                for (BluetoothDevice device : pairedDevices) {
                                    WritableMap devices = new WritableNativeMap();
                                    String deviceName = device.getName();
                                    BluetoothClass deviceClass = device.getBluetoothClass();

                                    Log.println(Log.ASSERT, "DISPOSITIVO: ", deviceName);
                                    Log.println(Log.ASSERT, "minorClass: ",
                                            Integer.toString(deviceClass.getDeviceClass()));
                                    Log.println(Log.ASSERT, "majorDevice: ",
                                            Integer.toString(deviceClass.getMajorDeviceClass()));

                                    String deviceHardwareAddress = device.getAddress(); // MAC address
                                    int type = device.getType();
                                    if (((deviceClass.getDeviceClass() == 1536 || deviceClass.getDeviceClass() == 1664)
                                            &&
                                            (deviceClass.getMajorDeviceClass() == 1536
                                                    || deviceClass.getMajorDeviceClass() == 1664))
                                            ||
                                            (manufacturer.equalsIgnoreCase("sunmi")
                                                    && deviceName.equalsIgnoreCase("innerprinter"))) {
                                        devices.putString("name", deviceName);
                                        devices.putString("address", deviceHardwareAddress);
                                        devices.putInt("minorClass", deviceClass.getDeviceClass());
                                        devices.putInt("majorClass", deviceClass.getMajorDeviceClass());
                                        devicesList.pushMap(devices);
                                    }
                                }
                                result.putInt("code", 1);
                                result.putArray("data", devicesList);
                            } else {
                                result.putInt("code", 9005);
                            }
                            mPromise.resolve(result);
                        } else {
                            mPromise.reject("Native Bluetooth Service getDevices error", "Bluetooth failure intent");
                            mPromise = null;
                        }
                    } else {
                        if (mPromise != null) {
                            mPromise.reject("Native Bluetooth Service getDevices error",
                                    "User denied bluetooth or failure intent");
                            mPromise = null;
                        }
                    }
                    break;
                }
                default:
                    break;
            }
        }
    };

    @ReactMethod
    public void getDevices(final Promise promise) {
        Log.println(Log.ASSERT, "MANUFACTURER: ", manufacturer);
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }
        // Store the promise to resolve/reject when returns data
        mPromise = promise;
        try {
            if (bluetoothAdapter == null) {
                // Device doesn't support Bluetooth
                throw new Exception("Device doesn't support Bluetooth");
            } else {
                if (!bluetoothAdapter.isEnabled()) {
                    Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                    currentActivity.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
                    return;
                }
                Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
                WritableMap result = new WritableNativeMap();
                WritableArray devicesList = new WritableNativeArray();
                if (pairedDevices.size() > 0) {
                    // There are paired devices. Get the name and address of each paired device.

                    for (BluetoothDevice device : pairedDevices) {
                        WritableMap devices = new WritableNativeMap();
                        String deviceName = device.getName();
                        BluetoothClass deviceClass = device.getBluetoothClass();
                        Log.println(Log.ASSERT, "DISPOSITIVO: ", deviceName);
                        Log.println(Log.ASSERT, "minorClass: ", Integer.toString(deviceClass.getDeviceClass()));
                        Log.println(Log.ASSERT, "majorDevice: ", Integer.toString(deviceClass.getMajorDeviceClass()));
                        // Log.println(Log.ASSERT, "UUID: ", Arrays.toString(device.getUuids()));
                        // Log.println(Log.ASSERT, "PRINTER?: ", deviceClass.toString()); //0x40680 =
                        // PRINTER || InnerPrinterName
                        String deviceHardwareAddress = device.getAddress(); // MAC address
                        int type = device.getType();
                        if (((deviceClass.getDeviceClass() == 1536 || deviceClass.getDeviceClass() == 1664) &&
                                (deviceClass.getMajorDeviceClass() == 1536
                                        || deviceClass.getMajorDeviceClass() == 1664))
                                ||
                                (manufacturer.equalsIgnoreCase("sunmi")
                                        && deviceName.equalsIgnoreCase("innerprinter"))) {
                            devices.putString("name", deviceName);
                            devices.putString("address", deviceHardwareAddress);
                            devices.putInt("minorClass", deviceClass.getDeviceClass());
                            devices.putInt("majorClass", deviceClass.getMajorDeviceClass());
                            devicesList.pushMap(devices);
                        }
                    }
                    result.putInt("code", 1);
                    result.putArray("data", devicesList);
                } else {
                    result.putInt("code", 9005);
                }
                mPromise.resolve(result);
            }
        } catch (Exception e) {
            mPromise.reject("Native Bluetooth Service getDevices error", e);
            mPromise = null;
        }
    }
}
