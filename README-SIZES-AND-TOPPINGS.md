# Tính năng Sizes và Toppings

## Tổng quan

Hệ thống đã được cập nhật để hỗ trợ:
1. **Sizes (Kích thước)**: Lấy từ API `/sizes`
2. **Toppings**: Lấy từ API `/toppings` 
3. **Product Size Prices**: Lấy từ API `/product_size_prices`

## Cấu trúc API

### 1. Sizes API
```
GET /v1/sizes?fqnull=deleted_at
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "S",
      "created_at": "2025-08-16T08:39:20.000Z",
      "updated_at": "2025-08-16T08:39:20.000Z",
      "deleted_at": null
    },
    {
      "id": 2,
      "name": "M", 
      "created_at": "2025-08-16T08:39:20.000Z",
      "updated_at": "2025-08-16T08:39:20.000Z",
      "deleted_at": null
    }
  ]
}
```

### 2. Toppings API
```
GET /v1/toppings?fqnull=deleted_at&fq=is_active:1
```

**Response:**
```json
{
  "status": "success", 
  "data": [
    {
      "id": 1,
      "name": "Trân châu trắng",
      "price": 5000,
      "created_at": "2025-08-16T08:39:20.000Z",
      "updated_at": "2025-08-16T08:39:20.000Z",
      "deleted_at": null
    },
    {
      "id": 2,
      "name": "Trân châu đen",
      "price": 7000,
      "created_at": "2025-08-16T08:39:20.000Z", 
      "updated_at": "2025-08-16T08:39:20.000Z",
      "deleted_at": null
    }
  ]
}
```

### 3. Product Size Prices API
```
GET /v1/product_size_prices?fqnull=deleted_at
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "size_id": 1,
      "price": 0,
      "created_at": "2025-08-16T08:39:20.000Z",
      "updated_at": "2025-08-16T08:39:20.000Z", 
      "deleted_at": null
    },
    {
      "id": 2,
      "product_id": 1,
      "size_id": 2,
      "price": 5000,
      "created_at": "2025-08-16T08:39:20.000Z",
      "updated_at": "2025-08-16T08:39:20.000Z",
      "deleted_at": null
    }
  ]
}
```

## Tính năng mới

### 1. CustomizationSheet
- **Size Selection**: Hiển thị các kích thước có sẵn với giá tương ứng
- **Topping Selection**: Cho phép chọn nhiều toppings với giá hiển thị
- **Price Calculation**: Tính toán tổng giá bao gồm:
  - Giá sản phẩm cơ bản
  - Giá kích thước (nếu có)
  - Giá toppings (nếu có)

### 2. CartSheet  
- **Detailed Toppings**: Hiển thị từng topping với giá riêng
- **Price Breakdown**: Hiển thị chi tiết giá sản phẩm và giá toppings
- **Total Calculation**: Tính tổng giá chính xác cho từng item

### 3. Cart Logic
- **Add Toppings**: Tự động thêm toppings vào cart_item_toppings khi thêm vào giỏ hàng
- **Price Calculation**: Tính toán tổng giá bao gồm cả toppings

## Cách sử dụng

### 1. Chọn Size
- Mở CustomizationSheet
- Chọn kích thước mong muốn (S, M, L)
- Giá size sẽ được hiển thị bên cạnh tên size

### 2. Chọn Toppings
- Tick vào các toppings muốn thêm
- Giá từng topping sẽ hiển thị bên cạnh tên
- Có thể chọn nhiều toppings cùng lúc

### 3. Xem chi tiết trong giỏ hàng
- Mở CartSheet để xem chi tiết
- Mỗi item sẽ hiển thị:
  - Tên sản phẩm
  - Kích thước và độ ngọt, lượng đá
  - Danh sách toppings với giá
  - Tổng giá chi tiết

## Files đã cập nhật

1. `src/types/shop.ts` - Thêm interfaces cho Size và SizeValue
2. `src/types/option.ts` - Thêm interfaces cho ProductSizePrices
3. `src/components/shop/CustomizationSheet.tsx` - Thêm size selection và price calculation
4. `src/components/shop/CartSheet.tsx` - Hiển thị chi tiết toppings và giá
5. `src/app/page.tsx` - Cập nhật logic xử lý cart với toppings

## Fallback Values

Nếu API không khả dụng, hệ thống sẽ sử dụng giá trị mặc định:

**Sizes:**
- S (ID: 1)
- M (ID: 2) 
- L (ID: 3)

**Toppings:**
- Trân châu trắng: 5,000 VND
- Trân châu đen: 7,000 VND

## Testing

Chạy file test để kiểm tra API:
```bash
cd milktea
node test-api.js
```

File test sẽ kiểm tra tất cả các endpoints:
- `/sizes`
- `/toppings` 
- `/product_size_prices`
- `/sweetness_levels`
- `/ice_levels`


