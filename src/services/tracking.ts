type UTMContext = {
  utm_source: string | null
  utm_campaign: string | null
}

export type TrackingContext = UTMContext & {
  session_id: string
  occurred_at: string
}

const SESSION_KEY = 'leados_session_id'
const UTM_SOURCE_KEY = 'leados_utm_source'
const UTM_CAMPAIGN_KEY = 'leados_utm_campaign'

function safeGetWindow() {
  if (typeof window === 'undefined') return null
  return window
}

function getOrCreateSessionId() {
  const w = safeGetWindow()
  if (!w) return 'server-session'

  const stored = w.sessionStorage.getItem(SESSION_KEY)
  if (stored) return stored

  const sid = w.crypto?.randomUUID?.() ?? `sid_${Date.now()}`
  w.sessionStorage.setItem(SESSION_KEY, sid)
  return sid
}

function readAndPersistUTM(): UTMContext {
  const w = safeGetWindow()
  if (!w) return { utm_source: null, utm_campaign: null }

  const url = new URL(w.location.href)
  const sourceFromUrl = url.searchParams.get('utm_source')
  const campaignFromUrl = url.searchParams.get('utm_campaign')

  if (sourceFromUrl) w.localStorage.setItem(UTM_SOURCE_KEY, sourceFromUrl)
  if (campaignFromUrl) w.localStorage.setItem(UTM_CAMPAIGN_KEY, campaignFromUrl)

  return {
    utm_source: sourceFromUrl ?? w.localStorage.getItem(UTM_SOURCE_KEY),
    utm_campaign: campaignFromUrl ?? w.localStorage.getItem(UTM_CAMPAIGN_KEY),
  }
}

export function getTrackingContext(): TrackingContext {
  const utm = readAndPersistUTM()
  return {
    session_id: getOrCreateSessionId(),
    occurred_at: new Date().toISOString(),
    ...utm,
  }
}
