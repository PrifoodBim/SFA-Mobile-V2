import {
  createId,
  findOne,
  insert,
  query,
  remove,
  update,
  upsert,
  write,
} from "@/db"
import { Coverage, CoverageModel } from "@/db/models/Coverage.model"
import { CoverageLogsModel } from "@/db/models/CoverageLogs.model"
import { Customer, CustomerModel } from "@/db/models/Customer.model"
import { Demo, DemoModel } from "@/db/models/Demo.model"
import { MapsSettingsModel } from "@/db/models/MapsSettings.model"
import {
  MarketAnalysis,
  MarketAnalysisModel,
} from "@/db/models/MarketAnalysis.model"
import { OptionModel } from "@/db/models/Option.model"
import { Product, ProductModel } from "@/db/models/Product.model"
import {
  ProductPartner,
  ProductPartnerModel,
} from "@/db/models/ProductPartner.model"
import { getUser } from "@/services/account.service"
import { getDemo } from "@/services/admin.service"
import { getCoverageList, sendCoverageLogs } from "@/services/coverage.service"
import { getCustomers } from "@/services/customer.service"
import {
  imageDownload,
  imageDownloadWithStatus,
  isImageDownloaded,
} from "@/services/image-service"
import { uploadMarketAnalysisReport } from "@/services/market-analysis.service"
import { getDemoGroups, getMarketTypes } from "@/services/option.service"
import { getProductPartners } from "@/services/product-partners.service"
import { getAllProducts } from "@/services/product.service"
import { getSettingsApi } from "@/services/settings.service"
import { OptionTypeEnum } from "@/types/Option.type"
import { createLogger } from "@/utils/logger"
import { failedUploadMessage, uploadPending } from "../uploadPending"

const log = createLogger("Sync")

type SetError = (error: string) => void

type CoverageResponse = Omit<
  Coverage,
  "_id" | "isVisited" | "coverageDate" | "createDate" | "updatedDate"
> & {
  coverageDate: string
  visited: boolean
}

type CustomerResponse = Omit<
  Customer,
  "_id" | "isUpdated" | "lastModificationTime"
> & {
  lastModificationTime: string | null
}

type ProductPartnerResponse = {
  id: number
  customerCode: string
  customerName: string
  salesAgentUserId: string
  salesAgentName: string
  productCode: string
  productName: string
  xCode: string
  xName: string
  purchaseUOM: string
  purchasePrice: number
  sellingUOM: string
  sellingPrice: number
  mustCarry: boolean
  status: string
  lineNum: number
  productPacking: string
  lastModificationTime: string | null
  schemeNo: number
  ico: number
}

type ProductResponse = Omit<
  Product,
  "_id" | "isUpdated" | "lastModificationTime"
> & {
  lastModificationTime: string | null
}

type OptionResponse = {
  code: string
  name: string
}

type DemoResponse = Omit<Demo, "_id" | "updatedAt" | "docDate"> & {
  docDate: string
  lastModificationTime: string | null
}

type CoverageLogsResponse = {
  transId: string
  coverageLogId: number
}

export async function handleGetUserInfo(setError: SetError) {
  try {
    return await getUser()
  } catch (error) {
    log.error("Getting user info not sync", error)
    setError("Getting user info not sync")
  }
}

/**
 * Removes the coverage created on mobile (unplanned customer, `coverageId` 0)
 * once the MCP has the same customer and date. Returns whether it was visited.
 * Must run inside `write()`.
 */
export function removeSystemGeneratedCoverage(element: {
  customerCode: string
  coverageDate: string | Date
}): boolean {
  const coverageDate = new Date(element.coverageDate)
  const startOfDay = new Date(
    coverageDate.getFullYear(),
    coverageDate.getMonth(),
    coverageDate.getDate(),
  )
  const endOfDay = new Date(
    coverageDate.getFullYear(),
    coverageDate.getMonth(),
    coverageDate.getDate() + 1,
  )
  const systemGenerated = query(CoverageModel, {
    where: { coverageId: 0, customerCode: element.customerCode },
    filter: coverage =>
      coverage.coverageDate >= startOfDay && coverage.coverageDate < endOfDay,
  })

  const isVisited = systemGenerated.some(val => val.isVisited === 1)
  remove(CoverageModel, systemGenerated)
  return isVisited
}

