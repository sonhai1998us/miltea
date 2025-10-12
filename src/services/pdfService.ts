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

// ==== Augmentation cho jsPDF để có kiểu lastAutoTable & autoTable & props tùy biến ====
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
  theme?: {
    primary?: [number, number, number]
    onPrimary?: [number, number, number]
    subtle?: [number, number, number]
    border?: [number, number, number]
    text?: [number, number, number]
    textMuted?: [number, number, number]
    detailBg?: [number, number, number]
  }
}

// Kiểu raw để gắn cờ cho hàng chi tiết
type DetailCellRaw = { __isDetail?: boolean }

export class PDFService {
  private config: PDFServiceConfig
  constructor(config: PDFServiceConfig) { this.config = config }

  // ---------- TEXT & IMAGE HELPERS ----------
  private softWrap(s: string, every = 14) {
    if (!s) return s
    s = s.replace(/([/_\-.@:]+)/g, '$1\u200b')
    return s.replace(new RegExp(`([^\\s]{every})`.replace('every', String(every)), 'g'), '$1\u200b')
  }

  private getFormatFromDataURL(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
    const mime = dataUrl.slice(5, dataUrl.indexOf(';'))
    const subtype = (mime.split('/')[1] || '').toUpperCase()
    if (subtype === 'JPG') return 'JPEG'
    if (subtype === 'JPEG' || subtype === 'PNG' || subtype === 'WEBP')
      return subtype as 'PNG' | 'JPEG' | 'WEBP'
    return 'PNG'
  }

  private addImageSmart(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
    const fmt = this.getFormatFromDataURL(dataUrl)
    doc.addImage(dataUrl, fmt, x, y, w, h, undefined, 'FAST')
  }

