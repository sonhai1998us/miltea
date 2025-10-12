'use client'
import { jsPDFCus } from '@/lib/jsPdfAddFont'
import autoTable, {
  RowInput,
  CellInput,
  UserOptions as AutoTableOptions,
  CellHookData
} from 'jspdf-autotable'
import jsPDF from 'jspdf'
import { Order, Topping } from '@/types/shop'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
    lastAutoTable?: { finalY: number }
    _resolvedLogo?: string | null
    _resolvedQR?: string | null
  }
}

export interface PDFServiceConfig {
  formatPrice: (n: number) => string
  formatDateTime: (d: Date) => string
  /** Có thể là dataURL (data:image/...) hoặc đường dẫn public (/images/...) */
  logoDataUrl?: string
  qrDataUrl?: string
  store?: { name?: string; slogan?: string; address?: string; phone?: string }
  /** Với bản in nhiệt hãy bỏ qua theme màu; class sẽ ép BW */
  theme?: never
}

/** Cell raw flag */
type DetailCellRaw = { __isDetail?: boolean }

/** Công cụ ảnh: chuyển ảnh sang monochrome (đen/ trắng) để in rõ nét */
async function toMonochromeDataURL(
  src: string,
  opt?: { threshold?: number; dither?: boolean; mime?: 'image/png' | 'image/jpeg' }
): Promise<string> {
  const threshold = Math.min(255, Math.max(0, opt?.threshold ?? 180)) // 0..255; 180 in rõ hơn
  const mime = opt?.mime ?? 'image/png'
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Client only'))
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return reject(new Error('Canvas 2D not available'))
        ctx.drawImage(img, 0, 0)

        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // Copy to mutable working buffer for dithering
        const buf = new Uint8ClampedArray(data)

        const idx = (x: number, y: number) => (y * width + x) * 4
        const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v)

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = idx(x, y)
            // Luma (BT.601) -> grayscale
            const gray = 0.299 * buf[i] + 0.587 * buf[i + 1] + 0.114 * buf[i + 2]
            const newVal = gray >= threshold ? 255 : 0 // binary
            const err = (gray - newVal)
            buf[i] = buf[i + 1] = buf[i + 2] = newVal
            buf[i + 3] = 255

            if (opt?.dither) {
              // Floyd–Steinberg lỗi phân bố (chỉ áp cho kênh gray)
              const spread = (xx: number, yy: number, factor: number) => {
                if (xx < 0 || xx >= width || yy < 0 || yy >= height) return
                const j = idx(xx, yy)
                const g = 0.299 * buf[j] + 0.587 * buf[j + 1] + 0.114 * buf[j + 2]
                const g2 = clamp(g + err * factor)
                const bw = g2 >= threshold ? 255 : 0
                buf[j] = buf[j + 1] = buf[j + 2] = bw
              }
              // Phân phối: (x+1,y) 7/16; (x-1,y+1) 3/16; (x,y+1) 5/16; (x+1,y+1) 1/16
              spread(x + 1, y, 7 / 16)
              spread(x - 1, y + 1, 3 / 16)
              spread(x, y + 1, 5 / 16)
              spread(x + 1, y + 1, 1 / 16)
            }
          }
        }

        const out = new ImageData(buf, width, height)
        ctx.putImageData(out, 0, 0)
        resolve(canvas.toDataURL(mime))
      } catch (e) {
        reject(e as Error)
      }
    }
    img.onerror = () => reject(new Error('Image load error: ' + src))
    img.src = src
  })
}

export class PDFService {
  private config: PDFServiceConfig
  constructor(config: PDFServiceConfig) { this.config = config }

  // ---------- HELPERS ----------
  private softWrap(s: string, every = 14) {
    if (!s) return s
    s = s.replace(/([/_\-.@:]+)/g, '$1\u200b')
    return s.replace(new RegExp(`([^\\s]{every})`.replace('every', String(every)), 'g'), '$1\u200b')
  }

  private getFormatFromDataURL(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
    const mime = dataUrl.slice(5, dataUrl.indexOf(';'))
    const subtype = (mime.split('/')[1] || '').toUpperCase()
    if (subtype === 'JPG') return 'JPEG'
    if (subtype === 'JPEG' || subtype === 'PNG' || subtype === 'WEBP') return subtype as any // eslint-disable-line
    return 'PNG'
  }

  private addImageSmart(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
    const fmt = this.getFormatFromDataURL(dataUrl)
    // In BW, giữ 'FAST' để không blur
    doc.addImage(dataUrl, fmt, x, y, w, h, undefined, 'FAST')
  }

