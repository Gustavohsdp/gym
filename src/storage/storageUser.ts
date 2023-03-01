import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserDTO } from "@dtos/UserDTO";
import { USER_STORAGE } from "./storageConfig";

export async function storageUserSave(user: UserDTO) {
  const { setItem } = AsyncStorage

  await setItem(USER_STORAGE, JSON.stringify(user))
}

export async function storageUserGet() {
  const { getItem } = AsyncStorage

  const storage = await getItem(USER_STORAGE)

  const user: UserDTO = storage ? JSON.parse(storage) : {}

  return user
}

export async function storageUserRemove() {
  const { removeItem } = AsyncStorage

  await removeItem(USER_STORAGE)
}