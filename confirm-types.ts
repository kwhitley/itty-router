import { Router } from './src/itty-router'

interface MyRequest {
  cat: string
}

const router = Router<MyRequest>({
  routes: [
    ['FOO', /\d/, [request => request.method]]
  ]
})
