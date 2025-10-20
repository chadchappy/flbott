export interface JobConfig {
    name: string;
    schedule: string;
    params?: Record<string, any>;
}

export interface LogMessage {
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: Date;
}