# Inflections Studio

Content creation and management app for Inflections magazine (inflections.media).

Built with Next.js 14, Supabase, Claude API, and Airtable.

## Features

- **AI-Powered Article Generation** - Generate articles with brand-specific voice profiles
- **LinkedIn Post Derivatives** - Auto-generate LinkedIn content from articles
- **Image Generation** - Create featured images using Flux/Replicate
- **Airtable Integration** - Push content directly to your editorial Airtable base
- **Multi-Brand Support** - Manage content for all 8+ brand entities
- **Editorial Workflow** - Track content from draft to published

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Airtable account with base set up
- Anthropic API key (for Claude)
- Replicate API key (for image generation)
- Supabase project (for auth - optional for initial setup)

### 1. Clone and Install

```bash
cd inflections-studio
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `ANTHROPIC_API_KEY` - Get from [console.anthropic.com](https://console.anthropic.com)
- `AIRTABLE_PERSONAL_ACCESS_TOKEN` - Get from [airtable.com/create/tokens](https://airtable.com/create/tokens)
- `AIRTABLE_BASE_ID` - Find in your Airtable base URL (starts with "app")
- `REPLICATE_API_TOKEN` - Get from [replicate.com](https://replicate.com)

Optional (for auth):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Airtable Setup

Your Airtable base should have these tables with the following fields:

#### Brands
- Brand Name (Single line text)
- Short Name (Single line text)
- Brand Type (Single select: service, personal, nonprofit, product)
- Website URL (URL)
- LinkedIn Page URL (URL)
- LinkedIn Page ID (Single line text)
- Primary Color (Single line text - hex code)
- Voice Summary (Long text)
- Voice Profile JSON (Long text)
- Target Audience (Long text)
- Content Themes (Long text)
- Cross-Brand CTAs (Long text - JSON)
- Logo URL (URL)
- Is Active (Checkbox)

#### Issues
- Issue Number (Auto number)
- Issue Title (Single line text)
- Publish Date (Date)
- Status (Single select: Planning, In Production, Ready, Published)
- Theme Description (Long text)
- Notes (Long text)

#### Articles
- Title (Single line text)
- Issue (Link to Issues)
- Content Type (Single select: Feature, Perspective, Practitioner Guide, Spotlight, The Crossroads, Resource Roundup)
- Primary Brand (Link to Brands)
- Secondary Brands (Link to Brands - multiple)
- Pillar (Single select: Tech Leadership, Delivery Excellence, Workforce Transformation, Emerging Talent, Human Side)
- Status (Single select: Idea, Drafting, In Review, Approved, Scheduled, Published)
- Author (Collaborator)
- Content (Long text - enable rich text)
- Excerpt (Long text)
- Meta Description (Single line text)
- Target Word Count (Number)
- Actual Word Count (Formula or Number)
- Featured Image URL (URL)
- Featured Image Prompt (Long text)
- Publish Date (Date)
- Published URL (URL)
- Created (Created time)
- Last Modified (Last modified time)

#### LinkedIn Posts
- Post Title (Single line text)
- Source Article (Link to Articles)
- Post Type (Single select: Hot Take, Article Share, Quote Graphic, Poll, Thread)
- Brand Account (Link to Brands)
- Content (Long text)
- Hashtags (Single line text)
- Link URL (URL)
- Image URL (URL)
- Status (Single select: Draft, Approved, Scheduled, Posted)
- Scheduled Date (Date)
- Scheduled Time (Single line text)
- Posted Date (Date)
- Post URL (URL)

#### Topics Bank
- Topic (Single line text)
- Description (Long text)
- Source (Single select: AI Suggested, Manual, News, Reference Material)
- Source URL (URL)
- Primary Brand Fit (Link to Brands)
- Secondary Brand Fit (Link to Brands - multiple)
- Pillar (Single select)
- Priority (Single select: High, Medium, Low)
- Timeliness (Single select: Evergreen, Timely, Dated)
- Status (Single select: New, Approved, Assigned, Used, Rejected)
- Assigned to Issue (Link to Issues)
- Notes (Long text)
- Created (Created time)

### 4. Populate Brands

Add your 8 brand records to the Brands table:

1. Unlimited Powerhouse
2. Jerri Bland (Personal)
3. AgentPMO
4. Prept
5. Lumynr
6. Vetters Group
7. ISSA
8. GenAIrate Project

For each brand, add a Voice Profile JSON like this:

```json
{
  "tone": ["clear", "confident", "human-first"],
  "personality": "A trusted strategic partner who simplifies complexity",
  "vocabulary": {
    "preferred": ["guide", "empower", "clarity", "strategic", "dependable"],
    "avoid": ["synergy", "leverage", "circle back", "low-hanging fruit"]
  },
  "sentenceStyle": "Mix of short punchy sentences and flowing explanations. Lead with value.",
  "examplePhrases": [
    "IT doesn't have to be complicated.",
    "We're here to help you stay ahead.",
    "Great technology starts with people."
  ]
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
inflections-studio/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── generate/     # AI generation endpoints
│   │   │   └── airtable/     # Airtable integration
│   │   ├── articles/         # Articles management
│   │   ├── generate/         # Article generation wizard
│   │   ├── linkedin/         # LinkedIn posts (TODO)
│   │   ├── topics/           # Topic bank (TODO)
│   │   ├── brands/           # Brand configuration (TODO)
│   │   ├── calendar/         # Editorial calendar (TODO)
│   │   ├── images/           # Image library (TODO)
│   │   ├── layout.tsx        # Root layout with sidebar
│   │   ├── page.tsx          # Dashboard
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   └── Sidebar.tsx       # Navigation sidebar
│   ├── lib/
│   │   ├── airtable.ts       # Airtable client
│   │   ├── ai.ts             # Claude AI generation
│   │   ├── images.ts         # Image generation (Replicate)
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── index.ts          # TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Set custom domain: studio.jerribland.com

```bash
# Or deploy via CLI
npx vercel --prod
```

### Custom Domain Setup

In Vercel project settings:
1. Add custom domain: `studio.jerribland.com`
2. In your DNS, add CNAME: `studio` → `cname.vercel-dns.com`

## Development Roadmap

### Phase 1 ✅
- [x] Project setup
- [x] Dashboard UI
- [x] Article generation wizard
- [x] Airtable integration structure
- [x] API routes

### Phase 2 (TODO)
- [ ] Connect real Airtable data
- [ ] Full article editing with Tiptap
- [ ] LinkedIn post management page
- [ ] Topic bank page

### Phase 3 (TODO)
- [ ] Image generation integration
- [ ] Editorial calendar view
- [ ] Brand configuration page
- [ ] Supabase auth

### Phase 4 (TODO)
- [ ] AI refinement tools (adjust tone, expand section)
- [ ] Bulk operations
- [ ] Email notifications
- [ ] Mobile responsive polish

## Contributing

This is a private project for Jerri Bland's content operations.

## License

Private - All rights reserved.
