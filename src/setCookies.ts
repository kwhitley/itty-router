type CookieOptions = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  partitioned?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export const setCookies = (response: Response, ...cookies: CookieOptions[]): Response => {
  for (let options of cookies) {
    response.headers.append("Set-Cookie", `${options.name}=${options.value}\
${options?.domain ? `; Domain=${options.domain}`: ""}\
${options?.path ? `; Path=${options?.path}`: ""}\
${options?.httpOnly ? `; HttpOnly`: ""}\
${options?.secure ? `; Secure`: ""}\
${options?.expires? `; Expires=${options.expires.toUTCString()}`: ""}\
${options?.maxAge? `; Max-Age=${options.maxAge}`: ""}\
${options?.partitioned? `; Partitioned`: ""}\
${options?.sameSite? `; SameSite=${options.sameSite}`: ""}`)
  }
  return response;
}
