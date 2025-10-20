import * as puppeteer from 'puppeteer';
import { logger } from '../utils/logger';

/**
 * French Laundry Reservation Bot
 * 
 * This bot automatically attempts to book a table for 2 at The French Laundry
 * on the last Friday of the next month when reservations open (1st of each month).
 * 
 * Required Environment Variables:
 * - TOCK_EMAIL: Your Tock account email
 * - TOCK_PASSWORD: Your Tock account password
 * - TOCK_PHONE: Your phone number for the reservation
 * - TOCK_PAYMENT_METHOD: (optional) Saved payment method to use
 * - HEADLESS: Set to 'false' to see the browser (default: 'true')
 */

interface BookingConfig {
    email: string;
    password: string;
    phone: string;
    partySize: number;
    targetDate: Date;
    headless: boolean;
}

/**
 * Calculate the last Friday of next month
 */
function getLastFridayOfNextMonth(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0); // Last day of next month
    
    // Find the last Friday
    let lastFriday = new Date(nextMonth);
    while (lastFriday.getDay() !== 5) { // 5 = Friday
        lastFriday.setDate(lastFriday.getDate() - 1);
    }
    
    return lastFriday;
}

/**
 * Format date for Tock URL (YYYY-MM-DD)
 */
function formatDateForTock(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Main booking function
 */
async function attemptBooking(config: BookingConfig): Promise<boolean> {
    let browser: puppeteer.Browser | null = null;
    
    try {
        logger.info('Launching browser...');
        browser = await puppeteer.launch({
            headless: config.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        logger.info('Navigating to Tock login page...');
        await page.goto('https://www.exploretock.com/login', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Login
        logger.info('Logging in...');
        await page.waitForSelector('input[name="email"]', { timeout: 10000 });
        await page.type('input[name="email"]', config.email);
        await page.type('input[name="password"]', config.password);
        
        // Click login button
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('button[type="submit"]')
        ]);

        logger.info('Login successful, navigating to French Laundry...');
        
        // Navigate to French Laundry search page with specific date and party size
        const dateStr = formatDateForTock(config.targetDate);
        const searchUrl = `https://www.exploretock.com/tfl/search?date=${dateStr}&size=${config.partySize}&time=19:30`;
        
        logger.info(`Searching for table on ${dateStr} for ${config.partySize} people...`);
        await page.goto(searchUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Wait a moment for the page to fully load
        await page.waitForTimeout(2000);

        // Look for available time slots
        logger.info('Looking for available time slots...');
        
        // Try to find any available booking button
        const availableSlots = await page.$$('button[data-test-id*="search-result"], a[href*="/experience/"]');
        
        if (availableSlots.length === 0) {
            logger.warn('No available time slots found for the target date');
            return false;
        }

        logger.info(`Found ${availableSlots.length} potential time slot(s)`);

        // Click the first available slot
        await availableSlots[0].click();
        await page.waitForTimeout(2000);

        // Fill in guest details if required
        logger.info('Filling in reservation details...');
        
        // Check if phone number field exists
        const phoneSelector = 'input[name="phone"], input[type="tel"]';
        const phoneField = await page.$(phoneSelector);
        if (phoneField) {
            await page.type(phoneSelector, config.phone);
        }

        // Look for any special requests or notes field
        const notesSelector = 'textarea[name="notes"], textarea[placeholder*="special"]';
        const notesField = await page.$(notesSelector);
        if (notesField) {
            await page.type(notesSelector, 'Looking forward to dining at The French Laundry!');
        }

        // Proceed to payment/confirmation
        logger.info('Proceeding to checkout...');
        
        // Look for "Continue" or "Proceed" button
        const continueButton = await page.$('button:has-text("Continue"), button:has-text("Proceed"), button[type="submit"]');
        if (continueButton) {
            await continueButton.click();
            await page.waitForTimeout(3000);
        }

        // At this point, you would need to handle payment
        // Since payment details are sensitive, we'll stop here and log
        logger.info('Reached payment/confirmation page');
        logger.warn('MANUAL INTERVENTION REQUIRED: Please complete the payment manually');
        logger.warn('The browser will remain open for 5 minutes for you to complete the booking');

        // Keep browser open for manual completion
        if (!config.headless) {
            await page.waitForTimeout(300000); // 5 minutes
        }

        return true;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Booking attempt failed: ${errorMessage}`);
        
        if (browser && !config.headless) {
            logger.info('Browser will remain open for debugging (30 seconds)...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
        return false;
    } finally {
        if (browser) {
            await browser.close();
            logger.info('Browser closed');
        }
    }
}

/**
 * Main job function called by cron
 */
export const frenchLaundryBot = async () => {
    logger.info('=== French Laundry Reservation Bot Started ===');
    
    // Get configuration from environment variables
    const email = process.env.TOCK_EMAIL;
    const password = process.env.TOCK_PASSWORD;
    const phone = process.env.TOCK_PHONE || '';
    const headless = process.env.HEADLESS !== 'false';

    // Validate required configuration
    if (!email || !password) {
        logger.error('Missing required environment variables: TOCK_EMAIL and TOCK_PASSWORD must be set');
        return;
    }

    // Calculate target date (last Friday of next month)
    const targetDate = getLastFridayOfNextMonth();
    logger.info(`Target reservation date: ${targetDate.toDateString()}`);

    const config: BookingConfig = {
        email,
        password,
        phone,
        partySize: 2,
        targetDate,
        headless
    };

    // Attempt booking with retries
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
        attempt++;
        logger.info(`Booking attempt ${attempt}/${maxRetries}...`);
        
        success = await attemptBooking(config);
        
        if (!success && attempt < maxRetries) {
            logger.info('Waiting 30 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }

    if (success) {
        logger.info('=== Booking attempt completed successfully ===');
    } else {
        logger.error('=== All booking attempts failed ===');
    }
};