  private async resolveImageBW(input?: string, fallbackPath?: string): Promise<string | null> {
    const path = input || fallbackPath
    if (!path) return null
    // Nếu đã là dataURL → convert trực tiếp; nếu là URL → load rồi convert
    if (path.startsWith('data:')) {
      return await toMonochromeDataURL(path, { threshold: 180, dither: true, mime: 'image/png' })
    }
    return await toMonochromeDataURL(path, { threshold: 180, dither: true, mime: 'image/png' })
  }

  // ---------- RENDER ----------
  private renderReceipt(doc: jsPDF, order: Order): number {
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginX = 6
    const contentWidth = pageWidth - marginX * 2
    let y = 10

    // BW palette (ép cứng)
    const BLACK: [number, number, number] = [0, 0, 0]
    const WHITE: [number, number, number] = [255, 255, 255]

    const store = {
      name:    this.config.store?.name    ?? 'Lá và Sương',
      slogan:  this.config.store?.slogan  ?? 'Cà phê - Trà sữa - Trà trái cây',
      address: this.config.store?.address ?? '36/27B Đ. Số 4, Thủ Đức, Hồ Chí Minh',
      phone:   this.config.store?.phone   ?? 'ĐT: 0931 792 220',
    }

    const centerText = (t: string, yy: number, fs = 12, f: 'normal'|'bold'='normal') => {
      doc.setFont('times', f); doc.setFontSize(fs); doc.setTextColor(...BLACK)
      const x = (pageWidth - doc.getTextWidth(t)) / 2
      doc.text(t, x, yy)
      return yy + fs * 0.5 + 1
    }
    const drawDivider = (yy: number, lw = .35) => {
      doc.setDrawColor(...BLACK); doc.setLineWidth(lw)
      doc.line(marginX, yy, pageWidth - marginX, yy)
    }

    // Logo BW
    if (doc._resolvedLogo) {
      try {
        // Đặt logo kích thước nhỏ gọn để nét đen rõ
        this.addImageSmart(doc, doc._resolvedLogo, marginX, y - 2, 12, 12)
        y += 2
      } catch {}
    }

    y = centerText(store.name, y, 16, 'bold')
    y = centerText(store.slogan, y, 9, 'normal')
    y = centerText(store.address, y, 9, 'normal')
    y = centerText(store.phone, y, 9, 'normal')

    y += 3; drawDivider(y, .4); y += 7
    y = centerText('HÓA ĐƠN BÁN HÀNG', y, 12, 'bold'); y += 2

    // Info + QR
    const info: Array<[string,string]> = [
      ['Mã đơn', `#${order.id?.toString().slice(-6) ?? '------'}`],
      ['Ngày', this.config.formatDateTime(order.order_time)],
      ['Thanh toán', order.payment_method_id === 1 ? 'Tiền mặt' : 'Chuyển khoản'],
    ]
    doc.setFont('times','normal'); doc.setFontSize(9.5); doc.setTextColor(...BLACK)
    const qrSize = 24, infoRightX = pageWidth - marginX - qrSize

    if (doc._resolvedQR) {
      try {
        // Khung đen mảnh để QR không bị “bể”
        doc.setDrawColor(...BLACK); doc.setLineWidth(0.3)
        doc.rect(infoRightX, y, qrSize, qrSize, 'S')
        this.addImageSmart(doc, doc._resolvedQR, infoRightX + 1.2, y + 1.2, qrSize - 2.4, qrSize - 2.4)
      } catch {}
    }

    let infoY = y + 1; const keyW = 22
    info.forEach(([k,v])=>{
      const val = this.softWrap(v)
      doc.setFont('times','bold'); doc.text(`${k}:`, marginX, infoY)
      doc.setFont('times','normal')
      const maxW = doc._resolvedQR ? (infoRightX - 2 - (marginX + keyW)) : (contentWidth - keyW)
      doc.text(doc.splitTextToSize(val, Math.max(20, maxW)), marginX + keyW, infoY)
      infoY += 5.2
    })
    y = Math.max(infoY, doc._resolvedQR ? y + qrSize + 2 : infoY); y += 4; drawDivider(y,.3); y += 3

    // BẢNG HÀNG HÓA (BW thuần)
    const qtyW = 8, unitW = 22, totalW = 24
    const productW = contentWidth - (qtyW + unitW + totalW)

    const rows: RowInput[] = []
    ;(order.items || []).forEach((item) => {
      const name = this.softWrap(item.product_name ?? '')

      const detailLines: string[] = []
      if (item.size_name) detailLines.push(this.softWrap(`Size: ${item.size_name}${item.size_price>0?` (+${this.config.formatPrice(item.size_price)})`:''}`))
      if (item.sweetness_name || item.ice_name)
        detailLines.push(this.softWrap(item.sweetness_name && item.ice_name ? `${item.sweetness_name} - ${item.ice_name}` : (item.sweetness_name || item.ice_name || '')))
      if (item.toppings?.length)
        detailLines.push(this.softWrap(item.toppings.map((t:Topping)=>`${t.name}${t.price>0?` (+${this.config.formatPrice(t.price)})`:''}`).join(', ')))
      if (item.notes) detailLines.push(this.softWrap(`Ghi chú: ${item.notes}`))

      const unitPrice = item.product_price ?? 0
      const sizePrice = item.size_price ?? 0
      const toppingsPrice = (item.toppings || []).reduce((s, t) => s + (t.price || 0), 0)
      const totalUnitPrice = unitPrice + sizePrice + toppingsPrice
      const lineTotal = totalUnitPrice * (item.quantity ?? 1)

      rows.push([
        { content: name } as CellInput,
        String(item.quantity ?? 1),
        this.config.formatPrice(unitPrice),
        this.config.formatPrice(lineTotal),
      ])

      if (detailLines.length) {
        const detailRaw: DetailCellRaw = { __isDetail: true }
        rows.push([
          {
            content: '↳ ' + detailLines.join('\n   • '),
            colSpan: 4,
            styles: {
              fontSize: 8.5,
              textColor: BLACK,
              cellPadding: { top: 1.6, right: 2, bottom: 1.8, left: 8 },
              halign: 'left',
              // Không fill color để tránh xám → trắng (BW)
              fillColor: WHITE,
              lineWidth: 0.2,
              lineColor: BLACK,
              overflow: 'linebreak',
            },
            raw: detailRaw,
          } as unknown as CellInput,
        ])
      }
    })

    autoTable(doc, {
      startY: y,
      tableWidth: contentWidth,
      theme: 'grid',
      head: [['Sản phẩm','SL','Đơn giá','Thành tiền']],
      body: rows,
      margin: { left: marginX, right: marginX },
      styles: {
        font: 'times',
        fontSize: 9.5,
        lineColor: BLACK,
        lineWidth: 0.25,
        cellPadding: { top: 2.0, right: 2, bottom: 2.0, left: 2 },
        halign: 'left',
        valign: 'middle',
        textColor: BLACK,
        fillColor: WHITE,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: WHITE,           // không nền
        textColor: BLACK,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: BLACK,
        lineWidth: 0.4,
      },
      alternateRowStyles: { fillColor: WHITE }, // bỏ sọc xám
      columnStyles: {
        0: { cellWidth: productW, halign: 'left',  overflow: 'linebreak' },
        1: { cellWidth: qtyW,    halign: 'center', overflow: 'ellipsize' },
        2: { cellWidth: unitW,   halign: 'right',  overflow: 'ellipsize' },
        3: { cellWidth: totalW,  halign: 'right',  overflow: 'ellipsize' },
      },
      rowPageBreak: 'auto',
      didDrawCell: (data: CellHookData) => {
        const isDetail = (data.cell.raw as DetailCellRaw | undefined)?.__isDetail
        if (data.section === 'body' && isDetail && data.column.index === 0) {
          const lx = data.cell.x + 5.5
          const y1 = data.cell.y + 1.0
          const y2 = data.cell.y + (Number.isFinite(data.cell.height) ? data.cell.height : 0) - 1.0
      
          if ([lx, y1, lx, y2].every(Number.isFinite)) {
            data.doc.setDrawColor(0, 0, 0)
            data.doc.setLineWidth(0.25)
            data.doc.line(lx, y1, lx, y2)
          }
        }
      }
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 5

    // TỔNG KẾT (BW, dòng tổng đậm)
    const itemsSubtotal = (order.items || []).reduce((sum, item) => {
      const unitPrice = item.product_price ?? 0
      const sizePrice = item.size_price ?? 0
      const toppingsPrice = (item.toppings || []).reduce((s, t) => s + (t.price || 0), 0)
      const totalUnitPrice = unitPrice + sizePrice + toppingsPrice
      return sum + totalUnitPrice * (item.quantity ?? 1)
    }, 0)
    const discount = order.discount_amount ?? 0
    const totalAmount = order.total_amount ?? Math.max(0, itemsSubtotal - discount)

    const summaryRows: Array<[string,string]> = [['Tổng tính:', this.config.formatPrice(itemsSubtotal)]]
    if (discount > 0) summaryRows.push(['Giảm giá:', `-${this.config.formatPrice(discount)}`])
    summaryRows.push(['TỔNG CỘNG:', this.config.formatPrice(totalAmount)])

    autoTable(doc, {
      startY: y,
      theme: 'plain',
      body: summaryRows as unknown as RowInput[],
      tableWidth: contentWidth,
      margin: { left: marginX, right: marginX },
      styles: {
        font: 'times',
        fontSize: 10.5,
        cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
        textColor: BLACK,
        fillColor: WHITE,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: contentWidth - 34, halign: 'left' },
        1: { cellWidth: 34, halign: 'right' }
      },
      didDrawCell: (data: CellHookData) => {
        const isTotal = data.row.index === (data.table.body?.length ?? 0) - 1
      
        // Chỉ xử lý khi đang ở cột đầu để vẽ cho cả hàng
        if (isTotal && data.column.index === 0) {
          const doc = data.doc as jsPDF
          const xL = data.cell.x
          // Tính tổng width của cả hàng từ chính các cell (ổn định hơn data.table.width)
          const rowCells: any[] = // eslint-disable-line
            (data as any).row?.cells // eslint-disable-line
              ? Object.values((data as any).row.cells) // eslint-disable-line
              : []
          const rowWidth = rowCells.reduce((sum, c: any) => sum + (c?.width || 0), 0) // eslint-disable-line
      
          const xR = xL + rowWidth
          const yTop = data.cell.y
          const yBot = data.cell.y + data.cell.height
      
          if ([xL, xR, yTop, yBot].every(Number.isFinite)) {
            doc.setTextColor(0, 0, 0)
            doc.setDrawColor(0, 0, 0)
            doc.setLineWidth(0.5)
            doc.line(xL, yTop, xR, yTop)
            doc.line(xL, yBot, xR, yBot)
            doc.setFont('times', 'bold')
          }
        } else if (data.row.index === 1 && (data.table.body?.length ?? 0) > 1) {
          // Hàng "Giảm giá" (nếu có)
          data.doc.setFont('times', 'bold')
        }
      }
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 6

    // Footer (BW)
    doc.setDrawColor(...BLACK); doc.setLineWidth(0.3); doc.line(marginX, y, pageWidth - marginX, y); y += 5
    doc.setFont('times','normal'); doc.setFontSize(9.5); doc.setTextColor(...BLACK)
    const thank = 'Cảm ơn quý khách đã sử dụng dịch vụ! Hẹn gặp lại quý khách lần sau.'
    doc.text(doc.splitTextToSize(thank, contentWidth), marginX, y)
    y += 2

    return y
  }

  // ---------- PUBLIC ----------
  async generateInvoice(order: Order): Promise<void> {
    // Resolve ảnh → chuyển BW trước (để 2-pass không tải lại)
    const resolvedLogo = await this.resolveImageBW(this.config.logoDataUrl, '/images/logo/logo3.png').catch(() => null)
    const resolvedQR   = await this.resolveImageBW(this.config.qrDataUrl).catch(() => null)

    // PASS 1: doc tạm cao 2000mm để đo
    const docTmp: jsPDF = jsPDFCus('portrait', 'mm', [80, 2000])
    docTmp._resolvedLogo = resolvedLogo
    docTmp._resolvedQR = resolvedQR
    const yEnd = this.renderReceipt(docTmp, order)

    // Tính chiều cao trang thật
    const topBottomSafe = 6
    const minHeight = 80
    const maxHeight = 2800
    const finalHeight = Math.max(minHeight, Math.min(Math.ceil(yEnd + topBottomSafe), maxHeight))

    // PASS 2: doc cao đúng nhu cầu
    const doc: jsPDF = jsPDFCus('portrait', 'mm', [80, finalHeight])
    doc._resolvedLogo = resolvedLogo
    doc._resolvedQR = resolvedQR
    this.renderReceipt(doc, order)

    // Xuất
    const blob = doc.output('blob')
    const blobUrl = URL.createObjectURL(blob)
    
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    iframe.style.pointerEvents = 'none'
    iframe.src = blobUrl
    document.body.appendChild(iframe)
    
    iframe.onload = () => {
      // Mobile cần user-gesture: gọi từ sự kiện click
      
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      URL.revokeObjectURL(blobUrl)
      console.log(1111111);
      // document.body.removeChild(iframe)
    }
  }
}
