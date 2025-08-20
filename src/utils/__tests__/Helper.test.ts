import {
  extractValuesByKey,
  parseCookie,
  base64Encode,
  base64Decode,
  dateFormat,
  changeToSlug,
  capitalize,
  capitalizeFirstLetter,
  formatView,
  formatNum,
  convertImages,
} from "@/utils/Helper"

describe("Helper utils (pure)", () => {
  test("extractValuesByKey", () => {
    const arr = [{ id: 1, name: "A" }, { id: 2, name: "B" }]
    expect(extractValuesByKey(arr, "id")).toEqual([1, 2])
  })

  test("parseCookie", () => {
    const cookies = parseCookie("foo=bar; test=123")
    expect(cookies.foo).toBe("bar")
    expect(cookies.test).toBe("123")
  })

  test("base64 encode/decode", () => {
    const s = "hello"
    expect(base64Decode(base64Encode(s))).toBe(s)
  })

  test("dateFormat dd/mm/yyyy", () => {
    expect(dateFormat("2024-01-15")).toBe("15/1/2024")
  })

  test("changeToSlug converts Vietnamese diacritics", () => {
    expect(changeToSlug("Trà Sữa Đặc Biệt & Kem")).toBe("tra-sua-dac-biet-va-kem")
  })

  test("capitalize and capitalizeFirstLetter", () => {
    expect(capitalize("hello")).toBe("Hello")
    expect(capitalizeFirstLetter("world")).toBe("W")
    expect(capitalize("")).toBe("")
  })

  test("formatView and formatNum", () => {
    expect(formatView(1200)).toBe("1.2K")
    expect(formatNum(1234567)).toBe("1,234,567")
  })

  test("convertImages centers images", () => {
    const html = "<div style=\"text-align:none;\"><img src=\"a\" /></div>"
    const out = convertImages(html)
    expect(out).toContain('text-align:center;')
  })
})


