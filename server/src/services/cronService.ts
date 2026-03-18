import cron from 'node-cron';
import { Device } from '../models/Device';
import { DeviceSummary } from '../models/DeviceSummary';
import { generateDeviceSummary, detectAnomalies } from './aiService';

// Sleep helper
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const initCronJobs = () => {
    // Run at 00:00 every day
    // The cron expression '0 0 * * *' fires at midnight.
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Starting Daily AI Diagnostics Batch Job...');
        
        try {
            const devices = await Device.find({ status: 'online' });
            
            for (const device of devices) {
                console.log(`[CRON] Generating LLM Summary for ${device.name}...`);
                try {
                    // Fetch both summary and anomaly from Groq API
                    const [summaryText, anomalyText] = await Promise.all([
                        generateDeviceSummary(device._id.toString()),
                        detectAnomalies(device._id.toString())
                    ]);

                    // Save to Daily DeviceSummary Table
                    await DeviceSummary.create({
                        deviceId: device._id,
                        summary: summaryText,
                        anomaly: anomalyText,
                        type: 'Daily'
                    });

                    console.log(`[CRON] Successfully analyzed ${device.name}.`);

                } catch (err: any) {
                    console.error(`[CRON] Failed to analyze ${device.name}:`, err.message);
                }

                // Wait 3 seconds to strictly enforce Groq API Tokens-Per-Minute restrictions
                await delay(3000); 
            }
            
            console.log('[CRON] Daily AI Diagnostics Batch Job Complete!');
        } catch (error) {
            console.error('[CRON] Fatal error executing daily cron job:', error);
        }
    });
    
    console.log('Scheduler initialized: Daily AI Baseline Analysis ready.');
};
