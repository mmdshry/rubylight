import { CONTACT, type Locale } from './contacts'

function escapeVcf(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildVCard(locale: Locale, photoBase64?: string) {
  const fn = CONTACT.brand[locale]
  const org = CONTACT.brand[locale]
  const adr = CONTACT.address[locale]
  const note =
    locale === 'fa'
      ? `واتس‌اپ: ${CONTACT.whatsapp}\\nتلگرام: ${CONTACT.telegramHandle}`
      : `WhatsApp: ${CONTACT.whatsapp}\\nTelegram: ${CONTACT.telegramHandle}`

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVcf(fn)}`,
    `N:;${escapeVcf(fn)};;;`,
    `ORG:${escapeVcf(org)}`,
    `TEL;TYPE=CELL,VOICE:${CONTACT.phones.cell}`,
    `TEL;TYPE=WORK,VOICE:${CONTACT.phones.work}`,
    `ADR;TYPE=WORK:;;${escapeVcf(adr)};;;;`,
    `URL:${CONTACT.whatsapp}`,
    `URL:${CONTACT.telegram}`,
    `NOTE:${note}`,
  ]

  if (photoBase64) {
    lines.push(`PHOTO;ENCODING=b;TYPE=PNG:${photoBase64}`)
  }

  lines.push('END:VCARD')
  return lines.join('\r\n')
}

export async function downloadVCard(locale: Locale) {
  let photoBase64: string | undefined

  try {
    const res = await fetch(CONTACT.avatarPath)
    if (res.ok) {
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      bytes.forEach((b) => {
        binary += String.fromCharCode(b)
      })
      photoBase64 = btoa(binary)
    }
  } catch {
    // Photo is optional; continue without it.
  }

  const vcf = buildVCard(locale, photoBase64)
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download =
    locale === 'fa' ? 'javaher-ruby-light.vcf' : 'Ruby-Light-Jewelry.vcf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
