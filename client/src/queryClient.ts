import { QueryClient } from 'react-query';
import { request, RequestDocument } from 'graphql-request';

// import { getTodos, postTodo } from '../my-api'

type AnyOBJ = { [key: string]: any }
//react query의 장점 전체적으로 캐시를 사용하지 않음 / 새로고침을 하면 불러옴
export const getClient = (() => {
  let client: QueryClient | null = null;
  return () => {
    if (!client) 
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity, 
          cacheTime: Infinity,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
      },
    })
    return client
  }
})()

const BASE_URL = 'http://localhost:8000/graphql'

export const restFetcher = async ({
  method,
  path,
  body,
  params
} : {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  body?: AnyOBJ
  params?: AnyOBJ
}) => {
  try {
    let url = `${BASE_URL}${path}`
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': BASE_URL
      }
    }
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += '?' + searchParams.toString()
    }

    if (body) fetchOptions.body = JSON.stringify(body)

    const res = await fetch(url, fetchOptions)
    const json = await res.json()
    return json
  } catch (err) {
    console.error(err)
  }
}

export const graphqlFetcher = (query: RequestDocument, variables = {}) => request
(BASE_URL, query, variables)

export const QueryKeys = {
  PRODUCTS: 'PRODUCTS',
  CART: 'CART',
}