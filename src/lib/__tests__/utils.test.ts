import { cn } from "@/lib/utils"

describe("cn", () => {
  test("merges conditional class names", () => {
    const a = cn("btn", ["primary"], { disabled: false, active: true })
    expect(a).toContain("btn")
    expect(a).toContain("primary")
    expect(a).toContain("active")
    expect(a).not.toContain("disabled")
  })
})



