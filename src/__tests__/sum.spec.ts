import { describe, expect, it } from "vitest"
import { sum } from "#src/utils/sum.ts"
describe("sum function", () => {
  it("adds two numbers correctly", () => {
    expect(sum(1, 2)).toEqual(3)
    expect(sum(5, 7)).toEqual(12)
    expect(sum(-1, 1)).toEqual(0)
  })
})
