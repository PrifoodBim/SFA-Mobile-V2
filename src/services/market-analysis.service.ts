import api from "@/config/api"

export const uploadMarketAnalysisReport = async (formData: FormData) => {
  const resp = await api.post("market-record", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return resp.data
}
