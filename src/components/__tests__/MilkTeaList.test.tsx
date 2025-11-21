import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import MilkTeaList from "@/components/menu/MilkTeaList"
import { act } from "react-dom/test-utils"
import type { MilkTea } from "@/types/shop"

const makeMilkTea = (id: number, name: string, description = ""): MilkTea => ({
  id,
  name,
  description,
  base_price: 10000,
  image: "",
  is_active: 1,
}) as unknown as MilkTea

describe("MilkTeaList search integration", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  test("filters items by search query (substring)", async () => {
    const milkTeas = [
      makeMilkTea(1, "Trà sữa trân châu"),
      makeMilkTea(2, "Hồng trà", "vị thơm đậm")
    ]

    const getQty = () => 1
    const setQty = jest.fn()
    const addToCart = jest.fn()
    const formatPrice = (n: number) => `${n}`

    render(
      <MilkTeaList
        milkTeas={milkTeas}
        isLoading={false}
        getQuantity={getQty}
        updateQuantity={setQty}
        handleAddToCart={addToCart}
        formatPrice={formatPrice}
      />
    )

    const input = screen.getByPlaceholderText(/tìm kiếm trà sữa/i)
    await userEvent.type(input, "hong")

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.queryByText(/Trà sữa trân châu/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Hồng trà/i)).toBeInTheDocument()
  })
})


