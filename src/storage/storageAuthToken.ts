import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_STORAGE } from './storageConfig';

type StorageAuthTokenProps = {
  token: string
  refresh_token: string
}

export async function storageAuthTokenSave({ token, refresh_token }: StorageAuthTokenProps) {
  const { setItem } = AsyncStorage

  await setItem(AUTH_TOKEN_STORAGE, JSON.stringify({ token, refresh_token }))
}

export async function storageAuthTokenGet() {
  const { getItem } = AsyncStorage

  const response = await getItem(AUTH_TOKEN_STORAGE)

  const { refresh_token, token }: StorageAuthTokenProps = response ? JSON.parse(response) : {}

  return { token, refresh_token }
}

export async function storageAuthTokenRemove() {
  const { removeItem } = AsyncStorage

  await removeItem(AUTH_TOKEN_STORAGE)
}