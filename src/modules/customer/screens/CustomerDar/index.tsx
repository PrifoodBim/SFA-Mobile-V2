import { router } from "expo-router"
import { useHeaderHeight } from "expo-router/react-navigation"
import { useState } from "react"
import { KeyboardAvoidingView } from "react-native"
import { Container, TextInput, UserCard } from "@/components"
import { CONFIRMATION_TRANSACTION, SAVE_RECORD_TEXT } from "@/constants/strings"
import { createId, insert, useQuery } from "@/db"
import useGetCustomer from "@/hooks/useGetCustomer"
import useScrollToFocusedInput from "@/hooks/useScrollToFocusedInput"
import { confirm } from "@/lib/modal"
import CardValue from "@/modules/customer/components/CardValue"
import CheckBoxWithValue from "@/modules/customer/components/CheckBoxWithValue"
import { TransactionType } from "@/modules/customer/handlers/transaction.dto"
import { saveTransaction } from "@/modules/customer/handlers/transaction.handler"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import { DarModel } from "@/modules/customer/models/Dar.model"
import { DarInfoModel } from "@/modules/customer/models/DarInfo.model"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { formatNegativeNumber, isWholeNumberString } from "@/utils/math.utils"
import {
  Caption,
  Cell,
  ErrorText,
  Form,
  InputCell,
  OptionRow,
  Panel,
  PanelTitle,
  Row,
  Scroll,
  Value,
} from "./styles"

const smallInputStyle = { height: 30, paddingHorizontal: 8, paddingVertical: 4 }
const textAreaStyle = { height: 100 }

const digitsOnly = (text: string) => text.replace(/[^0-9]/g, "")

function wholeNumberError(field: string) {
  return `Enter a valid whole number for ${field} (no decimals, no letters, no negative signs, and no leading zeros unless it's 0)`
}

