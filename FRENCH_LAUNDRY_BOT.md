# French Laundry Reservation Bot

This bot automatically attempts to book a table for 2 at **The French Laundry** on the **last Friday of each month** when reservations open.

## How It Works

### Booking Schedule
- **The French Laundry releases reservations on the 1st of each month** for the following month
- The bot runs automatically at **midnight (00:00) on the 1st of every month**
- It calculates the last Friday of the next month and attempts to book a table for 2

### Example Timeline
- **January 1st**: Bot runs and attempts to book for the last Friday in February
- **February 1st**: Bot runs and attempts to book for the last Friday in March
- And so on...

## Setup Instructions

### 1. Install Dependencies

First, install the required npm packages:

```bash
npm install puppeteer date-fns dotenv
```

Or if you're using yarn:

```bash
yarn add puppeteer date-fns dotenv
```

### 2. Create Tock Account

1. Go to [https://www.exploretock.com/](https://www.exploretock.com/)
2. Create an account if you don't have one
3. **Important**: Add a payment method to your account before the bot runs
4. Make sure your account is fully set up with your contact information

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   TOCK_EMAIL=your-email@example.com
   TOCK_PASSWORD=your-secure-password
   TOCK_PHONE=+1-555-123-4567
   HEADLESS=true
   ```

3. **Security Note**: Never commit your `.env` file to version control!

### 4. Update .gitignore

Make sure `.env` is in your `.gitignore` file:

```bash
echo ".env" >> .gitignore
```

### 5. Load Environment Variables

Update `src/main.ts` to load environment variables:

```typescript
import * as dotenv from 'dotenv';
dotenv.config();
```

## Testing the Bot

### Test Manually (Without Waiting for the 1st)

You can test the bot manually by running:

```bash
npm run start
```

Then trigger the job manually in your code, or create a test script:

```typescript
// test-french-laundry.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { frenchLaundryBot } from './src/jobs/frenchLaundryBot';

frenchLaundryBot().then(() => {
    console.log('Test completed');
    process.exit(0);
});
```

Run with:
```bash
npx ts-node test-french-laundry.ts
```

### Test in Non-Headless Mode

To see what the bot is doing, set `HEADLESS=false` in your `.env` file. This will open a visible browser window.

## Cron Schedule

The bot is configured to run with this cron schedule:

```
0 0 1 * *
```

This means:
- **Minute**: 0 (at the top of the hour)
- **Hour**: 0 (midnight)
- **Day of Month**: 1 (first day)
- **Month**: * (every month)
- **Day of Week**: * (any day)

## Important Notes

### Booking Competition
- The French Laundry is extremely popular and reservations sell out in **seconds**
- Even with a bot, you may not get a reservation due to high demand
- The bot includes retry logic (3 attempts with 30-second delays)

### Manual Payment Completion
- For security reasons, the bot **does not automatically complete payment**
- When the bot reaches the payment page, it will:
  - Log a message indicating manual intervention is required
  - Keep the browser open for 5 minutes (if `HEADLESS=false`)
  - You'll need to complete the payment manually

### Tock's Terms of Service
- **Important**: Using bots may violate Tock's Terms of Service
- Use this bot at your own risk
- Consider the ethical implications of automated booking
- The restaurant may cancel reservations made via bots

### Alternative Approach
If you want to be more respectful of the booking system:
- Set `HEADLESS=false`
- Let the bot navigate to the booking page
- Complete the booking manually when the browser opens

## Troubleshooting

### Bot Fails to Login
- Verify your `TOCK_EMAIL` and `TOCK_PASSWORD` are correct
- Check if Tock has added CAPTCHA (you may need to solve it manually)
- Try running in non-headless mode to see what's happening

### No Available Slots Found
- The date might already be fully booked
- Try running the bot earlier (e.g., at 00:00:01 instead of 00:00:00)
- Check the Tock website manually to verify availability

### Browser Crashes
- Make sure you have enough system resources
- Try running in headless mode (`HEADLESS=true`)
- Check Puppeteer logs for specific errors

## Customization

### Change Party Size
Edit `src/jobs/frenchLaundryBot.ts` and modify:

```typescript
const config: BookingConfig = {
    // ...
    partySize: 4,  // Change from 2 to your desired party size
    // ...
};
```

### Change Target Day
To book a different day (e.g., last Saturday instead of last Friday), modify the `getLastFridayOfNextMonth()` function:

```typescript
function getLastSaturdayOfNextMonth(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    let lastSaturday = new Date(nextMonth);
    while (lastSaturday.getDay() !== 6) { // 6 = Saturday
        lastSaturday.setDate(lastSaturday.getDate() - 1);
    }
    
    return lastSaturday;
}
```

### Change Preferred Time
Edit the `searchUrl` in `attemptBooking()`:

```typescript
const searchUrl = `https://www.exploretock.com/tfl/search?date=${dateStr}&size=${config.partySize}&time=18:00`;
// Change time=19:30 to your preferred time (e.g., time=18:00 for 6:00 PM)
```

## Monitoring

Check the logs to see if the bot is working:

```bash
# If using Docker/Kubernetes
kubectl logs <pod-name>

# If running locally
# Logs will appear in the console
```

## Ethical Considerations

Please consider:
- Bots can make it harder for regular customers to get reservations
- Restaurants may implement stricter booking measures if bots become prevalent
- You might be violating Tock's Terms of Service
- Consider calling the restaurant directly or using their official booking system

## Support

If you encounter issues:
1. Check the logs for error messages
2. Try running in non-headless mode to see what's happening
3. Verify your Tock account is properly set up
4. Make sure all dependencies are installed correctly

## License

Use at your own risk. This is for educational purposes only.

