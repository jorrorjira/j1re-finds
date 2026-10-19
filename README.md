# j1re — รวมพิกัดของน่าใช้

เว็บ static สำหรับรวมลิงก์ Shopee Affiliate เน้นมือถือ ใช้ HTML / CSS / JavaScript โดยไม่ต้องติดตั้งแพ็กเกจหรือ build

## สถานะ

- ใส่สินค้าจริง 4 รายการจากลิงก์ที่เจ้าของเพจส่งมาแล้ว: ATK Phantom ULTIMATE, Logitech G PRO X3 SUPERSTRIKE, Ninjutso Sora V3 และ RAWM LEVIATHAN V4 GT
- รูปมาจากหน้าสินค้าที่ตรวจแล้ว เก็บเป็น WebP ใน assets/ พร้อม URL แหล่งภาพใน `imageSource`; ปุ่มใช้ลิงก์ Affiliate ต้นฉบับครบถ้วน
- ไม่ใส่ราคา รีวิว หรืออ้างว่าใช้สินค้าด้วยตนเอง; ภาพ hero เป็นภาพตกแต่ง ไม่ใช่ภาพสินค้าทั้ง 4 รายการ
- เว็บไซต์ออนไลน์: https://j1re-finds.pages.dev/ — Cloudflare Pages Free เชื่อม GitHub branch `main` และ deploy อัตโนมัติเมื่อ push
- ไม่มีระบบหลังบ้าน ไม่มีฐานข้อมูล ไม่มี analytics/cookies ของเว็บ
- ไม่แก้ไขหรือเชื่อมกับเว็บไซต์ Portfolio เดิม

## เปิดในเครื่อง

```sh
python -m http.server 4173 --bind 127.0.0.1
```

เปิด http://127.0.0.1:4173/ (ลิงก์นี้เปิดได้เฉพาะเครื่องที่รัน)
อย่าเปิด index.html ด้วย file:// เพราะเบราว์เซอร์จะบล็อก fetch ของข้อมูล

ทดสอบ:

```sh
node --test tests/*.test.mjs
```

## เพิ่มสินค้าจริง

แก้ `products.json` และใส่รูปสินค้า **ที่มีสิทธิ์ใช้งาน** ไว้ใน `assets/` เช่น `assets/item-001.webp`

ฟิลด์ของสินค้า:
- `id`: เลขสินค้า เช่น `001` ต้องไม่ซ้ำ เก็บเป็นข้อความเพื่อรักษาเลขศูนย์นำหน้า
- `name`: ชื่อสินค้าจริง
- `category`: `atk`, `logitech`, `ninjutso` หรือ `rawm` (จัดกลุ่มตามแบรนด์; เพิ่มแบรนด์ได้ใน `categories`)
- `description`: คำอธิบายสั้น ๆ ที่ตรวจสอบแล้ว ไม่แต่งยอดขาย รีวิว หรือประสบการณ์ใช้เอง
- `image`: path รูป เช่น `./assets/item-001.webp`
- `url`: วาง **ลิงก์ Affiliate เต็มตามต้นฉบับ** ห้ามตัด query หรือเปลี่ยน tracking
- `demo`: เปลี่ยนเป็น `false` เมื่อเป็นรายการจริง
- `tags`: คำค้นเพิ่มเติม เช่น `["หูฟัง", "headphones"]`

เว็บรองรับ HTTPS บน `s.shopee.co.th`, `shope.ee`, `shopee.co.th`, `www.shopee.co.th` เท่านั้น ไม่เปิด URL ที่มี username/password หรือพอร์ตผิดปกติ และไม่แปลงลิงก์ที่ต้นฉบับผิดรูปแบบ

ตอนเตรียมเปิดจริง:
1. เปลี่ยน/ลบรายการตัวอย่างทั้งหมด ไม่ควรผสมข้อมูลจริงกับตัวอย่างในหน้าใช้งานจริง
2. ตรวจชื่อสินค้า รูป และปลายทางลิงก์จากต้นฉบับ
3. แก้ intro และหมวดให้ตรงกับเพจจริง
4. หน้า production เอา `noindex, nofollow` ออกแล้ว; อย่าใส่กลับหากต้องการให้ search engine จัดทำดัชนี
5. ตั้ง `og:url` และ `og:image` ด้วย URL แบบเต็มของโดเมนจริง หากต้องการภาพพรีวิวเวลาแชร์
6. ตรวจคำเปิดเผย Affiliate ให้ตรงกับเงื่อนไขโปรแกรมที่ใช้งาน
7. ทดสอบปุ่มจริงบนมือถือ เปิด Shopee แล้วตรวจรหัส Affiliate ด้วยตัวเอง

## GitHub และโฮสต์

โค้ดสามารถเก็บบน GitHub ได้ แต่ **ไม่แนะนำ GitHub Pages สำหรับเว็บ Affiliate ที่มีจุดประสงค์หลักส่งต่อการซื้อสินค้า** เนื่องจากข้อจำกัดด้านการใช้งานเชิงพาณิชย์:
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

ใช้ Cloudflare Pages project `j1re-finds`, repository `jorrorjira/j1re-finds`, production branch `main`, framework `None`, root directory ว่าง และ build output directory `dist`

Build command เป็นเพียงการคัดลอกไฟล์เว็บ ไม่ต้องลง dependencies:

```sh
mkdir -p dist && cp index.html styles.css app.mjs catalog.mjs products.json dist/ && cp -R assets dist/
```

ไม่เผยแพร่ tests, เอกสาร หรือไฟล์ Git; ไม่ได้เปิด Functions, ฐานข้อมูล หรือ custom domain
สำหรับ static host อื่น: entry point คือ `index.html` เส้นทาง assets เป็น relative จึงใช้ได้ทั้ง root และ subdirectory
การเพิ่มสินค้าทำโดยแก้ไฟล์แล้ว deploy ใหม่ ไม่ใช่การแก้จากหน้าหลังบ้าน

## ไฟล์สำคัญ

- `index.html`: โครงหน้าและข้อความหลัก
- `styles.css`: responsive UI, keyboard focus, reduced motion
- `app.mjs`: แสดงสินค้า/หมวด ค้นหา แชร์ และสถานะ error/empty
- `catalog.mjs`: การค้นหาและตรวจลิงก์ Affiliate
- `products.json`: ข้อมูลสินค้าทั้งหมด
- `assets/*.svg`: ภาพประกอบตัวอย่างที่สร้างขึ้นสำหรับโปรเจกต์นี้
- `assets/fonts/`: Noto Sans Thai แบบ local พร้อม SIL Open Font License

ไม่มี API key หรือข้อมูลส่วนตัวใด ๆ ที่ต้องใส่ในหน้าเว็บ และอย่าใส่ token ใน repository
