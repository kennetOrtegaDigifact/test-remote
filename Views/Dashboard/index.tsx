import React from 'react'
import { View, Text, PixelRatio } from 'react-native'
import { VictoryBar, VictoryChart, VictoryTheme, VictoryArea, VictoryZoomContainer, VictoryAxis } from 'victory-native'
import { fonts, theme } from '../../Config/theme'

export const Dashboard: React.FC = () => {
  return (
    <>
      <View style={{
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.white,
        marginBottom: 10
      }}
      >
        <VictoryChart
          width={325}
          theme={VictoryTheme.material}
        >
          <Text
            style={{
              fontSize: fonts.header,
              fontWeight: '700',
              margin: 7 / PixelRatio.getFontScale()
            }}
          >Ingresos Semanales
          </Text>
          <VictoryBar
            animate
            data={[10, 20, 30, 40, 30]}
            barRatio={0.8}
            alignment='start'
            style={{
              data: {
                fill: theme.purple50
              }
            }}
          />
        </VictoryChart>
      </View>
      <View style={{
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.white
      }}
      >
        <Text
          style={{
            fontSize: fonts.header,
            fontWeight: '700',
            margin: 7 / PixelRatio.getFontScale()
          }}
        >Ingresos Anuales
        </Text>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{ y: 10 }}
          containerComponent={
            <VictoryZoomContainer />
          }
        >

          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#756f6a' },
              axisLabel: { fontSize: fonts.verySmall, padding: 10 },
              grid: { stroke: () => theme.gray50 },
              ticks: { stroke: 'grey', size: 1 },
              tickLabels: { fontSize: fonts.verySmall, padding: 5 }
            }}
            tickFormat={(t) => `${Math.round(t)}k`}
          />
          <VictoryArea
            style={{
              data: { fill: theme.orange75 },
              labels: {
                fontSize: fonts.verySmall
              }
            }}
            data={[1000, 10, 920, 830]}
            interpolation='natural'
            padding={0}
            animate
          />
          <VictoryArea
            style={{
              data: { fill: theme.gray25 }
            }}
            data={[6000, 1120, 920, 1030]}
            interpolation='natural'
            padding={0}
            animate
          />
          <VictoryArea
            style={{
              data: { fill: theme.purple50 }
            }}
            data={[3000, 2220, 1920, 1030]}
            interpolation='natural'
            padding={0}
            animate
          />
        </VictoryChart>

      </View>
    </>

  )
}
