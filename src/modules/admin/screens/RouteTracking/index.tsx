import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Text } from "react-native"
import MapView, {
  Callout,
  Circle,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps"
import styled from "styled-components/native"
import { Container, UserCard } from "@/components"
import { findOne, query, useQuery } from "@/db"
import { CoverageModel } from "@/db/models/Coverage.model"
import { CoverageLogs, CoverageLogsModel } from "@/db/models/CoverageLogs.model"
import { Customer, CustomerModel } from "@/db/models/Customer.model"
import { MapsSettings, MapsSettingsModel } from "@/db/models/MapsSettings.model"
import { alert } from "@/lib/modal"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { dateFormat } from "@/utils/date.utils"
import { getDistanceInMeters } from "@/utils/math.utils"

type CustomerMapsData = Customer & {
  logs: CoverageLogs[]
}

const MapWrapper = styled.View`
  flex: 1;
  margin-top: 12px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.color.white};
`

const Overlay = styled.View`
  position: absolute;
  top: 0;
  width: 100%;
`

const SummaryCard = styled.View`
  width: 230px;
  height: 74px;
  align-self: center;
  justify-content: center;
  border-width: 1px;
  border-radius: 8px;
  border-color: ${props => props.theme.color.grey300};
  background-color: ${props => props.theme.color.blue50};
`

const SummaryDate = styled.Text`
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.color.black};
`

const SummaryCount = styled.Text`
  text-align: center;
  font-size: 12px;
  color: ${props => props.theme.color.black};
`

const VisitedCount = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.green500};
`

const TotalCount = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.color.red};
`

function getTodayRange() {
  const date = new Date()
  return {
    startOfDay: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    endOfDay: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
  }
}

/** Color of the employee pin/line: missed when logged outside the hit radius. */
function getLogColor(
  customer: Customer,
  log: CoverageLogs,
  settings: MapsSettings,
) {
  const distance = getDistanceInMeters(
    Number(customer.latitude),
    Number(customer.longitude),
    Number(log.latitude),
    Number(log.longitude),
  )
  return {
    distance,
    pinColor:
      distance > settings.hitRadius
        ? settings.employeeMissedColor
        : settings.employeeColor,
  }
}

export default function RouteTracking() {
  const { userId, userData } = useUserContext()
  const settings = useQuery(MapsSettingsModel)[0]
  const [data, setData] = useState<CustomerMapsData[]>([])

  async function fetchCustomerLogs() {
    try {
      const { startOfDay, endOfDay } = getTodayRange()
      const isToday = (date: Date) => date >= startOfDay && date < endOfDay

      const coverage = query(CoverageModel, {
        where: { empId: userId },
        filter: item => isToday(item.coverageDate),
      })

      if (!settings) {
        await alert({
          title: "Sync Required",
          message: "Please sync the latest configuration before proceeding.",
        })
        router.back()
        return
      }

      if (coverage.length < 1) {
        setData([])
        await alert({
          title: "Route for Today",
          message: "No Coverage Plan has been added for today.",
        })
        router.back()
        return
      }

      const customers = coverage
        .map(item =>
          findOne(CustomerModel, { where: { code: item.customerCode } }),
        )
        .filter((customer): customer is Customer => customer !== undefined)

      setData(
        customers.map(customer => ({
          ...customer,
          logs: query(CoverageLogsModel, {
            where: { customerCode: customer.code },
            filter: log => isToday(log.logDate),
          }),
        })),
      )
    } catch (error) {
      console.error("ERROR", error)
    }
  }

  useEffect(() => {
    fetchCustomerLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function renderMap() {
    if (data.length < 1 || !settings) {
      return null
    }

    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ width: "100%", height: "100%" }}
        region={{
          latitude: Number(data[0].latitude),
          longitude: Number(data[0].longitude),
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {data.map(customer => {
          const coordinate = {
            latitude: Number(customer.latitude),
            longitude: Number(customer.longitude),
          }
          const employeeName =
            customer.salesAgentUserId === userId
              ? customer.salesAgentName
              : userData?.empName

          return [
            <Marker
              key={`customer-${customer._id}`}
              coordinate={coordinate}
              pinColor={
                customer.logs.length > 0
                  ? settings.visitedColor
                  : settings.customerColor
              }
            >
              <Callout>
                <Text>{customer.name}</Text>
              </Callout>
            </Marker>,
            ...customer.logs.map(log => {
              const { distance, pinColor } = getLogColor(
                customer,
                log,
                settings,
              )
              return (
                <Marker
                  key={`log-${log._id}`}
                  coordinate={{
                    latitude: Number(log.latitude),
                    longitude: Number(log.longitude),
                  }}
                  pinColor={pinColor}
                >
                  <Callout>
                    <Text>{employeeName}</Text>
                    <Text>{distance.toFixed(2) + " m"}</Text>
                  </Callout>
                </Marker>
              )
            }),
            <Circle
              key={`circle-${customer._id}`}
              center={coordinate}
              strokeColor={settings.circleColor}
              radius={settings.hitRadius}
            />,
            ...customer.logs.map(log => {
              const { pinColor } = getLogColor(customer, log, settings)
              return (
                <Polyline
                  key={`line-${log._id}`}
                  coordinates={[
                    {
                      latitude: Number(log.latitude),
                      longitude: Number(log.longitude),
                    },
                    coordinate,
                  ]}
                  fillColor={pinColor}
                  strokeColor={pinColor}
                />
              )
            }),
          ]
        })}
      </MapView>
    )
  }

  return (
    <Container>
      <UserCard />
      <MapWrapper>
        {renderMap()}
        <Overlay>
          <SummaryCard>
            <SummaryDate>
              {dateFormat(new Date(), "MM-DD-YYYY")} |{" "}
              {dateFormat(new Date(), "dddd").toUpperCase()}
            </SummaryDate>
            <SummaryCount>
              <VisitedCount>
                {data.filter(customer => customer.logs.length > 0).length}
              </VisitedCount>{" "}
              out of
              <TotalCount> {data.length} </TotalCount> stores
            </SummaryCount>
          </SummaryCard>
        </Overlay>
      </MapWrapper>
    </Container>
  )
}
