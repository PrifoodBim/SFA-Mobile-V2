import {
  createId,
  findOne,
  query,
  remove,
  update,
  upsert,
  upsertMany,
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
import { Option, OptionModel } from "@/db/models/Option.model"
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
import { DOWNLOAD_CONCURRENCY, mapLimit } from "@/utils/async.utils"
import { createLogger } from "@/utils/logger"
import { failedUploadMessage, uploadPending } from "../uploadPending"

const log = createLogger("Sync")

type SetError = (error: string) => void

export type CoverageResponse = Omit<
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

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Saves the MCP coverage list from the server with one read and one write.
 *
 * A new coverage replaces the coverage created on mobile for an unplanned
 * customer (`coverageId` 0) on the same customer and day, keeping its visited
 * flag. Existing coverages are updated only when `updateExisting` is set
 * (the login screen only adds missing ones).
 */
export function saveCoverageList(
  items: CoverageResponse[],
  { updateExisting }: { updateExisting: boolean },
) {
  const all = query(CoverageModel)
  const byCoverageId = new Map<number, Coverage>()
  const systemGeneratedByCustomer = new Map<string, Coverage[]>()
  for (const coverage of all) {
    if (coverage.coverageId === 0) {
      const list = systemGeneratedByCustomer.get(coverage.customerCode) ?? []
      list.push(coverage)
      systemGeneratedByCustomer.set(coverage.customerCode, list)
    } else {
      byCoverageId.set(coverage.coverageId, coverage)
    }
  }

  const toWrite = new Map<number, Coverage>()
  const toRemove: Coverage[] = []
  const now = new Date()

  for (const element of items) {
    const existing = byCoverageId.get(element.coverageId)
    const coverageDate = new Date(element.coverageDate)
    let doc: Coverage

    if (!existing) {
      const candidates = systemGeneratedByCustomer.get(element.customerCode)
      const systemGenerated =
        candidates?.filter(c => sameDay(c.coverageDate, coverageDate)) ?? []
      if (systemGenerated.length > 0) {
        toRemove.push(...systemGenerated)
        systemGeneratedByCustomer.set(
          element.customerCode,
          candidates!.filter(c => !systemGenerated.includes(c)),
        )
      }
      const isSystemGeneratedVisited = systemGenerated.some(
        c => c.isVisited === 1,
      )
      doc = {
        _id: createId(),
        coverageId: element.coverageId,
        coverageDate,
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
        updatedDate: now,
        createBy: element.empId,
        createDate: now,
      }
    } else if (updateExisting) {
      const { visited, coverageDate: _date, ...rest } = element
      doc = {
        ...existing,
        ...rest,
        coverageDate,
        isVisited: visited ? 1 : 0,
        updatedBy: element.empId,
        updatedDate: now,
      }
    } else {
      continue
    }

    byCoverageId.set(element.coverageId, doc)
    toWrite.set(element.coverageId, doc)
  }

  write(() => {
    remove(CoverageModel, toRemove)
    upsertMany(CoverageModel, [...toWrite.values()])
  })
}

export async function getMcp(setError: SetError) {
  try {
    const resp = await getCoverageList()
    saveCoverageList(resp.items as CoverageResponse[], {
      updateExisting: true,
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

    const byTransId = new Map(items.map(item => [item.transId, item]))
    write(() => {
      logs.forEach(log => {
        const responseItem = byTransId.get(log._id)
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

    // One read + one bulk write instead of a full-table findOne per item.
    const byCode = new Map<string, Customer>()
    for (const doc of query(CustomerModel)) {
      byCode.set(doc.code, doc)
    }

    for (const element of items) {
      const existing = byCode.get(element.code)
      const lastmod = element.lastModificationTime ?? ""

      byCode.set(
        element.code,
        !existing
          ? ({
              ...element,
              _id: createId(),
              lastModificationTime: lastmod,
              isUpdated: 1,
            } as Customer)
          : ({
              ...existing,
              ...element,
              lastModificationTime: lastmod,
              // Stays 1 until the image is downloaded (see imageCustomer).
              isUpdated:
                lastmod !== existing.lastModificationTime ||
                existing.isUpdated === 1
                  ? 1
                  : 0,
            } as Customer),
      )
    }

    const changed = new Set(items.map(element => element.code))
    write(() =>
      upsertMany(
        CustomerModel,
        [...byCode.values()].filter(doc => changed.has(doc.code)),
      ),
    )
  } catch (error) {
    log.error("Getting of customer not sync", error)
    setError("Getting of customer not sync")
  }
}

export async function productPartnerList(setError: SetError) {
  try {
    const resp = await getProductPartners()
    const products = resp.items as ProductPartnerResponse[]

    // Load existing rows once and index them by productPartnerId. Looking each
    // item up with findOne() scans the whole table (json_extract, no index),
    // which made this sync O(n²) for ~10k partners.
    const existingById = new Map<number, ProductPartner>()
    for (const doc of query(ProductPartnerModel)) {
      existingById.set(doc.productPartnerId, doc)
    }

    const docs = products.map(val => {
      const existing = existingById.get(val.id)
      const doc = buildPartner(val, existing)
      existingById.set(val.id, doc)
      return doc
    })

    write(() =>
      upsertMany(ProductPartnerModel, [
        ...new Map(docs.map(doc => [doc.productPartnerId, doc])).values(),
      ]),
    )
  } catch (error) {
    log.error("Getting of product partner not sync", error)
    setError("Getting of product partner not sync")
  }
}

function buildPartner(
  val: ProductPartnerResponse,
  existing: ProductPartner | undefined,
): ProductPartner {
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
    return payload
  }
  return {
    ...existing,
    ...val,
    lastModificationTime: lastmod,
    packingType: val.productPacking,
    isUpdated: existing.lastModificationTime === lastmod ? 0 : 1,
  } as ProductPartner
}

export async function getProductList(setError: SetError) {
  try {
    const resp = await getAllProducts()
    const products = resp.items as ProductResponse[]

    // One read + one bulk write instead of a full-table findOne per item.
    const byCode = new Map<string, Product>()
    for (const doc of query(ProductModel)) {
      byCode.set(doc.code, doc)
    }

    for (const val of products) {
      const existing = byCode.get(val.code)
      const lastmod = val.lastModificationTime ?? ""

      byCode.set(
        val.code,
        !existing
          ? ({
              _id: createId(),
              code: val.code,
              name: val.name,
              statusCode: val.statusCode,
              statusName: val.statusName,
              lastModificationTime: lastmod,
              isUpdated: 1,
            } as Product)
          : ({
              ...existing,
              ...val,
              lastModificationTime: lastmod,
              isUpdated: existing.lastModificationTime === lastmod ? 0 : 1,
            } as Product),
      )
    }

    const changed = new Set(products.map(val => val.code))
    write(() =>
      upsertMany(
        ProductModel,
        [...byCode.values()].filter(doc => changed.has(doc.code)),
      ),
    )
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

    const results = await mapLimit(
      customers,
      DOWNLOAD_CONCURRENCY,
      async customer => ({
        customer,
        result: await imageDownloadWithStatus(
          `customers/${customer.code}/image`,
          customer.code,
        ),
      }),
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

    const results = await mapLimit(products, DOWNLOAD_CONCURRENCY, item =>
      imageDownload(`products/${item.code}/image`, item.code),
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

/**
 * Inserts or updates the options of one type by code, keeping each option's
 * `subType`. Looks up existing options by code *and* type, so an option of
 * another type with the same code is never overwritten.
 */
export function saveOptions(
  type: OptionTypeEnum,
  items: OptionResponse[],
  { updateExisting = true }: { updateExisting?: boolean } = {},
) {
  const byCode = new Map<string, Option>()
  for (const option of query(OptionModel, { where: { type } })) {
    byCode.set(option.code, option)
  }

  const toWrite = new Map<string, Option>()
  for (const val of items) {
    const existing = byCode.get(val.code)
    if (existing && !updateExisting) {
      continue
    }
    const doc: Option = {
      ...existing,
      _id: existing?._id ?? createId(),
      code: val.code,
      value: val.name,
      type,
      subType: existing?.subType ?? [],
    }
    byCode.set(val.code, doc)
    toWrite.set(val.code, doc)
  }

  write(() => upsertMany(OptionModel, [...toWrite.values()]))
}

export async function handleOptionDemoGroup(setError: SetError) {
  try {
    const resp = (await getDemoGroups()) as OptionResponse[]

    saveOptions(OptionTypeEnum.DEMO_GROUPS, resp)
  } catch (error) {
    log.error("Demo group option not sync", error)
    setError("Demo group option not sync")
  }
}

export async function handleOptionMarketTypes(setError: SetError) {
  try {
    const resp = (await getMarketTypes()) as OptionResponse[]

    saveOptions(OptionTypeEnum.MARKET_TYPES, resp)
  } catch (error) {
    log.error("Market types options not sync", error)
    setError("Market types options not sync")
  }
}

export async function fetchDemo(setError: SetError) {
  try {
    const data = (await getDemo()) as DemoResponse[]
    const fileIds: string[] = []

    const byCode = new Map<string, Demo>()
    for (const demo of query(DemoModel)) {
      byCode.set(demo.code, demo)
    }

    const toWrite = new Map<string, Demo>()
    for (const val of data) {
      const { lastModificationTime, docDate, ...rest } = val
      const existing = byCode.get(val.code)

      if (existing && (lastModificationTime ?? "") === existing.updatedAt) {
        continue
      }

      const doc = {
        ...existing,
        ...rest,
        _id: existing?._id ?? createId(),
        docDate: new Date(docDate),
        fileData: val.fileData ? val.fileData : "",
        updatedAt: lastModificationTime ?? "",
      } as Demo
      byCode.set(val.code, doc)
      toWrite.set(val.code, doc)
      fileIds.push(val.imageFileObjectId)
    }

    write(() => upsertMany(DemoModel, [...toWrite.values()]))

    const results = await mapLimit(
      [...new Set(fileIds.filter(Boolean))],
      DOWNLOAD_CONCURRENCY,
      fileId => imageDownload(`files/${fileId}/download`, fileId),
    )
    logDownloads("Demo images", results)
  } catch (error) {
    log.error("Demo not Sync", error)
    setError("Demo not Sync")
  }
}