  private imageToDataURL(src: string, mime: 'image/png'|'image/jpeg' = 'image/png'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Client only'))
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas 2D not available'))
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL(mime))
        } catch (e) { reject(e as Error) }
      }
      img.onerror = () => reject(new Error('Image load error: ' + src))
      img.src = src
    })
  }

  private async resolveImage(input?: string, fallbackPath?: string): Promise<string | null> {
    if (input && input.startsWith('data:')) return input
    const path = input || fallbackPath
    if (!path) return null
    const isJpeg = /\.jpe?g$/i.test(path)
    return await this.imageToDataURL(path, isJpeg ? 'image/jpeg' : 'image/png')
  }

  // ---------- RENDER NỘI DUNG (dùng cho 2-pass) ----------
  private renderReceipt(doc: jsPDF, order: Order): number {
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginX = 6
    const contentWidth = pageWidth - marginX * 2
    let y = 10

    const primary   = this.config.theme?.primary   ?? [0,100,0]
    const onPrimary = this.config.theme?.onPrimary ?? [255,255,255]
    const subtle    = this.config.theme?.subtle    ?? [245,250,246]
    const border    = this.config.theme?.border    ?? [0,100,0]
    const text      = this.config.theme?.text      ?? [30,30,30]
    const textMuted = this.config.theme?.textMuted ?? [110,110,110]
    const detailBg  = this.config.theme?.detailBg  ?? [250,252,250]

    const store = {
      name:    this.config.store?.name    ?? 'Lá và Sương',
      slogan:  this.config.store?.slogan  ?? 'Cà phê - Trà sữa - Trà trái cây',
      address: this.config.store?.address ?? '36/27B Đ. Số 4, Thủ Đức, Hồ Chí Minh',
      phone:   this.config.store?.phone   ?? 'ĐT: 0931 792 220',
    }

    const centerText = (t: string, yy: number, fs = 12, f: 'normal'|'bold'='normal') => {
      doc.setFont('times', f); doc.setFontSize(fs)
      const x = (pageWidth - doc.getTextWidth(t)) / 2
      doc.text(t, x, yy)
      return yy + fs * 0.5 + 1
    }
    const drawDivider = (yy: number, lw = .35) => {
      doc.setDrawColor(...(border as [number,number,number])); doc.setLineWidth(lw)
      doc.line(marginX, yy, pageWidth - marginX, yy)
    }

    // Logo (nếu đã resolve trước, gắn vào doc._resolvedLogo)
    if (doc._resolvedLogo) {
      try { this.addImageSmart(doc, doc._resolvedLogo, marginX, y - 2, 12, 12); y += 2 } catch {}
    }

    doc.setTextColor(primary[0],primary[1],primary[2]); y = centerText(store.name, y, 16, 'bold')
    doc.setTextColor(100,100,100); y = centerText(store.slogan, y, 9); y = centerText(store.address, y, 9); y = centerText(store.phone, y, 9)
    y += 3; drawDivider(y); y += 7
    doc.setTextColor(0,0,0); y = centerText('HÓA ĐƠN BÁN HÀNG', y, 12, 'bold'); y += 2

    // Thông tin đơn + QR (nếu đã resolve trước)
    const info: Array<[string,string]> = [
      ['Mã đơn', `#${order.id?.toString().slice(-6) ?? '------'}`],
      ['Ngày', this.config.formatDateTime(order.order_time)],
      ['Thanh toán', order.payment_method_id === 1 ? 'Tiền mặt' : 'Chuyển khoản'],
    ]
    doc.setFont('times','normal'); doc.setFontSize(9.5); doc.setTextColor(50,50,50)
    const qrSize = 24, infoRightX = pageWidth - marginX - qrSize

    if (doc._resolvedQR) {
      try {
        doc.setDrawColor(230)
        doc.rect(infoRightX, y, qrSize, qrSize, 'S')
        this.addImageSmart(doc, doc._resolvedQR, infoRightX + 1.5, y + 1.5, qrSize - 3, qrSize - 3)
      } catch {}
    }

    let infoY = y + 1; const keyW = 22
    info.forEach(([k,v])=>{
      const val = this.softWrap(v)
      doc.setFont('times','bold'); doc.text(`${k}:`, marginX, infoY)
      doc.setFont('times','normal')
      const maxW = doc._resolvedQR ? (infoRightX - 2 - (marginX + keyW)) : (contentWidth - keyW)
      doc.text(doc.splitTextToSize(val, Math.max(20, maxW)), marginX + keyW, infoY)
      infoY += 5.5
    })
    y = Math.max(infoY, doc._resolvedQR ? y + qrSize + 2 : infoY); y += 4; drawDivider(y,.3); y += 3

    // BẢNG HÀNG HÓA
    const qtyW = 8, unitW = 20, totalW = 20
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
        this.config.formatPrice(unitPrice),     // đơn giá (gốc)
        this.config.formatPrice(lineTotal),     // thành tiền
      ])

      if (detailLines.length) {
        const detailRaw: DetailCellRaw = { __isDetail: true }
        rows.push([
          {
            content: '↳ ' + detailLines.join('\n   • '),
            colSpan: 4,
            styles: {
              fontSize: 8.5,
              textColor: textMuted as [number,number,number],
              cellPadding: { top: 1.6, right: 2, bottom: 1.8, left: 8 },
              halign: 'left',
              fillColor: detailBg as [number,number,number],
              lineWidth: 0.2,
              lineColor: border as [number,number,number],
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
        lineColor: border as [number,number,number],
        lineWidth: 0.2,
        cellPadding: { top: 2.0, right: 2, bottom: 2.0, left: 2 },
        halign: 'left',
        valign: 'middle',
        textColor: text as [number,number,number],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: primary as [number,number,number],
        textColor: onPrimary as [number,number,number],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: { fillColor: subtle as [number,number,number] },
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
          doc.setDrawColor(190); doc.setLineWidth(0.3)
          doc.line(lx, data.cell.y + 1.2, lx, data.cell.y + data.cell.height - 1.2)
        }
      },
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 5

    // TỔNG KẾT
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
        textColor: text as [number,number,number],
        overflow: 'linebreak',
      },
      columnStyles: { 0: { cellWidth: contentWidth - 30, halign: 'left' }, 1: { cellWidth: 30, halign: 'right' } },
      didDrawCell: (data: CellHookData) => {
        const isTotal = data.row.index === summaryRows.length - 1
        if (isTotal) {
          doc.setFillColor(240,248,240)
          doc.setTextColor(primary[0], primary[1], primary[2]); doc.setFont('times','bold')
        } else if (discount > 0 && data.row.index === 1) {
          doc.setTextColor(200,0,0); doc.setFont('times','bold')
        }
      },
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 6

    // Footer
    doc.setDrawColor(230); doc.setLineWidth(0.3); doc.line(marginX, y, pageWidth - marginX, y); y += 5
    doc.setFont('times','normal'); doc.setFontSize(9.5); doc.setTextColor(100,100,100)
    const thank = 'Cảm ơn quý khách đã sử dụng dịch vụ! Hẹn gặp lại quý khách lần sau.'
    doc.text(doc.splitTextToSize(thank, contentWidth), marginX, y)
    y += 2

    return y // yEnd dùng để tính chiều cao trang
  }

  // ---------- PUBLIC: tạo PDF dài tới hết nội dung ----------
  async generateInvoice(order: Order): Promise<void> {
    // Resolve ảnh trước (để 2-pass không tải lại)
    const resolvedLogo = await this.resolveImage(this.config.logoDataUrl, '/images/logo/logo3.png').catch(() => null)
    const resolvedQR   = await this.resolveImage(this.config.qrDataUrl).catch(() => null)

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

    // Xuất bằng Blob URL
    const blob = doc.output('blob')
    const blobUrl = URL.createObjectURL(blob)
    const w = window.open()
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>Hóa đơn #${order.id?.toString().slice(-6) ?? '------'}</title>
            <style>html,body{margin:0;padding:0;height:100%}iframe{width:100vw;height:100vh;border:none}</style>
          </head>
          <body><iframe src="${blobUrl}"></iframe></body>
        </html>
      `)
      w.document.close()
      w.addEventListener('unload', () => URL.revokeObjectURL(blobUrl))
    } else {
      doc.save(`hoa-don-\${order.id?.toString().slice(-6) ?? '------'}.pdf`)
      URL.revokeObjectURL(blobUrl)
    }
  }
}
