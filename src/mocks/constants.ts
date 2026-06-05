export const LOGIN_DEMO_USER_IDS: ReadonlyArray<string> = [
  "u-admin",
  "u-cliente",
]

export const isLoginDemoUser = (userId: string): boolean =>
  LOGIN_DEMO_USER_IDS.includes(userId)
