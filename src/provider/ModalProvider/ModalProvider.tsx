import {
    DefaultModalOptionType,
    ModalOptionType,
    ModalProviderType,
} from "@/types/ModalProviderType/ModalProvider.type"
import createAppContext from "@/utils/context.utils"

type Props = {
  children: React.ReactNode
}

const [useModalContext, ModalContextProvider] =
  createAppContext<ModalProviderType>()

function ModalProvider(props: Readonly<Props>) {
  const { children } = props
  const openModalDynamicOption = (option: ModalOptionType) => {
    // Implementation for opening a modal with dynamic options
  }

  const openGenericModal = (option: DefaultModalOptionType) => {
    // Implementation for opening a generic modal
  }


  return <ModalContextProvider>{children}</ModalContextProvider>
}

export { ModalProvider, useModalContext }
