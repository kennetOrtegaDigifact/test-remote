import React, { useEffect, useState } from 'react'
import { View, Text, PixelRatio, Dimensions, ScrollView } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import { useSelector } from 'react-redux'
import { VictoryBar, VictoryChart, VictoryTheme, VictoryArea, VictoryZoomContainer, VictoryAxis } from 'victory-native'
import Icon from '../../Components/Icon'
import { appCodes } from '../../Config/appCodes'
import { fonts, theme } from '../../Config/theme'
import { ReduxState } from '../../Redux/store'
import { getDashboardService } from '../../Services/apiService'
import { DashboardType } from '../../types'
import { ClientTop } from './ClientTop'
import { numberFormater } from '../../Config/utilities'
import { months } from '../../Config/dictionary'
/* A React component that is using the VictoryChart library to render a dashboard. */
export const Dashboard: React.FC = React.memo(function Dashboard () {
  const toast = useToast()
  const [dimensions, setDimensions] = useState(Dimensions.get('window').width)
  /* Setting the state of dashboard to an object with the properties of DashboardType. */
  const [dashboard, setDashboard] = useState<DashboardType>({
    resumenMensual: [],
    ingresoAnual: 0,
    nuevosClientes: 0,
    ingresoMensual: 0,
    numeroVentas: 0,
    ventasAnteriores: 0,
    totalCs: 0,
    csAnteriores: 0,
    totalClientes: 0,
    promedioVentaPorFactura: 0,
    resumenSemanal: [0],
    resumenAnual: { 0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    topClientes: []
  })
  const user = useSelector((state: ReduxState) => state.userDB)
  /* A React Hook that is called when the component is mounted. */
  useEffect(() => {
    const controller = new AbortController()
    globalThis.console.log('DASHBOARD RENDER')
    if (user?.taxid?.length) {
      const { taxid, requestor, country, userName, token } = user
      const { signal } = controller
      /* Making a request to an API and setting the response to a state. */
      getDashboardService({ country, requestor, taxid, userName, token, signal })
        .then(res => {
          if (res.code === appCodes.ok) {
            if (res?.data) {
              console.log('DATA DASHBOARD', res.data.resumenSemanal)
              setDashboard(res.data)
            } else {
              toast.show('Algo salio mal al tratar de obtener tu informacion', {
                type: 'error'
              })
            }
          } else {
            toast.show('Algo salio mal al tratar de obtener tu informacion', {
              type: 'error'
            })
          }
        })
    } else {
      console.log('NOT LOGGED')
    }
    return () => { controller.abort() }
  }, [])
  /* Adding an event listener to the Dimensions object. */
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      (e) => {
        setDimensions(e.window.width)
      }
    )
    return () => subscription?.remove()
  }, [])
  return (
    <>
      <Text
        style={{
          fontSize: fonts.big,
          fontWeight: '700',
          margin: 7 / PixelRatio.getFontScale(),
          color: theme.gray75
        }}
      >Bienvenido{user?.userName?.length ? `, ${user.infoFiscalUser.nombre}` : ''}
      </Text>

      {/** ------------- CARROUSELL ------------- */}
      <ScrollView
        horizontal
        style={{
          marginVertical: 10
        }}
      >
        <View style={{
          height: 200,
          width: 325,
          backgroundColor: theme.purple,
          borderRadius: 13,
          borderBottomRightRadius: 70,
          marginRight: 7,
          flexDirection: 'row'
        }}
        >
          <View style={{
            flex: 0.9,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >{numberFormater({ number: dashboard.nuevosClientes })}
            </Text>
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >Clientes Nuevos
            </Text>
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >{numberFormater({ number: dashboard.totalClientes })}
            </Text>
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >Total de Clientes
            </Text>
          </View>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Icon
              name='person'
              size={80}
              type='i'
              color={theme.white25}
            />
          </View>
        </View>
        <View style={{
          height: 200,
          width: 325,
          backgroundColor: theme.orange,
          borderRadius: 13,
          borderBottomRightRadius: 70,
          marginRight: 7,
          flexDirection: 'row'
        }}
        >
          <View style={{
            flex: 0.9,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Text style={{
              color: theme.white,
              fontSize: fonts.header
            }}
            >Q{numberFormater({ number: dashboard.ingresoMensual, toFixed: true })}
            </Text>
            <Text style={{
              color: theme.white75,
              fontSize: fonts.header
            }}
            >Ingreso Mensual
            </Text>
            <Text style={{
              color: theme.white,
              fontSize: fonts.header
            }}
            >Q{numberFormater({ number: dashboard.ingresoAnual, toFixed: true })}
            </Text>
            <Text style={{
              color: theme.white75,
              fontSize: fonts.header
            }}
            >Ingreso Anual
            </Text>
          </View>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Icon
              name='areachart'
              size={80}
              type='a'
              color={theme.white50}
            />
          </View>
        </View>
        <View style={{
          height: 200,
          width: 325,
          backgroundColor: theme.purple,
          borderRadius: 13,
          borderBottomRightRadius: 70,
          marginRight: 7,
          flexDirection: 'row'
        }}
        >
          <View style={{
            flex: 0.9,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >Q{numberFormater({ number: dashboard.promedioVentaPorFactura, toFixed: true })}
            </Text>
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >Promedio Venta
            </Text>
            <Text style={{
              color: theme.white50,
              fontSize: fonts.header
            }}
            >Por Factura
            </Text>
          </View>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Icon
              name='receipt'
              size={80}
              type='i'
              color={theme.white25}
            />
          </View>
        </View>
        <View style={{
          height: 200,
          width: 325,
          backgroundColor: theme.orange,
          borderRadius: 13,
          borderBottomRightRadius: 70,
          marginRight: 7,
          flexDirection: 'row'
        }}
        >
          <View style={{
            flex: 0.9,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Text style={{
              color: theme.white,
              fontSize: fonts.header
            }}
            >Q{numberFormater({ number: dashboard.totalCs, toFixed: true })}
            </Text>
            <Text style={{
              color: theme.white75,
              fontSize: fonts.header
            }}
            >Ventas Colaterales
            </Text>
            <Text style={{
              color: theme.white,
              fontSize: fonts.header
            }}
            >{numberFormater({ number: dashboard.numeroVentas })}
            </Text>
            <Text style={{
              color: theme.white75,
              fontSize: fonts.header
            }}
            >Total de Ventas
            </Text>
          </View>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
            <Icon
              name='cart'
              size={80}
              type='i'
              color={theme.white50}
            />
          </View>
        </View>
      </ScrollView>

      {/** ------------- TOP CLIENTS CHART ------------- */}
      <View style={{
        borderRadius: 13,
        justifyContent: 'center',
        backgroundColor: theme.white,
        marginBottom: 10,
        padding: 5
      }}
      >
        <Text
          style={{
            fontSize: fonts.header,
            fontWeight: '700',
            margin: 7 / PixelRatio.getFontScale()
          }}
        >TOP Clientes del Mes de {months[new globalThis.Date().getMonth()]}
        </Text>
        <ClientTop clients={dashboard.topClientes} />
      </View>

      {/* -------------- SEMANAL CHART ------------- */}
      <View style={{
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.white,
        marginBottom: 10
      }}
      >
        <Text
          style={{
            fontSize: fonts.header,
            fontWeight: '700',
            color: theme.gray75,
            marginTop: 5
          }}
        >Ingresos Semanales de {months[new globalThis.Date().getMonth()]}
        </Text>
        <VictoryChart
          width={dimensions - 15}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            crossAxis
            style={{
              axis: { stroke: theme.purple },
              axisLabel: { fontSize: fonts.verySmall, padding: 10 },
              grid: { stroke: () => theme.gray25 },
              ticks: { stroke: theme.gray25, size: 1 },
              tickLabels: { fontSize: fonts.verySmall, padding: 5 }
            }}
            categories={{ x: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'] }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.transparent },
              axisLabel: { fontSize: fonts.verySmall, padding: 10 },
              grid: { stroke: () => theme.gray25 },
              ticks: { stroke: 'grey', size: 1 },
              tickLabels: { fontSize: fonts.verySmall, padding: 15 }
            }}
            tickFormat={(value) => {
              const suffixes = ['', 'K', 'M', 'B', 'T']
              const suffixNum = Math.floor(('' + value).length / 3)
              let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2))
              if (shortValue % 1 !== 0) {
                shortValue = Number(shortValue.toFixed(1))
              }
              return 'Q' + shortValue + suffixes[suffixNum]
            }}
          />
          <VictoryBar
            data={dashboard.resumenSemanal}
            barRatio={0.8}
            alignment='start'
            // categories={{ x: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'] }}
            style={{
              data: {
                fill: '#2E317E59'
              }
            }}
          />
        </VictoryChart>
      </View>

      {/* ------ YEAR CHART ------------- */}
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
            textAlign: 'center',
            margin: 7 / PixelRatio.getFontScale(),
            color: theme.gray75
          }}
        >Ingresos Anuales
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name='circle' size={15} color={theme.gray75} type='m' />
            <Text style={{ marginHorizontal: 2, fontSize: fonts.small, color: theme.gray50 }}>{Object.keys(dashboard.resumenAnual)[0]}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name='circle' size={15} color={theme.orange} type='m' />
            <Text style={{ marginHorizontal: 2, fontSize: fonts.small, color: theme.gray50 }}>{Object.keys(dashboard.resumenAnual)[1]}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name='circle' size={15} color={theme.purple} type='m' />
            <Text style={{ marginHorizontal: 2, fontSize: fonts.small, color: theme.gray50 }}>{Object.keys(dashboard.resumenAnual)[2]}</Text>
          </View>
        </View>
        <VictoryChart
          width={dimensions - 15}
          theme={VictoryTheme.material}
          domainPadding={{ y: 10 }}
          containerComponent={
            <VictoryZoomContainer allowPan responsive />
          }
        >

          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.graygreen, strokeWidth: 1 },
              axisLabel: { fontSize: fonts.verySmall, padding: 10 },
              grid: { stroke: () => theme.gray25 },
              ticks: { stroke: theme.gray, size: 1 },
              tickLabels: { fontSize: fonts.verySmall, padding: 5 }
            }}
            tickFormat={(value) => {
              const suffixes = ['', 'K', 'M', 'B', 'T']
              const suffixNum = Math.floor(('' + value).length / 3)
              let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2))
              if (shortValue % 1 !== 0) {
                shortValue = Number(shortValue.toFixed(1))
              }
              return 'Q' + shortValue + suffixes[suffixNum]
            }}
          />
          <VictoryAxis
            crossAxis
            style={{
              axis: { stroke: theme.purple },
              axisLabel: { fontSize: fonts.verySmall, padding: 10 },
              grid: { stroke: () => theme.gray25 },
              ticks: { stroke: theme.gray25, size: 1 },
              tickLabels: { fontSize: fonts.verySmall, padding: 5 }
            }}
            tickValues={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']}
          />
          <VictoryArea
            style={{
              data: {
                fill: '#2f343226',
                stroke: theme.gray75,
                strokeWidth: 3
              }
            }}
            data={dashboard.resumenAnual[Object.keys(dashboard.resumenAnual)[0]]}
            interpolation='natural'
            padding={0}
          />
          <VictoryArea
            style={{
              data: {
                fill: '#F9A12C26',
                stroke: theme.orange,
                strokeWidth: 3
              }
            }}
            data={dashboard.resumenAnual[Object.keys(dashboard.resumenAnual)[1]]}
            interpolation='natural'
            padding={0}
          />
          <VictoryArea
            style={{
              data: {
                fill: '#2E317E26',
                stroke: theme.purple,
                strokeWidth: 3
              }
            }}
            data={dashboard.resumenAnual[Object.keys(dashboard.resumenAnual)[2]]}
            interpolation='natural'
            padding={0}
          />
        </VictoryChart>

      </View>
    </>

  )
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next))
