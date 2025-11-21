"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = "Tìm kiếm trà sữa..." }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Debounce search để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, onSearch])

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 border-green-200 focus:border-green-500 focus:ring-green-500"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  )
}