export async function getMcp(setError: SetError) {
  try {
    const resp = await getCoverageList()
    const items = resp.items as CoverageResponse[]

    write(() => {
      items.forEach(element => {
        const existing = findOne(CoverageModel, {
          where: { coverageId: element.coverageId },
        })

        if (!existing) {
          const isSystemGeneratedVisited =
            removeSystemGeneratedCoverage(element)
          insert(CoverageModel, {
            _id: createId(),
            coverageId: element.coverageId,
            coverageDate: new Date(element.coverageDate),
            userName: element.userName,
            empId: element.empId,
            empName: element.empName,
            position: element.position,
            customerCode: element.customerCode,
            customerName: element.customerName,
            priority: element.priority,
            planned: element.planned,
            status: element.status,
            isVisited: element.visited || isSystemGeneratedVisited ? 1 : 0,
            updatedBy: element.empId,
            updatedDate: new Date(),
            createBy: element.empId,
            createDate: new Date(),
          })
        } else {
          const { visited, coverageDate, ...rest } = element
          upsert(CoverageModel, {
            ...existing,
            ...rest,
            coverageDate: new Date(coverageDate),
            isVisited: visited ? 1 : 0,
            updatedBy: element.empId,
            updatedDate: new Date(),
          })
        }
      })
    })
  } catch (error) {
    log.error("Getting of coverage not sync", error)
    setError("Getting of coverage not sync")
  }
}

export async function sendAndGetMcpLogs(setError: SetError) {
  try {
    const logs = query(CoverageLogsModel, { where: { converageLogsId: 0 } })
    if (logs.length < 1) {
      return
    }

    const resp = await sendCoverageLogs(
      logs.map(log => ({
        customerCode: log.customerCode,
        coverageId: null,
        userName: log.userName,
        logDate: log.logDate,
        latitude: log.latitude,
        longitude: log.longitude,
        transId: log._id,
      })),
    )
    const items = resp.data.items as CoverageLogsResponse[]

    write(() => {
      logs.forEach(log => {
        const responseItem = items.find(item => item.transId === log._id)
        if (responseItem) {
          update(CoverageLogsModel, log._id, {
            converageLogsId: responseItem.coverageLogId,
          })
        }
      })
    })
  } catch (error) {
    log.error("MCP Logs not sync", error)
    setError("MCP Logs not sync")
  }
}

export async function getCustomer(setError: SetError) {
  try {
    const resp = await getCustomers()
    const items = resp.items as CustomerResponse[]

    write(() => {
      items.forEach(element => {
        const existing = findOne(CustomerModel, {
          where: { code: element.code },
        })
        const lastmod = element.lastModificationTime ?? ""

        if (!existing) {
          insert(CustomerModel, {
            ...element,
            _id: createId(),
            lastModificationTime: lastmod,
            isUpdated: 1,
          })
        } else {
          upsert(CustomerModel, {
            ...existing,
            ...element,
            lastModificationTime: lastmod,
            // Stays 1 until the image is downloaded (see imageCustomer).
            isUpdated:
              lastmod !== existing.lastModificationTime ||
              existing.isUpdated === 1
                ? 1
                : 0,
          })
        }
      })
    })
  } catch (error) {
    log.error("Getting of customer not sync", error)
    setError("Getting of customer not sync")
  }
}

export async function productPartnerList(setError: SetError) {
  try {
    const resp = await getProductPartners()
    const products = resp.items as ProductPartnerResponse[]

    write(() => {
      products.forEach(val => {
        const existing = findOne(ProductPartnerModel, {
          where: { productPartnerId: val.id },
        })
        const lastmod = val.lastModificationTime ?? ""

        if (!existing) {
          const payload: ProductPartner = {
            _id: createId(),
            productPartnerId: val.id,
            packingType: val.productPacking,
            ...val,
            lastModificationTime: lastmod,
            isUpdated: 1,
          }
          insert(ProductPartnerModel, payload)
        } else {
          upsert(ProductPartnerModel, {
            ...existing,
            ...val,
            lastModificationTime: lastmod,
            packingType: val.productPacking,
            isUpdated: existing.lastModificationTime === lastmod ? 0 : 1,
          })
        }
      })
    })
  } catch (error) {
    log.error("Getting of product partner not sync", error)
    setError("Getting of product partner not sync")
  }
}