export default function CustomerDar() {
  const headerHeight = useHeaderHeight()
  const keyboardScroll = useScrollToFocusedInput()
  const { userId } = useUserContext()
  const { selectedCustomer } = useCustomerVisitContext()
  const { customer } = useGetCustomer({
    selectedCustomer: selectedCustomer ?? "",
  })

  const info = useQuery(DarInfoModel, {
    where: { customerCode: selectedCustomer },
  })[0]

  const [todayActual, setTodayActual] = useState("")
  const [npi, setNpi] = useState("")
  const [promo, setPromo] = useState("")
  const [isPlanogram, setIsPlanogram] = useState(false)
  const [isPricing, setIsPricing] = useState(false)
  const [isPromo, setIsPromo] = useState(false)
  const [issues, setIssues] = useState("")
  const [action, setAction] = useState("")

  const [actualError, setActualError] = useState("")
  const [npiError, setNpiError] = useState("")
  const [promoError, setPromoError] = useState("")
  const [issuesError, setIssuesError] = useState("")
  const [actionError, setActionError] = useState("")

  const displayIndex =
    todayActual && info?.todaysTarget
      ? (+todayActual / info.todaysTarget) * 100.0
      : 0
  const displayNpi = `${info?.nplData}-${npi || "0"}`
  const displayPromo = `${info?.promoData}-${promo || "0"}`

  async function handleSubmit() {
    if (!todayActual) {
      setActualError("Enter todays booking")
      return
    }
    if (!isWholeNumberString(todayActual)) {
      setActualError(wholeNumberError("booked"))
      return
    }
    if (!npi) {
      setNpiError("Enter actual new product (NPL)")
      return
    }
    if (!isWholeNumberString(npi)) {
      setNpiError(wholeNumberError("NPI"))
      return
    }
    if (!promo) {
      setPromoError("Enter actual visible promo")
      return
    }
    if (!isWholeNumberString(promo)) {
      setPromoError(wholeNumberError("promo"))
      return
    }
    if (!issues) {
      setIssuesError("Enter issues and opportunities")
      return
    }
    if (!action) {
      setActionError("Enter action plan and next step")
      return
    }

    if (
      await confirm({
        title: SAVE_RECORD_TEXT,
        message: CONFIRMATION_TRANSACTION,
      })
    ) {
      await confirmSubmit()
    }
  }

  async function confirmSubmit() {
    try {
      const transId = createId()
      insert(DarModel, {
        _id: transId,
        customerCode: selectedCustomer ?? "",
        userName: userId,
        transId: "0",
        darDate: new Date().toISOString(),
        monthTarget: info?.monthlyTarget || 0,
        monthActual: info?.monthlyActual || 0,
        monthBalance: info?.monthlyBalance || 0,
        todayTarget: info?.todaysTarget || 0,
        todayActual: +todayActual,
        todayIndex: displayIndex,
        npi: displayNpi,
        mcl: info && info.mclPercent > 0 ? info.mclPercent.toString() : "0",
        promo: displayPromo,
        planogram: isPlanogram,
        pricing: isPricing,
        isPromo,
        issues,
        action,
        listedSku: info?.listedSku || "",
      })
      await saveTransaction(TransactionType.DAR, transId)
      router.back()
    } catch (error) {
      console.error("Error saving DAR report:", error)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={{ flex: 1 }}
    >
      <Container>
        <UserCard
          name={customer?.name}
          description={customer?.code}
          isCurrentUserInfo={false}
        />
        <SaveCancelButtons
          onSave={handleSubmit}
          onCancel={() => router.back()}
        />
        <Scroll {...keyboardScroll}>
          <Form>
            <Panel>
              <PanelTitle>CUSTOMER INFO</PanelTitle>
              <Row>
                <CardValue label="CHANNEL">
                  <Value $size={10}>{info?.channel}</Value>
                </CardValue>
                <CardValue label="FREQ.">
                  <Value $size={10}>{info?.frequency}</Value>
                </CardValue>
                <CardValue label="TERMS">
                  <Value $size={10}>{info?.paymentTerms}</Value>
                </CardValue>
              </Row>
            </Panel>
            <Panel>
              <PanelTitle>MONTHLY PERFORMANCE</PanelTitle>
              <Row>
                <CardValue label="TARGET">
                  <Value $size={10}>
                    {formatNegativeNumber(info?.monthlyTarget || 0)}
                  </Value>
                </CardValue>
                <CardValue label="ACTUAL">
                  <Value $size={10}>
                    {formatNegativeNumber(info?.monthlyActual || 0)}
                  </Value>
                </CardValue>
                <CardValue label="BALANCE">
                  <Value $size={10}>
                    {formatNegativeNumber(info?.monthlyBalance || 0)}
                  </Value>
                </CardValue>
              </Row>
            </Panel>
            <Panel>
              <PanelTitle>TODAYS PERFORMANCE</PanelTitle>
              <Row>
                <CardValue label="TARGET">
                  <Value $size={10}>
                    {formatNegativeNumber(info?.todaysTarget || 0)}
                  </Value>
                </CardValue>
                <InputCell>
                  <TextInput
                    inputStyle={smallInputStyle}
                    onChangeText={text => {
                      setTodayActual(digitsOnly(text))
                      setActualError("")
                    }}
                    keyboardType="numeric"
                    value={todayActual}
                  />
                  <Caption>BOOKED</Caption>
                </InputCell>
                <CardValue label="INDEX">
                  <Value $size={10}>{formatNegativeNumber(displayIndex)}</Value>
                </CardValue>
              </Row>
            </Panel>
            {actualError ? <ErrorText $center>{actualError}</ErrorText> : null}
            <Panel>
              <PanelTitle>AVAILABILITY</PanelTitle>
              <Row>
                <CardValue label="NPL">
                  <Value $size={14}>{displayNpi}</Value>
                </CardValue>
                <CardValue label="LISTED SKU">
                  <Value $size={14}>{info?.listedSku}</Value>
                </CardValue>
                <CardValue label="PROMO">
                  <Value $size={14}>{displayPromo}</Value>
                </CardValue>
              </Row>
              <Row $marginTop={8}>
                <Cell>
                  <TextInput
                    inputStyle={smallInputStyle}
                    onChangeText={text => {
                      setNpi(digitsOnly(text))
                      setNpiError("")
                    }}
                    value={npi}
                    keyboardType="numeric"
                  />
                </Cell>
                <Cell />
                <Cell>
                  <TextInput
                    inputStyle={smallInputStyle}
                    onChangeText={text => {
                      setPromo(digitsOnly(text))
                      setPromoError("")
                    }}
                    value={promo}
                    keyboardType="numeric"
                  />
                </Cell>
              </Row>
            </Panel>
            {npiError ? <ErrorText $center>{npiError}</ErrorText> : null}
            {promoError ? <ErrorText $center>{promoError}</ErrorText> : null}
            <Panel>
              <PanelTitle>VISIBILITY - ACTIVATION</PanelTitle>
              <OptionRow>
                <CheckBoxWithValue
                  isCheck={isPlanogram}
                  onPress={() => setIsPlanogram(prev => !prev)}
                  label="PLANOGRAM"
                />
                <CheckBoxWithValue
                  isCheck={isPricing}
                  onPress={() => setIsPricing(prev => !prev)}
                  label="PRICING"
                />
                <CheckBoxWithValue
                  isCheck={isPromo}
                  onPress={() => setIsPromo(prev => !prev)}
                  label="PROMO"
                />
              </OptionRow>
            </Panel>
            <TextInput
              label="Issues and Opportunities:"
              onChangeText={text => {
                setIssues(text)
                setIssuesError("")
              }}
              multiline={true}
              value={issues}
              numberOfLines={2}
              inputStyle={textAreaStyle}
              textAlignVertical="top"
              maxLength={1000}
            />
            {issuesError ? <ErrorText>{issuesError}</ErrorText> : null}
            <TextInput
              label="Action Plan and Next Step:"
              onChangeText={text => {
                setAction(text)
                setActionError("")
              }}
              multiline={true}
              value={action}
              numberOfLines={2}
              inputStyle={textAreaStyle}
              textAlignVertical="top"
              maxLength={1000}
            />
            <ErrorText>{actionError}</ErrorText>
          </Form>
        </Scroll>
      </Container>
    </KeyboardAvoidingView>
  )
}
