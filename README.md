# Ruby Light Jewelry

SPA معرفی فروشگاه جواهر روبی‌لایت — دوزبانه (FA/EN)، آفلاین با PWA، مینیمال.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- vite-plugin-pwa (کش آفلاین)
- Node proxy برای قیمت طلا (`/api/tala`) + PM2

## Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm run proxy   # پروکسی قیمت روی 127.0.0.1:3009
```

## Features

- تم روشن برای انگلیسی، تم تیره زرشکی برای فارسی
- واتس‌اپ، تلگرام، ذخیره مخاطب (VCF)
- تابلو قیمت طلا (tala.ir) با کش آفلاین
- فونت‌ها و assets کاملاً لوکال

## Deploy (AlmaLinux + LiteSpeed + PM2)

### 1) Node و PM2 (root)

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm i -g pm2 pnpm
```

### 2) Build و پروکسی قیمت

```bash
cd /path/to/rubylight
pnpm i --frozen-lockfile
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

پروکسی فقط روی `127.0.0.1:3009` گوش می‌دهد؛ نیازی به باز بودن پورت در فایروال عمومی نیست.

### 3) LiteSpeed

محتویات `dist/` را روی Document Root سایت کپی کنید. فایل `.htaccess` داخل `dist` مسیر `/api/tala` را به `http://127.0.0.1:3009/api/tala` پروکسی می‌کند و بقیه مسیرها را به `index.html` می‌فرستد.

اگر فلگ `[P]` در LiteSpeed فعال نبود، در LiteSpeed WebAdmin یک External App / Context برای `/api/tala` به `http://127.0.0.1:3009/api/tala` بسازید.
