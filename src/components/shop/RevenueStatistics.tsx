"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/utils/shopUtils"
import { Loader2, Calendar, TrendingUp, ShoppingCart, DollarSign } from "lucide-react"

interface RevenueData {
    date: string
    revenue?: string
    order_count?: number
    product_name?: string
    toppings?: string | null
    total_quantity?: string
    total_revenue?: string
    total_discount?: string
    topping_name?: string
}

export default function RevenueStatistics() {
    const [data, setData] = useState<RevenueData[]>([])
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<"day" | "month">("day")
    const [scope, setScope] = useState<"revenue" | "product" | "toppings" | "discount">("revenue")

    // Initialize with current month
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

    const fetchData = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams({
                startDate,
                endDate,
                type,
                scope
            })
            const response = await fetch(`${process.env.API_URL}${process.env.PREFIX_API}revenues?${queryParams}`)
            const result = await response.json()
            if (result.status === "success") {
                setData(result.data.data)
            }
        } catch (error) {
            console.error("Error fetching revenue data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Calculate summary statistics
    const summary = useMemo(() => {
        if (scope === "revenue") {
            const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
            const totalOrders = data.reduce((sum, item) => sum + Number(item.order_count || 0), 0)
            return { totalRevenue, totalOrders, avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0 }
        } else if (scope === "discount") {
            const totalDiscount = data.reduce((sum, item) => sum + Number(item.total_discount || 0), 0)
            const totalOrders = data.reduce((sum, item) => sum + Number(item.order_count || 0), 0)
            return { totalDiscount, totalOrders, avgDiscountValue: totalOrders > 0 ? totalDiscount / totalOrders : 0 }
        } else {
            const totalRevenue = data.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0)
            const totalQuantity = data.reduce((sum, item) => sum + Number(item.total_quantity || 0), 0)
            return { totalRevenue, totalQuantity }
        }
    }, [data, scope])

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thống kê doanh thu</h2>
                <p className="text-gray-500">Theo dõi và phân tích doanh thu của cửa hàng</p>
            </div>

            {/* Filters */}
            <Card className="mb-6 border-green-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Date Range */}
                        <div className="lg:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Khoảng thời gian</label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="flex-1"
                                />
                                <span className="flex items-center text-gray-500">-</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nhóm theo</label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={type}
                                onChange={(e) => setType(e.target.value as "day" | "month")}
                            >
                                <option value="day">Theo ngày</option>
                                <option value="month">Theo tháng</option>
                            </select>
                        </div>

                        {/* Scope Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Loại báo cáo</label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={scope}
                                onChange={(e) => setScope(e.target.value as "revenue" | "product" | "toppings" | "discount")}
                            >
                                <option value="revenue">Tổng doanh thu</option>
                                <option value="product">Theo sản phẩm</option>
                                <option value="toppings">Theo topping</option>
                                <option value="discount">Chiết khấu</option>
                            </select>
                        </div>

                        {/* Apply Button */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 opacity-0">Action</label>
                            <Button
                                onClick={fetchData}
                                disabled={loading}
                                className="w-full h-10 bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Áp dụng
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {!loading && data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {scope === "revenue" ? (
                        <>
                            <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                                            <p className="text-2xl font-bold text-green-600 mt-1">
                                                {formatPrice(summary.totalRevenue || 0)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                                {summary.totalOrders}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Giá trị TB/đơn</p>
                                            <p className="text-2xl font-bold text-purple-600 mt-1">
                                                {formatPrice(summary.avgOrderValue || 0)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <TrendingUp className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : scope === "discount" ? (
                        <>
                            <Card className="border-red-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tổng chiết khấu</p>
                                            <p className="text-2xl font-bold text-red-600 mt-1">
                                                {formatPrice(summary.totalDiscount || 0)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-red-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                                {summary.totalOrders}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">TB Chiết khấu/đơn</p>
                                            <p className="text-2xl font-bold text-orange-600 mt-1">
                                                {formatPrice(summary.avgDiscountValue || 0)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <TrendingUp className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                                            <p className="text-2xl font-bold text-green-600 mt-1">
                                                {formatPrice(summary.totalRevenue || 0)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tổng số lượng</p>
                                            <p className="text-2xl font-bold text-orange-600 mt-1">
                                                {summary.totalQuantity}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <ShoppingCart className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>


                        </>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
                    <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Data Display */}
            {!loading && data.length > 0 && (
                <div className="grid gap-4">
                    {scope === "revenue" ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.map((item, index) => (
                                <Card key={index} className="border-green-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                                    <CardHeader className="pb-3 px-6 pt-6">
                                        <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                            {item.date}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-500">Doanh thu</span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {formatPrice(Number(item.revenue))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                                                <span className="text-sm text-gray-500">Số đơn</span>
                                                <span className="text-lg font-semibold text-gray-700">
                                                    {item.order_count}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : scope === "discount" ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.map((item, index) => (
                                <Card key={index} className="border-red-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                                    <CardHeader className="pb-3 px-6 pt-6">
                                        <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-red-600" />
                                            {item.date}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-500">Chiết khấu</span>
                                                <span className="text-2xl font-bold text-red-600">
                                                    {formatPrice(Number(item.total_discount))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                                                <span className="text-sm text-gray-500">Số đơn</span>
                                                <span className="text-lg font-semibold text-gray-700">
                                                    {item.order_count}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-gray-200 shadow-sm">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gradient-to-r from-green-50 to-green-100 text-gray-700 font-semibold">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Thời gian</th>
                                                <th className="px-6 py-4 text-left">Sản phẩm</th>
                                                <th className="px-6 py-4 text-left">Topping</th>
                                                <th className="px-6 py-4 text-right">Số lượng</th>
                                                <th className="px-6 py-4 text-right">Doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {data.map((item, index) => (
                                                <tr key={index} className="hover:bg-green-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                        {item.date}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">
                                                        {item.product_name || item.topping_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px]" title={item.toppings || ""}>
                                                        <span className="inline-block px-2 py-1 bg-gray-100 rounded-full">
                                                            {item.toppings || "Không"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                        {item.total_quantity}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-green-600 whitespace-nowrap">
                                                        {formatPrice(Number(item.total_revenue))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && data.length === 0 && (
                <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có dữ liệu</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            Không tìm thấy dữ liệu doanh thu trong khoảng thời gian đã chọn. Vui lòng thử chọn khoảng thời gian khác.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
