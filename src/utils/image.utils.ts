import { File, Paths } from "expo-file-system"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import { StorageAuthType } from "@/types/auth.type"
import { getDataFromStorage, KEY } from "./storage.utils"

const COMPRESS_MAX_WIDTH = 900
const COMPRESS_MAX_HEIGHT = 1000
const COMPRESS_QUALITY = 0.8

/**
 * Downloads an authorized file into the document directory.
 * Resolves the local `file://` uri, or `undefined` when it fails.
 */
export const downloadImage = async (imageUrl: string, fileName: string) => {
  try {
    const user = await getDataFromStorage<StorageAuthType>(KEY.AUTHTOKEN)
    if (!user) {
      return
    }

    const file = await File.downloadFileAsync(
      imageUrl,
      new File(Paths.document, fileName),
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        idempotent: true,
      },
    )
    return file.uri
  } catch (error) {
    console.error("Error downloading image:", error)
  }
}

/** `file://` uri of a file saved in the document directory. */
export const getImage = (fileName: string) => {
  return new File(Paths.document, fileName).uri
}

const getFileType = (fileName: string) => {
  const name = fileName.toLowerCase()
  if (name.endsWith(".png")) return "image/png"
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg"
  if (name.endsWith(".gif")) return "image/gif"
  if (name.endsWith(".webp")) return "image/webp"
  if (name.endsWith(".pdf")) return "application/pdf"
  return "image/jpeg"
}

/** Appends every path in `data.images` to `formdata` as an `images` file part. */
export const handleImageUpload = (
  data: { images?: string[] } | null | undefined,
  formdata: FormData,
) => {
  if (!data || !data.images) {
    console.error("No data or images array provided")
    return null
  }

  for (const imagePath of data.images) {
    if (!imagePath) {
      continue
    }

    const fileName = getFileName(imagePath)
    if (!fileName) {
      continue
    }

    const fileUri = imagePath.startsWith("file://")
      ? imagePath
      : `file://${imagePath}`

    // React Native's FormData accepts `{ uri, name, type }` file parts.
    formdata.append("images", {
      uri: fileUri,
      name: fileName,
      type: getFileType(fileName),
    } as unknown as Blob)
  }

  return formdata
}

export const getFileName = (filePath: string) => {
  const splitName = filePath.split("/")

  return splitName[splitName.length - 1]
}

/** Shrinks a photo to fit 900x1000 and re-encodes it as JPEG. Resolves the new uri. */
export const compressImage = async (filePath: string) => {
  const context = ImageManipulator.manipulate(filePath)
  const original = await context.renderAsync()
  const scale = Math.min(
    1,
    COMPRESS_MAX_WIDTH / original.width,
    COMPRESS_MAX_HEIGHT / original.height,
  )

  if (scale < 1) {
    context.resize({
      width: Math.round(original.width * scale),
      height: Math.round(original.height * scale),
    })
  }

  const image = scale < 1 ? await context.renderAsync() : original
  const result = await image.saveAsync({
    compress: COMPRESS_QUALITY,
    format: SaveFormat.JPEG,
  })

  return result.uri
}
