import { AutomationRule, IAutomationRule } from '../models/AutomationRule';
import { Command } from '../models/Command';
import { getMQTTClient } from '../mqtt/mqttClient';
import { generateDeviceSummary, detectAnomalies } from './aiService';
import { DeviceSummary } from '../models/DeviceSummary';

class AutomationEngine {
  private activeRules: IAutomationRule[] = [];

  constructor() {
    this.refreshRules();
  }

  // Load all enabled rules from the DB into memory for fast evaluation
  public async refreshRules() {
    try {
      this.activeRules = await AutomationRule.find({ enabled: true });
      console.log(`[Automation] Loaded ${this.activeRules.length} active rules into Engine.`);
    } catch (error) {
      console.error('[Automation] Failed to load rules:', error);
    }
  }

  // Evaluates a single incoming telemetry packet against all active rules
  public async evaluateTelemetry(deviceId: string, telemetryPayload: any) {
    if (this.activeRules.length === 0) return;

    for (const rule of this.activeRules) {
      // Check if this rule cares about this device
      if (rule.trigger.deviceId.toString() !== deviceId) continue;

      const incomingValue = telemetryPayload[rule.trigger.metric];
      if (incomingValue === undefined) continue;

      // Evaluate the condition
      let conditionMet = false;
      const targetValue = rule.trigger.value;

      switch (rule.trigger.operator) {
        case '>':
          conditionMet = incomingValue > targetValue;
          break;
        case '<':
          conditionMet = incomingValue < targetValue;
          break;
        case '==':
          conditionMet = incomingValue == targetValue;
          break;
        case '!=':
          conditionMet = incomingValue != targetValue;
          break;
      }

      if (conditionMet) {
        console.log(`[Automation] Rule "${rule.name}" Triggered!`);
        await this.executeAction(rule);
      }
    }
  }

  // Fire off the MQTT Command and log it the DB exactly like the REST endpoint does
  private async executeAction(rule: IAutomationRule) {
    try {
      // 1. Log the automated command 
      const command = await Command.create({
        deviceId: rule.action.deviceId,
        action: rule.action.command,
        value: rule.action.value,
        status: 'pending'
      });

      // 2. Dispatch via MQTT
      const mqttClient = getMQTTClient();
      const topic = `sayrasphere/devices/${rule.action.deviceId}/command`;
      
      const payload = JSON.stringify({
        commandId: command._id,
        action: rule.action.command,
        value: rule.action.value
      });

      mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error('[Automation] MQTT Publish Error:', err);
          command.status = 'failed';
          command.save();
        } else {
          console.log(`[Automation] Dispatched action: ${rule.action.command} to device ${rule.action.deviceId}`);
        }
      });

      // 3. Dispatch Background Emergency AI Analysis Override (Phase 5.5)
      setTimeout(async () => {
        try {
          console.log(`[Automation] Triggering Emergency AI Synthesis for device ${rule.trigger.deviceId}...`);
          const [summary, anomaly] = await Promise.all([
            generateDeviceSummary(rule.trigger.deviceId.toString()),
            detectAnomalies(rule.trigger.deviceId.toString())
          ]);
          await DeviceSummary.create({
            deviceId: rule.trigger.deviceId,
            summary,
            anomaly,
            type: 'Emergency'
          });
          console.log(`[Automation] Emergency AI Override committed to DB for device ${rule.trigger.deviceId}`);
        } catch (err: any) {
          console.error('[Automation] Background Emergency AI Override Failed:', err.message);
        }
      }, 0);

    } catch (error) {
      console.error('[Automation] Action Execution Error:', error);
    }
  }
}

// Export as a singleton
export const automationEngine = new AutomationEngine();
