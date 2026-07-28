export type ModalOptionType = {
  isOpen: boolean
  content: React.ReactNode
  isHasPadding?: boolean
}

export type DefaultModalOptionType = {
  backgroundColor: string
  isHasPadding: boolean
  title: string
  contentText: string
  showOkayButton?: boolean
  showCancelButton?: boolean
  okayButtonText?: string
  cancelButtonText?: string
  onOkayButtonPress?: () => void
  onCancelButtonPress?: () => void
}

export type ModalProviderType = {
  openModalDynamicOption: (option: ModalOptionType) => void
  openGenericModal: (option: DefaultModalOptionType) => void
  closeModal: () => void
}
