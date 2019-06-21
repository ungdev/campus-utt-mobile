import axios from 'axios'
import { AsyncStorage } from 'react-native'
import config from '../config'
import moment from 'moment'
import {
  ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRATION_KEY,
  CLIENT_ID_KEY,
  CLIENT_SECRET_KEY
} from '../constants/StorageKey'

const api = axios.create({
  baseURL: config.etu_utt_baseuri
})

export const getToken = async () => {
  const expiration_date = await AsyncStorage.getItem(
    ACCESS_TOKEN_EXPIRATION_KEY
  )
  if (expiration_date !== null && moment().isBefore(expiration_date * 1000)) {
    let token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
    return token
  } else {
    return renewAccessToken()
  }
}

export const renewAccessToken = async () => {
  try {
    let clientId = await AsyncStorage.getItem(CLIENT_ID_KEY)
    let clientSecret = await AsyncStorage.getItem(CLIENT_SECRET_KEY)
    if (!clientId || !clientSecret) return null
    const res = await axios.post(
      `${
        config.etu_utt_baseuri
      }oauth/token?grant_type=client_credentials&scope=${
        config.etu_utt_scope
      }&client_id=${clientId}&client_secret=${clientSecret}`
    )

    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, res.data.access_token)
    await AsyncStorage.setItem(ACCESS_TOKEN_EXPIRATION_KEY, res.data.expires)
    return res.data.access_token
  } catch (e) {
    console.log(e)
    throw 'NO_TOKEN'
  }
}

export const fetchUser = async () => {
  const token = await getToken()
  const res = await api.get('private/user/account', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data.data
}

export const fetchUEs = async () => {
  const token = await getToken()
  const res = await api.get('ues', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data.ues
}

export const fetchUEDetails = async slug => {
  const token = await getToken()
  const res = await api.get(`ues/${slug}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export const fetchUECommentaires = async slug => {
  const token = await getToken()
  const res = await api.get(`ues/${slug}/comments`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data.comments
}

export const setExpoPushToken = async pushToken => {
  const token = await getToken()
  const res = await api.post(
    `private/user/push-token`,
    { token: pushToken },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  return res
}
