# Refactor Documentation - Milk Tea Shop

## Tổng quan

Dự án đã được refactor để cải thiện tính bảo trì, khả năng tái sử dụng và hiệu suất. Dưới đây là cấu trúc mới:

## Cấu trúc thư mục

```
src/
├── app/
│   └── page.tsx                 # Component chính (đã được tối ưu)
├── components/
│   └── shop/
│       ├── ShopContent.tsx      # Component quản lý nội dung chính
│       ├── ShopSheets.tsx       # Component quản lý tất cả sheets
│       ├── HeaderBar.tsx        # Header component
│       ├── BottomNav.tsx        # Bottom navigation
│       ├── CustomizationSheet.tsx
│       ├── CartSheet.tsx
│       ├── CheckoutSheet.tsx
│       └── OrderManagement.tsx
├── hooks/
│   ├── useShopState.ts          # Custom hook quản lý state
│   └── useShopActions.ts        # Custom hook quản lý actions
├── services/
│   └── shopService.ts           # Service layer cho API calls
└── utils/
    └── shopUtils.ts             # Utility functions
```

## Các cải tiến chính

### 1. Tách State Management (`useShopState.ts`)

**Trước:**
- Tất cả state được khai báo trong component chính
- Khó quản lý và debug

**Sau:**
- State được tập trung trong custom hook
- Dễ dàng quản lý và tái sử dụng
- Có các utility functions để reset state

```typescript
const state = useShopState()
// Truy cập: state.cart, state.setCart, etc.
```

### 2. Tách Business Logic (`useShopActions.ts`)

**Trước:**
- Logic nghiệp vụ nằm trong component chính
- Khó test và tái sử dụng

**Sau:**
- Logic được tách thành custom hook riêng
- Sử dụng service layer cho API calls
- Dễ dàng test và maintain

```typescript
const actions = useShopActions(state)
// Sử dụng: actions.handleAddToCart, actions.confirmAddToCart, etc.
```

### 3. Service Layer (`shopService.ts`)

**Trước:**
- API calls trực tiếp trong component
- Khó quản lý lỗi và retry logic

**Sau:**
- Tất cả API calls được tập trung trong service
- Error handling tốt hơn
- Dễ dàng thay đổi API endpoint

```typescript
// Thay vì fetchApi trực tiếp
const milkTeas = await ShopService.fetchMilkTeas()
```

### 4. Utility Functions (`shopUtils.ts`)

**Trước:**
- Các function format và tính toán nằm trong component
- Khó tái sử dụng

**Sau:**
- Tách thành utility functions riêng
- Có thể tái sử dụng ở nhiều nơi
- Dễ dàng test

```typescript
import { formatPrice, calculateTotalCartPrice } from '@/utils/shopUtils'
```

### 5. Component Composition

**Trước:**
- Component chính quá lớn (324 dòng)
- Khó đọc và maintain

**Sau:**
- Tách thành các component nhỏ hơn
- `ShopContent`: Quản lý nội dung chính
- `ShopSheets`: Quản lý tất cả sheets
- Component chính chỉ còn 80 dòng

## Lợi ích của refactor

### 1. Tính bảo trì
- Code dễ đọc và hiểu hơn
- Dễ dàng thêm tính năng mới
- Dễ dàng sửa lỗi

### 2. Khả năng tái sử dụng
- Custom hooks có thể tái sử dụng
- Utility functions có thể dùng ở nhiều nơi
- Service layer có thể dùng cho các component khác

### 3. Hiệu suất
- Memoization tốt hơn với useMemo
- Tách biệt re-render không cần thiết
- Optimistic updates cho UX tốt hơn

### 4. Testing
- Dễ dàng test từng phần riêng biệt
- Mock service layer dễ dàng
- Unit test cho utility functions

### 5. Type Safety
- TypeScript được sử dụng tốt hơn
- Interface rõ ràng cho props
- Error handling tốt hơn

## Cách sử dụng

### Component chính
```typescript
export default function FoxMilkTeaShop() {
  const state = useShopState()
  const actions = useShopActions(state)
  
  // Component logic...
}
```

### Thêm tính năng mới
1. Thêm state vào `useShopState.ts`
2. Thêm action vào `useShopActions.ts`
3. Thêm API call vào `shopService.ts`
4. Sử dụng trong component

### Testing
```typescript
// Test utility functions
import { formatPrice, calculateTotalCartPrice } from '@/utils/shopUtils'

// Test service layer
import { ShopService } from '@/services/shopService'

// Test custom hooks
import { useShopState, useShopActions } from '@/hooks'
```

## Kết luận

Refactor này đã cải thiện đáng kể cấu trúc code, làm cho dự án dễ bảo trì và mở rộng hơn. Việc tách biệt các concerns giúp team có thể làm việc song song trên các phần khác nhau mà không bị conflict.

