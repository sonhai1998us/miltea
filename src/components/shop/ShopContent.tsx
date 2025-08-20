import MilkTeaList from "@/components/MilkTeaList"
import { OrderManagement } from "./OrderManagement"
import { formatPrice, formatDateTime, getQuantity, sortOrders } from "@/utils/shopUtils"
import { MilkTea, Order } from "@/types/shop"

interface ShopContentProps {
  activeTab: "order" | "manage"
  milkTeas: MilkTea[]
  isLoadingMilkTeas: boolean
  orders: Order[]
  quantities: Record<number, number>
  onAddToCart: (milkTea: MilkTea) => void
  onToggleOrderStatus: (order: Order) => void
  onBackToOrder: () => void
  onQuantityChange: (id: number, newQuantity: number) => void
}

export const ShopContent = ({
  activeTab,
  milkTeas,
  isLoadingMilkTeas,
  orders,
  quantities,
  onAddToCart,
  onToggleOrderStatus,
  onBackToOrder,
  onQuantityChange,
}: ShopContentProps) => {
  // Memoized values
  const sortedOrders = sortOrders(orders)

  // Utility functions
  const getQuantityForId = (id: number) => getQuantity(quantities, id)
  const updateQuantityForId = (id: number, newQuantity: number) => {
    onQuantityChange(id, newQuantity)
  }

  return (
    <>
      {activeTab === "order" ? (
        <MilkTeaList
          milkTeas={milkTeas}
          isLoading={isLoadingMilkTeas}
          getQuantity={getQuantityForId}
          updateQuantity={updateQuantityForId}
          handleAddToCart={onAddToCart}
          formatPrice={formatPrice}
        />
      ) : (
        <OrderManagement
          orders={sortedOrders}
          formatPrice={formatPrice}
          formatDateTime={formatDateTime}
          onToggleStatus={onToggleOrderStatus}
          onBackToOrder={onBackToOrder}
        />
      )}
    </>
  )
}