export async function getProductList(setError: SetError) {
  try {
    const resp = await getAllProducts()
    const products = resp.items as ProductResponse[]

    write(() => {
      products.forEach(val => {
        const existing = findOne(ProductModel, { where: { code: val.code } })
        const lastmod = val.lastModificationTime ?? ""

        if (!existing) {
          insert(ProductModel, {
            _id: createId(),
            code: val.code,
            name: val.name,
            statusCode: val.statusCode,
            statusName: val.statusName,
            lastModificationTime: lastmod,
            isUpdated: 1,
          })
        } else {
          upsert(ProductModel, {
            ...existing,
            ...val,
            lastModificationTime: lastmod,
            isUpdated: existing.lastModificationTime === lastmod ? 0 : 1,
          })
        }
      })
    })
  } catch (error) {
    log.error("Getting of product not sync", error)
    setError("Getting of product not sync")
  }
}

/** `imageDownload` resolves `undefined` for a file that failed (logged there). */
function logDownloads(label: string, results: (string | undefined)[]) {
  const failed = results.filter(path => !path).length
  if (failed > 0) {
    log.warn(
      `${label}: ${results.length - failed} downloaded, ${failed} failed`,
    )
  } else {
    log.info(`${label}: ${results.length} downloaded`)
  }
}

/**
 * A customer image is downloaded when the customer changed (`isUpdated`) or the
 * file is missing on the device, unless the server already said it has none
 * for this version of the customer.
 */
function needsImage(customer: Customer) {
  if (customer.isUpdated === 1) {
    return true
  }
  return (
    customer.imageNotFoundAt !== customer.lastModificationTime &&
    !isImageDownloaded(customer.code)
  )
}

export async function imageCustomer(setError: SetError) {
  try {
    const customers = query(CustomerModel, { filter: needsImage })
    if (customers.length === 0) {
      log.info("Customer images: all up to date")
      return
    }
    log.info(`Customer images: downloading ${customers.length}`)

    const results = await Promise.all(
      customers.map(async customer => ({
        customer,
        result: await imageDownloadWithStatus(
          `customers/${customer.code}/image`,
          customer.code,
        ),
      })),
    )

    // Only a downloaded or missing (404) image is done; failures retry next sync.
    write(() => {
      results.forEach(({ customer, result }) => {
        if (result.status === "downloaded") {
          update(CustomerModel, customer._id, { isUpdated: 0 })
        } else if (result.status === "notFound") {
          update(CustomerModel, customer._id, {
            isUpdated: 0,
            imageNotFoundAt: customer.lastModificationTime,
          })
        }
      })
    })

    const count = (status: string) =>
      results.filter(({ result }) => result.status === status).length
    const failed = count("failed")
    const summary = `Customer images: ${count("downloaded")} downloaded, ${count("notFound")} have no image on server, ${failed} failed`
    if (failed > 0) {
      log.warn(summary)
      setError(
        failedUploadMessage("Customer image not sync", failed, results.length),
      )
    } else {
      log.info(summary)
    }
  } catch (error) {
    log.error("Customer image not sync", error)
    setError("Customer image not sync")
  }
}

export async function productImage(setError: SetError) {
  try {
    const products = query(ProductModel, { where: { isUpdated: 1 } })

    const results = await Promise.all(
      products.map(item =>
        imageDownload(`products/${item.code}/image`, item.code),
      ),
    )
    logDownloads("Product images", results)
  } catch (error) {
    log.error("Product Image not sync", error)
    setError("Product Image not sync")
  }
}

/** Appends every image path of a transaction as an `images` file part. */
function appendImages(images: string[], formData: FormData) {
  images.forEach(imagePath => {
    if (!imagePath) {
      return
    }

    const fileName = imagePath.split("/").pop()
    if (!fileName) {
      return
    }

    // React Native's FormData accepts { uri, name, type } file parts.
    const file = {
      uri: imagePath.startsWith("file://") ? imagePath : `file://${imagePath}`,
      name: fileName,
      type: getFileType(fileName),
    }
    formData.append("images", file as unknown as Blob)
  })
}

function getFileType(fileName: string) {
  const name = fileName.toLowerCase()
  if (name.endsWith(".png")) {
    return "image/png"
  }
  if (name.endsWith(".gif")) {
    return "image/gif"
  }
  if (name.endsWith(".webp")) {
    return "image/webp"
  }
  if (name.endsWith(".pdf")) {
    return "application/pdf"
  }
  return "image/jpeg"
}

