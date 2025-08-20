import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SearchBar from "@/components/SearchBar"
import { act } from "react"

jest.mock("lucide-react", () => ({
  Search: () => null,
  X: () => null,
}))

describe("SearchBar", () => {
  let user: ReturnType<typeof userEvent.setup>
  beforeEach(() => {
    jest.useFakeTimers()
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  test("calls onSearch with debounced input and clears", async () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/tìm kiếm trà sữa/i)
    await user.type(input, "tra sua")

    // advance debounce
    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(onSearch).toHaveBeenLastCalledWith("tra sua")

    // click clear button
    const clearBtn = screen.getByRole("button")
    await user.click(clearBtn)
    expect(onSearch).toHaveBeenLastCalledWith("")
  },10000)
})



