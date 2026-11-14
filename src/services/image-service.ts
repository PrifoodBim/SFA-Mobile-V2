import { File, Paths } from "expo-file-system"
import { baseURL } from "@/config/api"
import { AuthResponse } from "@/types/auth.type"
import { createLogger, describeError } from "@/utils/logger"
import { getDataFromStorage, KEY } from "@/utils/storage.utils"

const log = createLogger("Download")

export type DownloadResult =
  | { status: "downloaded"; path: string }
  /** The server has no such file (HTTP 404). */
  | { status: "notFound" }
  /** Not signed in, network error, other HTTP error: worth retrying. */
  | { status: "failed" }

/** Downloads a file into the document directory (overwriting any previous copy). */
async function downloadFileWithStatus(
  url: string,
  fileName: string,
): Promise<DownloadResult> {
  try {
    const auth = await getDataFromStorage<AuthResponse>(KEY.AUTHTOKEN)
    if (!auth) {
      log.warn(`Skipped ${fileName}: not signed in`)
      return { status: "failed" }
    }

    const file = await File.downloadFileAsync(
      url,
      new File(Paths.document, fileName),
      {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        idempotent: true,
      },
    )

    return {
      status: "downloaded",
      path: decodeURIComponent(file.uri.replace(/^file:\/\//, "")),
    }
  } catch (error) {
    // expo-file-system rejects non-2xx responses with "response has status: <code>".
    if (error instanceof Error && /status: 404\b/.test(error.message)) {
      log.debug(`No file on server for ${fileName}`)
      return { status: "notFound" }
    }
    log.warn(`Failed ${fileName} from ${url}`, describeError(error))
    return { status: "failed" }
  }
}

/** Resolves the local file path, or `undefined` when the download failed. */
async function downloadFile(url: string, fileName: string) {
  const result = await downloadFileWithStatus(url, fileName)
  return result.status === "downloaded" ? result.path : undefined
}

/** Like `imageDownload`, but tells a missing image (404) apart from a failure. */
export const imageDownloadWithStatus = (imageUrl: string, fileName: string) =>
  downloadFileWithStatus(baseURL + imageUrl, fileName + ".png")

/** Whether `<fileName>.png` was already downloaded to the document directory. */
export const isImageDownloaded = (fileName: string) =>
  new File(Paths.document, fileName + ".png").exists

export const imageDownload = async (imageUrl: string, fileName: string) => {
  return downloadFile(baseURL + imageUrl, fileName + ".png")
}

export const downLoadImagesWithFileName = async (
  imageUrl: string,
  fileName: string,
) => {
  return downloadFile(imageUrl, fileName)
}
