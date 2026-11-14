import styled from "styled-components/native"

type Props = {
  width?: number
  height?: number
}

const Box = styled.View<{ $width: number; $height: number }>`
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
`

export default function SizeBox(props: Readonly<Props>) {
  const { width = 0, height = 0 } = props
  return <Box $width={width} $height={height} />
}
