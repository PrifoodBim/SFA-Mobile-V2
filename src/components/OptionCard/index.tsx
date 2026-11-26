import { useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { TouchableOpacityProps } from "react-native"
import styled from "styled-components/native"
import { RoutePath } from "@/constants/routes"
import { color } from "@/constants/theme"
import {
  TransactionStatus,
  TransactionType,
} from "@/modules/customer/handlers/transaction.dto"
import { getTransactionStatus } from "@/modules/customer/handlers/transaction.handler"
import { MaterialIcon } from "@/types/icon.enum"
import Card from "../Card"
import Icon from "../Icon"

export type OptionList = TouchableOpacityProps & {
  optionNumber?: string
  title?: string
  header?: string
  description?: string
  isEmpty?: boolean
  route: RoutePath
  /** Shows a warning triangle until its transaction is saved, then a check mark. */
  transactionKey?: TransactionType | null
}

const Wrapper = styled.TouchableOpacity`
  width: 150px;
`

const StatusIcon = styled.View`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
`

const OptionNumber = styled.Text`
  font-size: 30px;
  line-height: 30px;
  font-weight: 600;
  color: #fff600;
`

const Title = styled.Text`
  font-size: 20px;
  line-height: 20px;
  font-weight: 600;
  color: ${props => props.theme.color.white};
`

const Header = styled.Text`
  padding-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.color.black};
`

const Description = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.color.grey};
`

const Empty = styled.View`
  width: 100%;
  height: 20px;
  border-radius: 8px;
`

/** Numbered green menu tile with a caption below it. */
export default function OptionCard(props: Readonly<OptionList>) {
  const {
    optionNumber = "",
    title = "",
    header = "",
    description = "",
    isEmpty,
    transactionKey,
    route: _route,
    ...rest
  } = props
  const [status, setStatus] = useState<TransactionStatus | null>(null)

  // Re-read on focus: saving a module elsewhere changes this card's status.
  useFocusEffect(
    useCallback(() => {
      if (!transactionKey) {
        setStatus(null)
        return
      }
      let isActive = true
      getTransactionStatus(transactionKey).then(result => {
        if (isActive) setStatus(result)
      })
      return () => {
        isActive = false
      }
    }, [transactionKey]),
  )

  if (isEmpty) {
    return <Empty />
  }

  return (
    <Wrapper {...rest}>
      {status === TransactionStatus.SAVED && (
        <StatusIcon>
          <Icon name={MaterialIcon.CHECK} size={24} />
        </StatusIcon>
      )}
      {/* Triangle until the module's transaction is saved, whether or not it
          can be opened yet; replaced by the check once saved. */}
      {(status === TransactionStatus.LOCKED ||
        status === TransactionStatus.OPEN) && (
        <StatusIcon>
          <Icon name={MaterialIcon.WARNING} size={24} color={color.yellow400} />
        </StatusIcon>
      )}
      <Card cardStyle={{ paddingHorizontal: 12, paddingVertical: 20 }}>
        <OptionNumber>{optionNumber}</OptionNumber>
        <Title>{title}</Title>
      </Card>
      <Header>{header}</Header>
      <Description>{description}</Description>
    </Wrapper>
  )
}
