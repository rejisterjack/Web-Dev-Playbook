import { sum } from "../sum"

test("sum function test cases", () => {
  const result = sum(1, 2)
  expect(result).toBe(3)
})
