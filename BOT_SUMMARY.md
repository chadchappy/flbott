# French Laundry Reservation Bot - Summary

## ✅ What Has Been Built

I've created a fully automated reservation bot for The French Laundry that:

1. **Runs automatically** at midnight on the 1st of every month
2. **Calculates** the last Friday of the next month
3. **Attempts to book** a table for 2 people
4. **Handles login** to your Tock account
5. **Navigates** to the booking page
6. **Selects** available time slots
7. **Stops at payment** for you to complete manually (for security)

## 📁 Files Created

1. **`src/jobs/frenchLaundryBot.ts`** - Main bot logic
2. **`.env.example`** - Template for your credentials
3. **`FRENCH_LAUNDRY_BOT.md`** - Comprehensive documentation
4. **`INSTALL_BOT.md`** - Quick installation guide
5. **`BOT_SUMMARY.md`** - This file

## 📝 Files Modified

1. **`src/jobs/index.ts`** - Added bot export
2. **`src/main.ts`** - Added dotenv support
3. **`config/cron.json`** - Added cron schedule
4. **`package.json`** - Added dependencies

## 🔧 Required Setup

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `puppeteer` - Browser automation
- `date-fns` - Date utilities
- `dotenv` - Environment variables

### 2. Configure Credentials
```bash
cp .env.example .env
```

Edit `.env` with your Tock account details:
```
TOCK_EMAIL=your-email@example.com
TOCK_PASSWORD=your-password
TOCK_PHONE=+1-555-123-4567
HEADLESS=true
```

### 3. Start the Service
```bash
npm run build
npm start
```

## 📅 How It Works

### Timeline Example:
- **January 1st, 00:00** → Bot attempts to book last Friday in February
- **February 1st, 00:00** → Bot attempts to book last Friday in March
- **March 1st, 00:00** → Bot attempts to book last Friday in April
- And so on...

### Cron Schedule:
```
0 0 1 * *
```
- Runs at **00:00** (midnight)
- On the **1st day** of every month

## 🎯 What the Bot Does

1. **Launches browser** (headless by default)
2. **Logs into Tock** with your credentials
3. **Navigates to French Laundry** booking page
4. **Searches for** the last Friday of next month, party of 2
5. **Selects** first available time slot
6. **Fills in** phone number and details
7. **Stops at payment page** and waits for you to complete manually
8. **Retries** up to 3 times if it fails

## ⚠️ Important Notes

### Security & Ethics
- ✅ Bot does NOT store or auto-complete payment info
- ⚠️ Using bots may violate Tock's Terms of Service
- ⚠️ Use at your own risk
- ⚠️ Consider ethical implications

### Competition
- The French Laundry is **extremely popular**
- Reservations sell out in **seconds**
- Even with a bot, success is **not guaranteed**
- Many people use bots, so competition is fierce

### Manual Completion Required
- Bot stops at the payment page
- You have **5 minutes** to complete payment manually (if HEADLESS=false)
- This is intentional for security

## 🧪 Testing

### Test Before the 1st
Create a test file:
```typescript
// test-bot.ts
import * as dotenv from 'dotenv';
dotenv.config();
import { frenchLaundryBot } from './src/jobs/frenchLaundryBot';

frenchLaundryBot().then(() => {
    console.log('Test completed');
    process.exit(0);
});
```

Run:
```bash
npx ts-node test-bot.ts
```

### Debug Mode
Set `HEADLESS=false` in `.env` to watch the browser in action.

## 🔍 Monitoring

Check logs to see if the bot is working:
```bash
# Look for these messages:
# "Scheduled job: frenchLaundryBot with schedule: 0 0 1 * *"
# "French Laundry Reservation Bot Started"
# "Target reservation date: ..."
# "Booking attempt completed successfully"
```

## 🛠️ Customization

### Change Party Size
Edit `src/jobs/frenchLaundryBot.ts`:
```typescript
partySize: 4,  // Change from 2
```

### Change Target Day
Modify `getLastFridayOfNextMonth()` function to target a different day.

### Change Time Preference
Edit the `searchUrl` to include your preferred time:
```typescript
time=18:00  // Instead of 19:30
```

## 📚 Documentation

- **Full docs**: See `FRENCH_LAUNDRY_BOT.md`
- **Installation**: See `INSTALL_BOT.md`
- **Configuration**: See `.env.example`

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up credentials
cp .env.example .env
# Edit .env with your Tock credentials

# 3. Build and start
npm run build
npm start

# 4. Verify it's scheduled
# Look for: "Scheduled job: frenchLaundryBot with schedule: 0 0 1 * *"
```

## ✨ Next Steps

1. **Create a Tock account** if you don't have one
2. **Add payment method** to your Tock account
3. **Install dependencies** with `npm install`
4. **Configure `.env`** with your credentials
5. **Test the bot** before the 1st (optional)
6. **Start the service** and let it run
7. **Monitor logs** on the 1st of each month
8. **Complete payment** manually when the bot reaches checkout

## 🎉 You're All Set!

The bot will automatically run at midnight on the 1st of every month and attempt to secure your French Laundry reservation for the last Friday of the following month.

Good luck getting your table! 🍽️

