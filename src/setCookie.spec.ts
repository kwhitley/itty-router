import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { status } from './status'
import {setCookie} from "./setCookie";

describe('setCookie("name", "value"): Response', () => {
  it('creates a response with the set-cookie header', async () => {
    const response = status(200)
    setCookie(response, "name", "value")
    expect(response.headers.get("set-cookie")).toBe("name=value")
  })
  it('creates a response with the set-cookie header using options', async () => {
    const response = status(200)
    setCookie(response, "name", "value", {
      httpOnly: true,
      secure: true,
    })
    expect(response.headers.get("set-cookie")).toBe("name=value; HttpOnly; Secure")
  })
  it('creates a response with the set-cookie header using all options', async () => {
    const response = status(200)
    const now = new Date();
    setCookie(response, "name", "value", {
      httpOnly: true,
      secure: true,
      expires: now,
      maxAge: 1000,
      path: "/",
      domain: "itty.dev",
      partitioned: true,
      sameSite: "Strict"
    })
    expect(response.headers.get("set-cookie")).toBe(`name=value; Domain=itty.dev; Path=/; HttpOnly; Secure; Expires=${now.toUTCString()}; Max-Age=1000; Partitioned; SameSite=Strict`)
  })
})
