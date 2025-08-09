# WealthView - Personal Finance Portfolio Dashboard

A comprehensive personal finance web application that visualizes investments, dividends, portfolio growth, and gain/loss with AI-powered insights. Built specifically for Wealthsimple users to track their investment portfolio performance.

## 🚀 Features

- **Portfolio Overview**: Real-time tracking of total invested amount, portfolio value, and gain/loss
- **Transaction History**: Complete buy/sell transaction tracking with search and filtering
- **Dividend Tracking**: Monitor dividend payments and income with visual charts
- **AI Insights**: AI-powered portfolio analysis and recommendations (coming soon)
- **Real-time Data**: Automatic updates via webhooks from Wealthsimple email parsing
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🛠️ Tech Stack

### Frontend

- **React 18** + **Vite** for fast development
- **Tailwind CSS v4** + **shadcn/ui** for styling
- **Framer Motion** for smooth animations
- **Nivo Charts** for data visualization
- **React Query (TanStack)** for API state management
- **React Router** for navigation

### Backend

- **Firebase Cloud Functions** (Node.js/TypeScript) for business logic
- **Firestore** as the NoSQL database
- **Firebase Authentication** for user management

### Data Integration

- **Webhooks** triggered by parsed Wealthsimple emails
- **Email parsing** via Zapier or similar services
- **Real-time price APIs** (Yahoo Finance, Alpha Vantage)

## 📊 Data Structure

### Firestore Collections

- `transactions` → Buy/sell orders with date, ticker, quantity, and price
- `dividends` → Dividend payouts with date, ticker, and amount
- `portfolio_summary` → Pre-calculated metrics for fast dashboard loading

### Portfolio Metrics

- **Total Invested**: Sum of all buy transactions minus sells
- **Total Dividends YTD**: Current year dividend income
- **Portfolio Value**: Current holdings × latest prices
- **Gain/Loss**: (Portfolio Value + Total Dividends) – Total Invested

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Functions enabled
- Wealthsimple account for data integration

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd wealth-scope
   ```

2. **Install dependencies**

   ```bash
   # Install web dependencies
   cd web
   npm install

   # Install functions dependencies
   cd ../functions
   npm install
   ```

3. **Configure Firebase**

   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase project
   firebase init
   ```

4. **Update API configuration**

   - Update `web/src/api.js` with your Firebase Functions URL
   - Configure Firebase project settings in `firebase.json`

5. **Deploy Firebase Functions**

   ```bash
   cd functions
   npm run deploy
   ```

6. **Start development server**
   ```bash
   cd web
   npm run dev
   ```

## 🔧 Configuration

### Webhook Setup

1. Set up email parsing service (Zapier, IFTTT, etc.)
2. Configure webhook endpoints for transactions and dividends
3. Update Firebase Functions URLs in your parsing service

### Environment Variables

Create `.env` files in both `web/` and `functions/` directories:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 📈 Usage

### Dashboard

- View portfolio summary with key metrics
- Monitor portfolio growth with interactive charts
- See recent transactions and dividend payments

### Transactions

- Browse complete transaction history
- Search and filter by symbol or transaction type
- View detailed transaction information

### Dividends

- Track dividend income over time
- Visualize dividend distribution by symbol
- Monitor payment history

## 🔮 Future Features

- **AI Portfolio Analysis**: Automated insights and recommendations
- **Real-time Price Updates**: Live market data integration
- **Portfolio Rebalancing**: Automated rebalancing suggestions
- **Tax Optimization**: Tax-loss harvesting recommendations
- **Mobile App**: React Native mobile application
- **Multi-account Support**: Multiple Wealthsimple accounts
- **Export Features**: PDF reports and data export

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@wealthview.app or create an issue in this repository.

---

Built with ❤️ for Wealthsimple investors
