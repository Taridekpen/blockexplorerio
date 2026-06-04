# BlockExplorer

A multi-chain block explorer for **Bitcoin** and **Ethereum** that reads on-chain data from public block explorer APIs.

## Features

- **Live data** — Bitcoin via [Blockstream Esplora](https://github.com/Blockstream/esplora), Ethereum via [Blockscout](https://eth.blockscout.com)
- **Unified search** — transactions, blocks (by height or hash), and addresses
- **Chain toggle** — switch between Bitcoin and Ethereum

## Getting started

```bash
cd ~/Documents/blockexplorer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Example searches

**Bitcoin**
- Block height: `840000`
- Genesis coinbase tx: `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7af002a0ed`
- Address: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`

**Ethereum**
- Block height: `19000000`
- Address: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`

## Project structure

```
src/
├── app/                        # Next.js pages & API routes
├── components/                 # UI components
├── data/indexed-transactions.json
├── lib/                        # API clients & search router
└── types/                      # Shared TypeScript types
```

## API routes

- `GET /api/blocks?chain=bitcoin|ethereum` — latest blocks
- `GET /api/search?q=...&chain=bitcoin|ethereum` — search router

No API keys required — both data sources are free public endpoints.
