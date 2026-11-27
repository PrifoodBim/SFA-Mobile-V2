import api, { UPLOAD_TIMEOUT } from "@/config/api"

export const uploadMarketAnalysisReport = async (formData: FormData) => {
  const resp = await api.post("market-record", formData, {
    timeout: UPLOAD_TIMEOUT,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return resp.data
}
