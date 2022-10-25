import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image, PixelRatio } from 'react-native'
import { InputIcon } from '../../Components/InputIcon'
import { fonts, theme } from '../../Config/theme'
export const Login: React.FC = () => {
  return (
    <View style={[styles.container]}>
      <ScrollView
        centerContent
        automaticallyAdjustKeyboardInsets
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flex: 1,
          padding: 10
        }}
      >
        <View
          style={{
            alignItems: 'center',
            margin: 5
          }}
        >
          <Image
            source={require('../../Public/img/Logo1.png')}
            style={{
              width: 120 / PixelRatio.getFontScale(),
              height: 100 / PixelRatio.getFontScale(),
              margin: 5
            }}
          />
          <Text
            style={{
              fontSize: fonts.small,
              textAlign: 'center',
              flexWrap: 'wrap',
              color: theme.white,
              paddingHorizontal: 10
            }}
          >Ya eres cliente de Digifact, ingresa con tu Identificador Tributario, usuario y contraseña. Si no recuerdas tu contraseña haz click en recuperar contraseña
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.purple,
    padding: 10
  }
})
