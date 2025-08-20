import {
  formatPrice,
  formatDateTime,
  formatInputNumber,
  calculateTotalCartPrice,
  sortOrders,
  validateCashPayment,
  getQuantity,
  updateQuantity,
} from "@/utils/shopUtils"
import type { CartItem, Order } from "@/types/shop"

describe("shopUtils", () => {
  test("formatPrice formats VND correctly", () => {
    expect(formatPrice(15000)).toMatch(/15.000\s?₫|₫\s?15.000/)
  })

  test("formatDateTime returns a valid VN string", () => {
    const result = formatDateTime(new Date("2024-01-02T03:04:00Z"))
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  test("formatInputNumber strips non-digits and groups", () => {
    expect(formatInputNumber("12a3.45")).toBe("12.345")
    expect(formatInputNumber("")).toBe("")
  })

  test("calculateTotalCartPrice computes subtotal - discount (locked only)", () => {
    const cart: CartItem[] = [
      {
        id: 1,
        product_id: 10,
        product_name: "A",
        product_price: 10000,
        size_id: 1,
        size_price: 2000,
        quantity: 2,
        sweetness_id: "4",
        ice_id: "3",
        notes: "",
        toppings: [
          { id: 1, name: "Pearl", price: 3000, is_active: 1 },
        ],
      },
    ] as unknown as CartItem[]

    // subtotal = base(10000) + size(2000) + toppings(3000) = 15000 per item
    // quantity 2 => 30000 total; discount applied only when locked
    expect(calculateTotalCartPrice(cart, 5000, false)).toBe(30000)
    expect(calculateTotalCartPrice(cart, 5000, true)).toBe(25000)
  })

  test("sortOrders puts pending first then by time", () => {
    const orders: Order[] = [
      { id: 1, is_completed: 1, order_time: new Date("2024-01-02T10:00:00Z") } as Order,
      { id: 2, is_completed: 0, order_time: new Date("2024-01-02T09:00:00Z") } as Order,
      { id: 3, is_completed: 0, order_time: new Date("2024-01-02T08:00:00Z") } as Order,
    ]

    const sorted = sortOrders(orders)
    expect(sorted.map(o => o.id)).toEqual([3, 2, 1])
  })

  test("validateCashPayment returns proper messages", () => {
    expect(validateCashPayment(0, 10000)).toBe("Vui lòng nhập số tiền khách đưa")
    const msg = validateCashPayment(5000, 10000)
    expect(msg).toContain("Số tiền không đủ")
    expect(validateCashPayment(15000, 10000)).toBe("")
  })

  test("getQuantity and updateQuantity", () => {
    const q = { 1: 2 }
    expect(getQuantity(q, 1)).toBe(2)
    expect(getQuantity(q, 2)).toBe(0)

    const updated = updateQuantity(q, 2, 5)
    expect(updated[2]).toBe(5)

    const unchanged = updateQuantity(q, 2, -1)
    expect(unchanged).toBe(q)
  })
})


