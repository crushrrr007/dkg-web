# compareDKG

<div align="center">

![compareDKG](https://img.shields.io/badge/compareDKG-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![OriginTrail](https://img.shields.io/badge/OriginTrail-DKG-green)

**A production-ready tool that analyzes Grokipedia articles against Wikipedia, detects hallucinations and bias, assigns trust scores, and publishes verifiable Community Notes to the OriginTrail Decentralized Knowledge Graph.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [API Reference](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

**compareDKG** is a comprehensive content verification platform that:

- **Analyzes** AI-generated content (Grokipedia) against Wikipedia as ground truth
- **Detects** hallucinations, factual errors, bias, and missing context
- **Scores** content trustworthiness (0-100) with detailed explanations
- **Publishes** verifiable Community Notes to OriginTrail DKG with blockchain verification
- **Tracks** all published notes with activity history and detailed analytics

The platform uses Google's Generative AI (Gemini) for semantic analysis and comparison, providing per-segment analysis with evidence-based verification.

## ✨ Features

### 🔍 Content Analysis
- **Hallucination Detection**: Identifies fabricated information with no factual basis
- **Factual Error Detection**: Flags direct contradictions with Wikipedia facts
- **Bias Classification**: Detects non-neutral presentation and loaded language
- **Missing Context**: Highlights important information omitted from AI content
- **Semantic Similarity**: Per-segment comparison with similarity scores

### 📊 Trust Scoring
- **Algorithmic Scoring**: 0-100 trust score based on issue severity
- **Severity Classification**: Critical, High, Medium, Low issue categorization
- **Verdict System**: Reliable, Mostly Reliable, Questionable, Unreliable classifications
- **Explainable AI**: Detailed explanations of scoring methodology

### 📝 Community Notes
- **JSON-LD Schema**: Standards-compliant ClaimReview schema
- **Evidence References**: Links to Wikipedia sources with snippets
- **Segment Analysis**: Detailed per-segment breakdown with classifications
- **DKG Publishing**: Immutable publishing to OriginTrail testnet

### 🔗 Blockchain Integration
- **Universal Asset Locators (UALs)**: Unique identifiers for each published note
- **DKG Explorer Links**: Direct links to OriginTrail DKG explorer
- **Verifiable Claims**: Blockchain-backed verification of published content
- **Activity Tracking**: Complete history of all published notes

### 🎨 User Interface
- **Modern Design**: Beautiful, responsive UI with dark mode support
- **Real-time Analysis**: Live progress tracking during content analysis
- **Interactive Dashboards**: Comprehensive comparison and results views
- **Search & Filter**: Advanced filtering for community notes and activity

## 🛠 Tech Stack

### Frontend
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.1.9** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **SWR** - Data fetching and caching

### Backend & AI
- **Google Generative AI (Gemini)** - Content analysis and comparison
- **Next.js API Routes** - Serverless API endpoints
- **Zod** - Schema validation

### Blockchain & Decentralization
- **OriginTrail DKG** - Decentralized Knowledge Graph
- **DKG Testnet** - Publishing and verification

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 🏗 Architecture

### Workflow

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│  Grokipedia │ ───> │  Google AI      │ <─── │  Wikipedia  │
│  Article    │      │  Analysis       │      │  Reference  │
└─────────────┘      └──────────────────┘      └─────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Community Note  │
                    │  (JSON-LD)      │
                    └──────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  OriginTrail DKG │
                    │  (Blockchain)    │
                    └──────────────────┘
```

### Analysis Pipeline

1. **Content Fetching**: Retrieves Grokipedia and Wikipedia articles
2. **Segmentation**: Breaks content into analyzable segments
3. **AI Analysis**: Google Gemini performs semantic comparison
4. **Issue Detection**: Identifies errors, hallucinations, bias, etc.
5. **Scoring**: Calculates trust score based on issue severity
6. **Community Note Creation**: Generates JSON-LD ClaimReview schema
7. **DKG Publishing**: Publishes to OriginTrail testnet with UAL
8. **Storage**: Saves to localStorage and activity history

## 📦 Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm**, **yarn**, or **pnpm** package manager
- **Google Generative AI API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Step 1: Clone the Repository

```bash
git clone https://github.com/crushrrr007/dkg-web.git
cd dkg-web
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Google Generative AI API Key (Required)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here

# DKG Configuration (Optional - defaults to testnet)
DKG_BASE_URL=http://localhost:9200
DKG_EXPLORER_URL=https://dkg-testnet.origintrail.io
DKG_API_KEY=your_dkg_api_key_if_needed
```

### Step 4: Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Build for Production

```bash
npm run build
npm start
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_GENAI_API_KEY` | Google Generative AI API key for content analysis | Yes | - |
| `DKG_BASE_URL` | OriginTrail DKG API base URL | No | `http://localhost:9200` |
| `DKG_EXPLORER_URL` | DKG Explorer URL for published notes | No | `https://dkg-testnet.origintrail.io` |
| `DKG_API_KEY` | DKG API authentication key (if required) | No | - |

## 🚀 Usage

### Basic Workflow

1. **Start Comparison**
   - Navigate to the home page
   - Enter a topic or provide Grokipedia/Wikipedia URLs
   - Select analysis depth (Quick or Comprehensive)

2. **View Analysis Results**
   - Review trust score and verdict
   - Examine detected issues with evidence
   - Check segment-by-segment comparison

3. **Publish Community Note**
   - Click "Publish to DKG" button
   - Review the Community Note summary
   - Confirm publication

4. **Track Activity**
   - View published notes in "Community Notes" page
   - Check "Activity" page for publication history
   - Click "View Details" for full analysis breakdown

### Analysis Depth Options

- **Quick Analysis**: Faster processing, analyzes up to 12,000 characters
- **Comprehensive Analysis**: More thorough, analyzes up to 25,000 characters

### Viewing Published Notes

- **Community Notes Page**: Browse all published notes with search and filters
- **Activity Page**: Track publication status and history
- **Topic Detail Page**: View complete analysis with segments, evidence, and JSON-LD

## 📡 API Reference

### POST `/api/analyze`

Analyzes Grokipedia content against Wikipedia.

**Request Body:**
```json
{
  "gorkpediaContent": {
    "title": "Article Title",
    "content": "Article content...",
    "sections": [...],
    "url": "https://...",
    "fetchedAt": "2024-01-01T00:00:00Z"
  },
  "wikipediaContent": {
    "title": "Article Title",
    "content": "Article content...",
    "sections": [...],
    "url": "https://...",
    "fetchedAt": "2024-01-01T00:00:00Z"
  },
  "depth": "quick" | "comprehensive"
}
```

**Response:**
```json
{
  "summary": {
    "overallScore": 75,
    "totalIssues": 5,
    "criticalIssues": 1,
    "highIssues": 2,
    "mediumIssues": 1,
    "lowIssues": 1,
    "verdict": "mostly_reliable",
    "verdictExplanation": "..."
  },
  "issues": [...],
  "topicOverview": "...",
  "keyDifferences": [...],
  "agreementAreas": [...]
}
```

### POST `/api/community-note`

Publishes a Community Note to DKG.

**Request Body:**
```json
{
  "analysisResult": {...},
  "gorkpediaContent": {...},
  "wikipediaContent": {...},
  "topic": "Topic Name"
}
```

**Response:**
```json
{
  "success": true,
  "ual": "did:dkg:...",
  "explorerUrl": "https://dkg-testnet.origintrail.io/explore?ual=...",
  "communityNote": {...}
}
```

### GET `/api/community-note/[ual]`

Retrieves a Community Note by UAL.

**Response:**
```json
{
  "communityNote": {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    ...
  }
}
```

### GET `/api/fetch-gorkpedia?url=...`

Fetches content from Grokipedia.

### GET `/api/fetch-wikipedia?topic=...` or `?url=...`

Fetches content from Wikipedia.

## 📁 Project Structure

```
dkg-web/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── analyze/          # Content analysis endpoint
│   │   ├── community-note/   # DKG publishing endpoints
│   │   ├── fetch-gorkpedia/  # Grokipedia fetcher
│   │   └── fetch-wikipedia/  # Wikipedia fetcher
│   ├── activity/             # Activity history page
│   ├── community-notes/      # Community notes listing
│   ├── compare/              # Comparison dashboard
│   ├── topics/               # Topic detail pages
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # UI primitives (Radix UI)
│   ├── comparison-dashboard.tsx
│   ├── publish-modal.tsx
│   ├── topic-detail-view.tsx
│   └── ...
├── lib/                      # Utility libraries
│   ├── analysis-schema.ts   # Analysis data schemas
│   ├── analysis-utils.ts    # Analysis helper functions
│   ├── dkg-client.ts        # DKG API client
│   ├── dkg-schema.ts        # DKG data schemas
│   ├── scraper.ts           # Web scraping utilities
│   └── wikipedia.ts         # Wikipedia API client
├── public/                   # Static assets
├── styles/                   # Global styles
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **OriginTrail DKG Explorer**: [https://dkg-testnet.origintrail.io](https://dkg-testnet.origintrail.io)
- **OriginTrail Documentation**: [https://docs.origintrail.io](https://docs.origintrail.io)
- **Google Generative AI**: [https://ai.google.dev](https://ai.google.dev)

## 🙏 Acknowledgments

- **OriginTrail** for the Decentralized Knowledge Graph infrastructure
- **Google** for Generative AI capabilities
- **Wikipedia** for providing reference content
- **Next.js** team for the amazing framework
- **Radix UI** for accessible component primitives

---

<div align="center">

Made with ❤️ for decentralized knowledge verification

[Report Bug](https://github.com/crushrrr007/dkg-web/issues) • [Request Feature](https://github.com/crushrrr007/dkg-web/issues) • [View on GitHub](https://github.com/crushrrr007/dkg-web)

</div>
