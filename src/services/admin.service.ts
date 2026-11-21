import api from "@/config/api"

export async function getDemo() {
  const resp = await api.get("demo")

  return resp.data.items
}
