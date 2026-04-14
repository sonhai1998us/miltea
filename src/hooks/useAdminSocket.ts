"use client"

import { useEffect, useCallback } from 'react'
import { getSocket } from './useSocket'
import { ShopService } from '@/services/shopService'
import { Order } from '@/types/shop'

/**
 * Hook kết nối socket cho cả Admin và Khách Hàng.
 * Nếu là Admin, sẽ join vào phòng 'admin' để nhận 'order:new'.
 * Còn lại, mọi client (Admin lẫn người dùng) đều lắng nghe 'order:refresh' 
 * để cập nhật danh sách đơn hàng khi có thay đổi (sửa/xoá đơn).
 */
export function useOrderSocket(isCustomer: boolean, setOrders: (orders: Order[]) => void) {
  const refreshOrders = useCallback(async () => {
    const orders = await ShopService.fetchOrders()
    setOrders(orders)
  }, [setOrders])

  useEffect(() => {
    const socket = getSocket()

    if (!socket.connected) {
      socket.connect()
    }

    // Nếu không phải khách, tham gia phòng admin để nhận thông báo đơn mới
    if (!isCustomer) {
      socket.emit('join_admin')
    }

    const onOrderNew = () => { refreshOrders() }
    const onOrderRefresh = () => { refreshOrders() }

    socket.on('order:new', onOrderNew)
    socket.on('order:refresh', onOrderRefresh)

    return () => {
      socket.off('order:new', onOrderNew)
      socket.off('order:refresh', onOrderRefresh)
    }
  }, [refreshOrders, isCustomer])
}
