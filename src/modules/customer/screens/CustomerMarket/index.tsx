import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ScrollView } from "react-native"
import styled from "styled-components/native"
import { TextInput, UserCard } from "@/components"
import Button from "@/components/Button"
import Container from "@/components/Container"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import { createId, insert } from "@/db"
import { MarketAnalysisModel } from "@/db/models/MarketAnalysis.model"
import { alert, confirm, openModalRoute } from "@/lib/modal"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { MaterialIcon } from "@/types/icon.enum"
import * as S from "./styles"

export default function CustomerMarket() {
  const { selectedCustomer, photos, setPhotos } = useCustomerVisitContext()
  const { userId } = useUserContext()

  const [title, setTitle] = useState<string>("")
  const [brand, setBrand] = useState<string>("")
  const [scheme, setScheme] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [remarks, setRemarks] = useState<string>("")

  const [errorTitle, setErrorTitle] = useState<string>("")
  const [errorBrand, setErrorBrand] = useState<string>("")
  const [errorScheme, setErrorScheme] = useState<string>("")
  const [errorPrice, setErrorPrice] = useState<string>("")
  const [errorRemarks, setErrorRemarks] = useState<string>("")

  useEffect(() => {
    setPhotos([])
  }, [])

  async function handleValidateFields(): Promise<boolean> {
    if (!title) {
      setErrorTitle("Please enter your title to proceed.")
      return false
    }

    if (!brand) {
      setErrorBrand("Please enter your brand to proceed.")
      return false
    }

    if (!scheme) {
      setErrorScheme("Please enter your scheme to proceed.")
      return false
    }

    if (!price || +price < 1) {
      setErrorPrice(
        "Please enter your price and price should not be 0 to proceed .",
      )
      return false
    }

    if (!remarks) {
      setErrorRemarks("Please enter your remarks to proceed.")
      return false
    }

    if (photos.length < 1) {
      await alert({
        title: "Picture Required",
        message: "Please take a photo to record and save this transaction.",
        singleButtonText: "RETRY",
      })
      return false
    }

    return true
  }

  async function handleSave() {
    if (!(await handleValidateFields())) {
      return
    }

    const marketType = await openModalRoute<void, string>(
      "/market-activity",
      undefined,
    )
    if (marketType === undefined) {
      return
    }

    const isConfirmed = await confirm({
      title: "Save Record",
      message: "Are you sure you want to save this transaction?",
    })
    if (isConfirmed) {
      handleSubmit(marketType)
    }
  }

  function handleSubmit(selectedMarketType: string) {
    try {
      insert(MarketAnalysisModel, {
        _id: createId(),
        docDate: new Date().toISOString(),
        userName: userId,
        docId: 0,
        customerCode: selectedCustomer ?? "",
        type: selectedMarketType,
        brand,
        title,
        scheme,
        price,
        remarks,
        images: photos.map(val => val.fileName),
        imageDetails: photos,
      })
      setPhotos([])
      router.dismissTo(Route.CUSTOMER_DASHBOARD)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container padding={10}>
      <UserCard />
      <S.ActionRow>
        <Button
          buttonColor="primary"
          width={150}
          icon={MaterialIcon.SAVE}
          title="SAVE"
          onPress={handleSave}
        />
        <Button
          buttonColor="danger"
          width={150}
          icon={MaterialIcon.SAVE}
          title="CANCEL"
          onPress={() => router.back()}
        />
      </S.ActionRow>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <S.Form>
          <S.Fields>
            <TextInput
              label="Title"
              value={title}
              onChangeText={text => {
                setTitle(text)
                setErrorTitle("")
              }}
              errorText={errorTitle}
              maxLength={50}
            />
            <TextInput
              label="Brand"
              value={brand}
              maxLength={50}
              onChangeText={text => {
                setBrand(text)
                setErrorBrand("")
              }}
              errorText={errorBrand}
            />
            <TextInput
              placeholder=""
              label="Scheme"
              maxLength={100}
              value={scheme}
              onChangeText={text => {
                setScheme(text)
                setErrorScheme("")
              }}
              errorText={errorScheme}
            />
            <TextInput
              placeholder=""
              value={price}
              onChangeText={text => {
                setPrice(text)
                setErrorPrice("")
              }}
              label="Price"
              keyboardType="number-pad"
              errorText={errorPrice}
            />
            <TextInput
              label="Remarks"
              value={remarks}
              onChangeText={text => {
                setRemarks(text)
                setErrorRemarks("")
              }}
              multiline={true}
              numberOfLines={2}
              inputStyle={{ height: 100 }}
              textAlignVertical="top"
              errorText={errorRemarks}
              maxLength={1000}
            />
          </S.Fields>
          <Button
            icon={MaterialIcon.CAMERA_ALT}
            width={150}
            buttonStyle={{
              alignSelf: "center",
              flexDirection: "row-reverse",
              backgroundColor: color.gold,
              marginTop: 16,
            }}
            title=" Capture"
            textStyle={{ color: color.black }}
            isShowIcon={true}
            onPress={() =>
              router.push({
                pathname: Route.CAMERA,
                params: { insertInto: "MARKET" },
              })
            }
          />
        </S.Form>
        <S.ImageWrapper>
          {photos.length > 0 && (
            <S.Photo
              source={{ uri: `file://${photos[0].fileName}` }}
              resizeMode="cover"
            />
          )}
        </S.ImageWrapper>
      </ScrollView>
      <S.BottomSpace />
    </Container>
  )
}
