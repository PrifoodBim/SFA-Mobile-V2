import { router } from "expo-router"
import { useState } from "react"
import styled from "styled-components/native"
import { Container, TextInput, UserCard } from "@/components"
import { CONFIRMATION_TRANSACTION, SAVE_RECORD_TEXT } from "@/constants/strings"
import { createId, insert } from "@/db"
import useGetCustomer from "@/hooks/useGetCustomer"
import { confirm } from "@/lib/modal"
import CheckBoxWithValue from "@/modules/customer/components/CheckBoxWithValue"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import { CustomerNoteModel } from "@/modules/customer/models/CustomerNote.model"
import {
  NotesCriteriaEnum,
  PostMaterialEnum,
} from "@/modules/customer/types/Notes.enum"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"

const CRITERIA = [
  NotesCriteriaEnum.PLUS_AVERAGE,
  NotesCriteriaEnum.AVERAGE,
  NotesCriteriaEnum.POOR,
  NotesCriteriaEnum.NA,
]

const POS_MATERIALS = [
  PostMaterialEnum.YES,
  PostMaterialEnum.NO,
  PostMaterialEnum.NA,
]

const Scroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
})`
  margin: 12px 0;
`

const Form = styled.View`
  flex: 1;
  margin: 12px 0;
  gap: 8px;
`

const Section = styled.View`
  height: 70px;
  padding: 4px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

const SectionTitle = styled.Text`
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme.color.blue400};
`

const OptionRow = styled.View`
  margin-top: 12px;
  flex-direction: row;
  justify-content: space-around;
`

const PosRow = styled.View`
  margin-top: 12px;
  flex-direction: row;
  justify-content: center;
  gap: 40px;
`

const ErrorText = styled.Text`
  text-align: center;
  font-size: 12px;
  color: ${props => props.theme.color.red};
`

const textAreaStyle = { height: 100 }

export default function CustomerNotes() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { userId } = useUserContext()
  const { customer } = useGetCustomer({
    selectedCustomer: selectedCustomer ?? "",
  })

  const [cleanliness, setCleanliness] = useState("")
  const [priceTags, setPriceTags] = useState("")
  const [posMaterial, setPosMaterial] = useState("")
  const [details, setDetails] = useState("")
  const [resolution, setResolution] = useState("")

  const [cleanlinessError, setCleanlinessError] = useState("")
  const [priceTagsError, setPriceTagsError] = useState("")
  const [posMaterialError, setPosMaterialError] = useState("")
  const [detailsError, setDetailsError] = useState("")
  const [resolutionError, setResolutionError] = useState("")

  async function validateDetails() {
    if (!cleanliness) {
      setCleanlinessError("Please select a cleanliness rating.")
      return
    }
    if (!priceTags) {
      setPriceTagsError("Please select a price tag rating.")
      return
    }
    if (!posMaterial) {
      setPosMaterialError("Please select a POS material answer.")
      return
    }
    if (!details) {
      setDetailsError("Please enter details.")
      return
    }
    if (!resolution) {
      setResolutionError("Please enter resolution.")
      return
    }
    if (
      await confirm({
        title: SAVE_RECORD_TEXT,
        message: CONFIRMATION_TRANSACTION,
      })
    ) {
      handleSave()
    }
  }

  function handleSave() {
    try {
      insert(CustomerNoteModel, {
        _id: createId(),
        customerCode: selectedCustomer ?? "",
        transId: "0",
        notesDate: new Date().toISOString(),
        userName: userId,
        cleanliness,
        priceTags,
        posMaterials: posMaterial === PostMaterialEnum.YES,
        concerns: details,
        resolution,
      })
      router.back()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <SaveCancelButtons
        onSave={validateDetails}
        onCancel={() => router.back()}
      />
      <Scroll>
        <Form>
          <Section>
            <SectionTitle>CLEANLINESS</SectionTitle>
            <OptionRow>
              {CRITERIA.map(value => (
                <CheckBoxWithValue
                  key={value}
                  isCheck={cleanliness === value}
                  onPress={() => {
                    setCleanliness(value)
                    setCleanlinessError("")
                  }}
                  label={value}
                />
              ))}
            </OptionRow>
            {cleanlinessError ? (
              <ErrorText>{cleanlinessError}</ErrorText>
            ) : null}
          </Section>

          <Section>
            <SectionTitle>PRICE TAGS</SectionTitle>
            <OptionRow>
              {CRITERIA.map(value => (
                <CheckBoxWithValue
                  key={value}
                  isCheck={priceTags === value}
                  onPress={() => {
                    setPriceTags(value)
                    setPriceTagsError("")
                  }}
                  label={value}
                />
              ))}
            </OptionRow>
            {priceTagsError ? <ErrorText>{priceTagsError}</ErrorText> : null}
          </Section>

          <Section>
            <SectionTitle>POS MATERIAL</SectionTitle>
            <PosRow>
              {POS_MATERIALS.map(value => (
                <CheckBoxWithValue
                  key={value}
                  isCheck={posMaterial === value}
                  onPress={() => {
                    setPosMaterial(value)
                    setPosMaterialError("")
                  }}
                  label={value}
                />
              ))}
            </PosRow>
            {posMaterialError ? (
              <ErrorText>{posMaterialError}</ErrorText>
            ) : null}
          </Section>
          <TextInput
            label="Details:"
            onChangeText={text => {
              setDetails(text)
              setDetailsError("")
            }}
            multiline={true}
            value={details}
            numberOfLines={2}
            inputStyle={textAreaStyle}
            textAlignVertical="top"
            errorText={detailsError}
            maxLength={1000}
          />
          <TextInput
            label="Resolution:"
            onChangeText={text => {
              setResolution(text)
              setResolutionError("")
            }}
            multiline={true}
            numberOfLines={2}
            value={resolution}
            inputStyle={textAreaStyle}
            textAlignVertical="top"
            errorText={resolutionError}
            maxLength={1000}
          />
        </Form>
      </Scroll>
    </Container>
  )
}
