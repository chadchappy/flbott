import * as dotenv from 'dotenv';
dotenv.config();

import { CronJob } from 'cron';
import { logger } from './utils/logger';
import { jobList } from './jobs/index';
import * as cronConfig from '../config/cron.json';

interface JobConfig {
    name: string;
    schedule: string;
    params: Record<string, any>;
}

const initializeCronJobs = () => {
    cronConfig.jobs.forEach((job: JobConfig) => {
        const jobFunction = jobList[job.name as keyof typeof jobList];
        if (jobFunction) {
            new CronJob(job.schedule, jobFunction, null, true);
            logger.info(`Scheduled job: ${job.name} with schedule: ${job.schedule}`);
        } else {
            logger.warn(`Job function not found for: ${job.name}`);
        }
    });
};

const main = () => {
    logger.info('Starting cron automation...');
    initializeCronJobs();
};

main();