/** Throws on failure; `handleUploadMarketAnalysis` logs it per record. */
export async function uploadMarketAnalysis(data: MarketAnalysis) {
  const formData = new FormData()
  formData.append("MarketDate", data.docDate)
  formData.append("UserName", data.userName)
  formData.append("CustomerCode", data.customerCode)
  formData.append("MarketType", data.type)
  formData.append("Brand", data.brand)
  formData.append("Title", data.title)
  formData.append("Scheme", data.scheme)
  formData.append("Price", String(+data.price))
  formData.append("Remarks", data.remarks)
  formData.append("TransId", data._id)

  appendImages(data.images ?? [], formData)

  data.imageDetails.forEach((item, index) => {
    formData.append(
      `imageDetails[${index}][fileName]`,
      item.fileName.split("/").pop() ?? "",
    )
    formData.append(
      `imageDetails[${index}][latitude]`,
      item.latitude.toString(),
    )
    formData.append(
      `imageDetails[${index}][longitude]`,
      item.longitude.toString(),
    )
  })

  const resp = await uploadMarketAnalysisReport(formData)
  update(MarketAnalysisModel, data._id, { docId: resp.marketNo })
}

export async function handleUploadMarketAnalysis(setError: SetError) {
  try {
    const data = query(MarketAnalysisModel, { where: { docId: 0 } })
    const failed = await uploadPending(
      createLogger("Sync:MarketAnalysis"),
      data,
      uploadMarketAnalysis,
    )
    if (failed > 0) {
      setError(
        failedUploadMessage(
          "Uploading of market analysis not sync",
          failed,
          data.length,
        ),
      )
    }
  } catch (error) {
    log.error("Uploading of market analysis not sync", error)
    setError("Uploading of market analysis not sync")
  }
}

export async function getMapsettings(setError: SetError) {
  try {
    const resp = await getSettingsApi()
    const data = resp.mapSettings
    if (!data) {
      return
    }

    const existing = findOne(MapsSettingsModel)
    upsert(MapsSettingsModel, {
      ...existing,
      _id: existing?._id ?? createId(),
      customerColor: data.customerColor,
      visitedColor: data.visitedColor,
      employeeColor: data.employeeColor,
      employeeMissedColor: data.employeeMissedColor,
      supervisorColor: data.supervisorColor,
      circleColor: data.circleColor,
      hitRadius: data.hitRadius,
    })
  } catch (error) {
    log.error("Map settings not sync", error)
    setError("Map settings not sync")
  }
}

export async function handleOptionDemoGroup(setError: SetError) {
  try {
    const resp = (await getDemoGroups()) as OptionResponse[]

    write(() => {
      resp.forEach(val => {
        const existing = findOne(OptionModel, { where: { code: val.code } })

        upsert(OptionModel, {
          ...existing,
          _id: existing?._id ?? createId(),
          code: val.code,
          value: val.name,
          type: OptionTypeEnum.DEMO_GROUPS,
          subType: existing?.subType ?? [],
        })
      })
    })
  } catch (error) {
    log.error("Demo group option not sync", error)
    setError("Demo group option not sync")
  }
}

export async function handleOptionMarketTypes(setError: SetError) {
  try {
    const resp = (await getMarketTypes()) as OptionResponse[]

    write(() => {
      resp.forEach(val => {
        const existing = findOne(OptionModel, {
          where: { code: val.code, type: OptionTypeEnum.MARKET_TYPES },
        })

        upsert(OptionModel, {
          ...existing,
          _id: existing?._id ?? createId(),
          code: val.code,
          value: val.name,
          type: OptionTypeEnum.MARKET_TYPES,
          subType: existing?.subType ?? [],
        })
      })
    })
  } catch (error) {
    log.error("Market types options not sync", error)
    setError("Market types options not sync")
  }
}

export async function fetchDemo(setError: SetError) {
  try {
    const data = (await getDemo()) as DemoResponse[]
    const fileIds: string[] = []

    write(() => {
      data.forEach(val => {
        const { lastModificationTime, docDate, ...rest } = val
        const existing = findOne(DemoModel, { where: { code: val.code } })

        if (existing && lastModificationTime === existing.updatedAt) {
          return
        }

        upsert(DemoModel, {
          ...rest,
          _id: existing?._id ?? createId(),
          docDate: new Date(docDate),
          fileData: val.fileData ? val.fileData : "",
          updatedAt: lastModificationTime ?? "",
        })
        fileIds.push(val.imageFileObjectId)
      })
    })

    await Promise.all(
      fileIds.map(fileId => imageDownload(`files/${fileId}/download`, fileId)),
    )
  } catch (error) {
    log.error("Demo not Sync", error)
    setError("Demo not Sync")
  }
}
