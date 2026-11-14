import AsyncStorage from "@react-native-async-storage/async-storage"

export enum KEY {
  AUTHTOKEN = "AUTHTOKEN",
  USER = "USER",
  USER_ID = "USER_ID",
  TRANSACTION_DATA = "TRANSACTION_DATA",
}

export const saveStorage = async (key: KEY, data: unknown) => {
  await AsyncStorage.setItem(key, JSON.stringify(data))
}

export const getDataFromStorage = async <T = any>(
  key: KEY,
): Promise<T | null> => {
  const resp = await AsyncStorage.getItem(key)
  return resp ? (JSON.parse(resp) as T) : null
}

export const removeStorage = async (key: KEY) => {
  await AsyncStorage.removeItem(key)
}
