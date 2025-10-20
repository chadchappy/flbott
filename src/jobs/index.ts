import * as child_process from 'child_process';
import * as util from 'util';
import { logger } from '../utils/logger';
import { frenchLaundryBot } from './frenchLaundryBot';

const execAsync = util.promisify(child_process.exec);

export const job1 = () => {
    // Define the task for job1
    console.log("Executing Job 1");
};

export const job2 = () => {
    // Define the task for job2
    console.log("Executing Job 2");
};

export const job3 = () => {
    // Define the task for job3
    console.log("Executing Job 3");
};

export const aliasCommandsJob = async () => {
    const commands = [
        'runclwest',
        'rundajob',
        'runsajob',
        'runcleast',
        'rundajob',
        'runsajob'
    ];

    logger.info('Starting alias commands sequence...');

    // Determine which shell profile to source
    const shellProfiles = [
        '~/.zshrc',
        '~/.bash_profile',
        '~/.bashrc',
        '~/.profile'
    ];

    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        try {
            logger.info(`Executing command ${i + 1}/${commands.length}: ${command}`);

            // Try different shell profiles until one works
            let commandExecuted = false;
            for (const profile of shellProfiles) {
                try {
                    const { stdout, stderr } = await execAsync(`bash -c "source ${profile} 2>/dev/null && ${command}"`, {
                        timeout: 300000 // 5 minute timeout per command
                    });

                    if (stdout) {
                        logger.info(`Command ${command} output: ${stdout.trim()}`);
                    }
                    if (stderr) {
                        logger.warn(`Command ${command} stderr: ${stderr.trim()}`);
                    }

                    logger.info(`Successfully completed command: ${command}`);
                    commandExecuted = true;
                    break;
                } catch (profileError) {
                    // Try next profile
                    continue;
                }
            }

            if (!commandExecuted) {
                // Try executing the command directly without sourcing any profile
                try {
                    const { stdout, stderr } = await execAsync(command, {
                        timeout: 300000
                    });

                    if (stdout) {
                        logger.info(`Command ${command} output: ${stdout.trim()}`);
                    }
                    if (stderr) {
                        logger.warn(`Command ${command} stderr: ${stderr.trim()}`);
                    }

                    logger.info(`Successfully completed command: ${command} (executed directly)`);
                } catch (directError) {
                    const errorMessage = directError instanceof Error ? directError.message : String(directError);
                    logger.error(`Failed to execute command ${command}: ${errorMessage}`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to execute command ${command}: ${errorMessage}`);
            // Continue with next command even if one fails
        }
    }

    logger.info('Completed alias commands sequence');
};

export const jobList = {
    job1,
    job2,
    job3,
    aliasCommandsJob,
    frenchLaundryBot
};