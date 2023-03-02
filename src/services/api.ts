import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken';
import { AppError } from '@utils/AppError';
import axios, { AxiosError, AxiosInstance } from 'axios';

type SignOut = () => void;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
}

const api = axios.create({
  baseURL: 'http://192.168.5.213:3333',
}) as APIInstanceProps

let faildQueue: PromiseType[] = [];
let isRefreshing: boolean = false;

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use((response) => {
    return response;
  }, async (requestError) => {
    if (requestError?.response?.status === 401) {
      if (requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
        const { refresh_token } = await storageAuthTokenGet()

        if (!refresh_token) {
          signOut()
          return Promise.reject(requestError)
        }

        const originRequestConfig = requestError.config;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            faildQueue.push({
              onSuccess: (token: string) => {
                originRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                resolve(api(originRequestConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              }
            })
          })
        }

        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await api.post('/sessions/refresh-token', { refresh_token });
            await storageAuthTokenSave({
              token: data.token,
              refresh_token: data.refresh_token
            })

            if (originRequestConfig.data) {
              originRequestConfig.data = JSON.parse(originRequestConfig.data)
            }

            originRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            faildQueue.forEach(request => {
              request.onSuccess(data.token)
            })

            console.log('TOKEN ATUALIZADO')

            resolve(api(originRequestConfig))

          } catch (error: any) {
            faildQueue.forEach(request => {
              request.onFailure(error)
            })

            signOut()
            reject(error)
          } finally {
            isRefreshing = false;
            faildQueue = [];
          }
        })

      }

      signOut()
    }


    if (requestError.response && requestError.response.data) {
      return Promise.reject(new AppError(requestError.response.data.message));
    } else {
      return Promise.reject(requestError);
    }
  })

  return () => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}



export { api };

