# Ruby Light Jewelry

SPA معرفی فروشگاه جواهر روبی‌لایت — دوزبانه (FA/EN)، آفلاین با PWA، مینیمال.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- vite-plugin-pwa (کش آفلاین)
- LiteSpeed برای فایل‌های استاتیک و پروکسی `/api/tala` به tala.ir

## Commands

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm start          # اختیاری: سرو dist + API قیمت روی 127.0.0.1:3009
pnpm run proxy      # همان start
```

در `pnpm dev` و `pnpm preview` پروکسی قیمت را خود Vite انجام می‌دهد؛ PM2 لازم نیست.

## Features

- تم روشن برای انگلیسی، تم تیره زرشکی برای فارسی
- واتس‌اپ، تلگرام، ذخیره مخاطب (VCF)
- تابلو قیمت طلا (tala.ir) با کش آفلاین — مرورگر هر ۶۰ ثانیه `/api/tala` را می‌گیرد
- فونت‌ها و assets کاملاً لوکال

## Deploy (AlmaLinux + LiteSpeed)

PM2 لازم نیست. سایت از `dist/` سرو می‌شود؛ فقط `/api/tala` به `https://www.tala.ir/banner` پروکسی می‌شود.

### 1) Build

```bash
cd /home/rubylight/public_html/rubylight
pnpm i --frozen-lockfile
pnpm build
```

### 2) LiteSpeed (`public_html`)

دو چیدمان ممکن است:

```text
# A) محتویات dist/ در ریشه دامنه
public_html/
  .htaccess          ← از public/.htaccess (با build به dist کپی می‌شود)
  index.html
  assets/

# B) مخزن در زیرپوشه
public_html/
  .htaccess          ← از deploy/public_html.htaccess
  rubylight/dist/    ← خروجی Vite
```

برای چیدمان B:

```bash
cp deploy/public_html.htaccess /home/rubylight/public_html/.htaccess
```

`.htaccess` فایل‌های استاتیک را سرو می‌کند و `/api/tala` را با هدرهای لازم به tala.ir می‌فرستد.

اگر فلگ `[P]` به HTTPS خارجی کار نکرد، در LiteSpeed WebAdmin:

- External App روی `https://www.tala.ir`
- Context برای `/api/tala` با URI `/banner`
- هدرها: `Referer: https://www.tala.ir/`، `X-Requested-With: XMLHttpRequest`، `Accept: application/json, text/javascript, */*; q=0.01`، `Cookie: _trc=1`

بعد از دیپلوی، `https://دامنه/api/tala` باید JSON قیمت برگرداند.

### اختیاری: Node / PM2

`pnpm start` و `ecosystem.config.cjs` فقط برای تست محلی `dist/` + پروکسی هستند، نه برای سرور.
