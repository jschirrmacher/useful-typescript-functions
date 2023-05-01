import { describe, expect, it, vi } from "vitest"
import { oneByOne } from "./onebyone.js"

describe("oneByOne", () => {
  it("should call the function for each array element", async () => {
    const func = vi.fn()
    await oneByOne([func, func])
    expect(func).toBeCalledTimes(2)
  })

  it("should resolve to the return value of the last function that is executed", async () => {
    expect(await oneByOne([() => Promise.resolve(1), () => Promise.resolve(2)])).toBe(2)
  })

  it("should give the result of each function as parameter to next in row", async () => {
    expect(
      await oneByOne([() => Promise.resolve(41), (val: number) => Promise.resolve(val + 1)])
    ).toBe(42)
  })

  it("should return the value created by the chain of functions", async () => {
    let num = 1
    const func2 = (prev: number[]) => (prev || []).concat(num++)
    expect(await oneByOne<number[]>([func2, func2, func2, func2])).toEqual([1, 2, 3, 4])
  })

  it("should work without defining functions explicitly as asynchronous", async () => {
    const readUsers = () => Promise.resolve([{ name: "user1" }, { name: "user2" }])
    const readDetails = (users: { name: string }[]) =>
      Promise.all(
        users.map(user => Promise.resolve({ ...user, details: `details of ${user.name}` }))
      )
    expect(await oneByOne([readUsers, readDetails])).toEqual([
      { name: "user1", details: "details of user1" },
      { name: "user2", details: "details of user2" },
    ])
  })
})
