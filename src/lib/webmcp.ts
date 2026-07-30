import { CONTACT, type Locale } from './contacts'
import { downloadVCard } from './vcf'

type AgentTool = {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
  execute: (args?: Record<string, unknown>) => Promise<unknown> | unknown
}

type ModelContextApi = {
  registerTool: (tool: AgentTool) => void
}

function getModelContext(): ModelContextApi | undefined {
  const nav = navigator as Navigator & { modelContext?: ModelContextApi }
  return nav.modelContext
}

export function registerAgentTools() {
  const api = getModelContext()
  if (!api?.registerTool) return

  try {
    api.registerTool({
      name: 'open_whatsapp',
      description: 'Open Ruby Light Jewelry WhatsApp chat',
      execute: () => {
        window.open(CONTACT.whatsapp, '_blank', 'noopener,noreferrer')
        return { ok: true, url: CONTACT.whatsapp }
      },
    })
    api.registerTool({
      name: 'open_telegram',
      description: 'Open Ruby Light Jewelry Telegram chat',
      execute: () => {
        window.open(CONTACT.telegram, '_blank', 'noopener,noreferrer')
        return { ok: true, url: CONTACT.telegram }
      },
    })
    api.registerTool({
      name: 'save_contact',
      description: 'Download Ruby Light Jewelry vCard contact file',
      inputSchema: {
        type: 'object',
        properties: {
          locale: { type: 'string', enum: ['fa', 'en'] },
        },
      },
      execute: (args?: Record<string, unknown>) => {
        const locale: Locale = args?.locale === 'en' ? 'en' : 'fa'
        void downloadVCard(locale)
        return { ok: true, locale }
      },
    })
  } catch {
    // WebMCP may be unavailable; ignore.
  }
}
