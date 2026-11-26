import styled, { css } from "styled-components/native"
import { VERSION } from "@/constants/strings"

type Props = {
  /** Pinned to the bottom over the content (login) instead of filling the remaining space. */
  isFloating?: boolean
  buildColor: string
  /** Extra line height on the copyright text. */
  isSpaced?: boolean
}

const Wrapper = styled.View<{ $isFloating: boolean }>`
  justify-content: flex-end;
  padding: 32px;
  ${props =>
    props.$isFloating
      ? css`
          position: absolute;
          bottom: 4px;
          width: 100%;
        `
      : css`
          flex: 1;
          bottom: 0;
        `}
`

const Copyright = styled.Text<{ $isSpaced: boolean }>`
  text-align: center;
  font-size: 12px;
  color: ${props => props.theme.color.white};
  ${props => props.$isSpaced && "line-height: 32px;"}
`

const Build = styled.Text<{ $color: string }>`
  text-align: center;
  font-size: 10px;
  color: ${props => props.$color};
`

/** "Copyright / build version" footer, hidden by the screens while typing. */
export default function AuthFooter(props: Readonly<Props>) {
  const { isFloating = false, buildColor, isSpaced = true } = props

  return (
    <Wrapper $isFloating={isFloating}>
      <Copyright $isSpaced={isSpaced}>CopyRight @ 2025</Copyright>
      <Build $color={buildColor}>Build {VERSION}</Build>
    </Wrapper>
  )
}
