# Ruby Light Jewelry

SPA معرفی فروشگاه جواهر روبی‌لایت — دوزبانه (FA/EN)، آفلاین با PWA، مینیمال.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- vite-plugin-pwa (کش آفلاین)
- Node production server (`dist/` + `/api/tala`) روی PM2

## Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm start          # سرو dist + API قیمت روی 127.0.0.1:3009
pnpm run proxy      # همان start
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

### 2) Build و اجرای اپ روی پورت 3009

پروژه در `/home/rubylight/public_html/rubylight` نصب است؛ دامنه به `public_html` اشاره می‌کند.

```bash
cd /home/rubylight/public_html/rubylight
pnpm i --frozen-lockfile
pnpm build
pm2 start ecosystem.config.cjs
# معادل: pm2 start pnpm --name Rubylight -- start
pm2 save
pm2 startup
```

اپ روی `127.0.0.1:3009` گوش می‌دهد (فایل‌های `dist/` + `/api/tala`)؛ نیازی به باز بودن پورت در فایروال عمومی نیست.

### 3) LiteSpeed (`public_html`)

```text
public_html/
  .htaccess          ← reverse proxy کامل به :3009
  rubylight/         ← کل پروژه (سورس + dist + PM2)
```

```bash
cp deploy/public_html.htaccess /home/rubylight/public_html/.htaccess
```

`.htaccess` همه درخواست‌ها را به `http://127.0.0.1:3009` پروکسی می‌کند.

اگر فلگ `[P]` کار نکرد، در LiteSpeed WebAdmin یک External App روی `http://127.0.0.1:3009` و Context برای `/` بسازید.
