import { describe, expect, it, vitest } from "vitest"

import FileSystem from "./FileSystem"
import Account from "./Account"

describe("#deposit", () => {
  it("adds the amount to the balance", async () => {
    const account = await createAccount("Rupam Das", 0)
    const amount = 50000
    vitest
      .spyOn(FileSystem, "write")
      .mockReturnValue(Promise.resolve())

    await account.deposit(amount)

    expect(account.balance).toBe(amount)

    expect(spy).toBeCalledWith(account.filePath, amount)
  })
})

describe("#withdraw", () => {
  it("subtracts the amount from the balance", () => {
    // Your test goes here
  })
})

async function createAccount(name, balance) {
  const spy = vitest
    .spyOn(FileSystem, "read")
    .mockReturnValue(Promise.resolve(balance))
  const account = await Account.find(name)

  return account
}
