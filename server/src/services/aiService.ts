import { Groq } from "groq-sdk";
import { Telemetry } from "../models/Telemetry";
import { Device } from "../models/Device";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper to fetch the actual context data from MongoDB
const getDeviceContext = async (deviceId: string) => {
  const device = await Device.findById(deviceId);
  if (!device) throw new Error("Device not found");

  // Fetch the last 50 telemetry pings (approx. last few minutes depending on ping frequency)
  const telemetry = await Telemetry.find({ deviceId })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  return { device, telemetry };
};

export const generateDeviceSummary = async (
  deviceId: string,
): Promise<string> => {
  const { device, telemetry } = await getDeviceContext(deviceId);

  const contextStr = JSON.stringify({
    deviceType: device.type,
    status: device.status,
    recentTelemetry: telemetry.map((t) => t.metrics),
  });

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an AI diagnostic assistant for a smart home/facility platform named SayraSphere. Analyze the recent sensor telemetry data provided to you and write a very concise, 2-to-3 sentence human-readable summary about the device's current behavior and status.",
      },
      {
        role: "user",
        content: `Here is the telemetry data for a ${device.name}: ${contextStr}`,
      },
    ],
    model: "llama-3.3-70b-versatile", // Fast, efficient Groq model
    temperature: 0.5,
  });

  return (
    completion.choices[0]?.message?.content || "Unable to generate summary."
  );
};

export const detectAnomalies = async (deviceId: string): Promise<string> => {
  const { device, telemetry } = await getDeviceContext(deviceId);

  const contextStr = JSON.stringify({
    deviceType: device.type,
    recentTelemetry: telemetry.map((t) => t.metrics),
  });

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          'You are a predictive maintenance AI for SayraSphere. Analyze the telemetry data provided. If you detect any abnormal spikes, rapid oscillations, or risky operating conditions, return a short warning message explaining the risk. If everything looks stable, just return "Status Nominal: No immediate maintenance required."',
      },
      {
        role: "user",
        content: `Telemetry data for ${device.name}: ${contextStr}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3, // Lower temperature for more analytical responses
  });

  return completion.choices[0]?.message?.content || "Anomaly detection failed.";
};

export const chatWithAssistant = async (
  query: string,
  globalDeviceContext: any,
): Promise<string> => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          'You are "Sayra", the smart AI assistant for the SayraSphere platform. Use the provided JSON device context to accurately answer the user\'s queries about their smart home or facility. Keep responses helpful, concise, and conversational.',
      },
      {
        role: "user",
        content: `Global Device State: ${JSON.stringify(globalDeviceContext)}\n\nUser Query: ${query}`,
      },
    ],
    model: "llama-3.1-8b-instant", // Highly conversational model
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content ||
    "I am sorry, I am currently unable to process your request."
  );
};
