# AI listing translation

Auto-fill the other language when owners create or edit listings.

## How it works

- **Arabic UI (`/ar/...`):** owner writes title + description in Arabic only. English is auto-translated.
- **English UI (`/en/...`):** owner writes in English. Arabic is auto-translated (required for public listings).
- Translation runs on a short debounce while typing, on **Translate now**, and again before save if needed.
- Owners can **Edit translation** to adjust the auto-filled text manually.

## Setup

Add at least one API key to `.env.local`, `apps/web/.env.local`, and **Vercel**:

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI (`gpt-4o-mini` default) |
| `ANTHROPIC_API_KEY` | Anthropic (`claude-3-5-haiku` default) |
| `GOOGLE_AI_API_KEY` | Google Gemini (`gemini-2.0-flash` default) |

Optional:

```env
TRANSLATION_PROVIDER=auto   # auto | openai | anthropic | google
```

With `auto`, the app tries configured providers in order (preferred provider first if set).

## API

`POST /api/translate` — authenticated owners only.

```json
{
  "title": "شقة للبيع في السالمية",
  "description": "شقة واسعة بالقرب من البحر",
  "from": "ar",
  "to": "en"
}
```

## Fallback

If no API keys are configured, the form shows both Arabic and English fields manually (previous behavior).
