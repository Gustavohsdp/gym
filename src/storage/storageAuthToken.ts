import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_STORAGE } from './storageConfig';

export async function storageAuthTokenSave(token: string) {
  const { setItem } = AsyncStorage

  await setItem(AUTH_TOKEN_STORAGE, token)
}

export async function storageAuthTokenGet() {
  const { getItem } = AsyncStorage

  const token = await getItem(AUTH_TOKEN_STORAGE)

  return token
}

export async function storageAuthTokenRemove() {
  const { removeItem } = AsyncStorage

  await removeItem(AUTH_TOKEN_STORAGE)
}