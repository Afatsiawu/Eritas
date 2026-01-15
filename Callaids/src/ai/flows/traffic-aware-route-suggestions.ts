'use server';

/**
 * @fileOverview An AI agent that provides traffic-aware route suggestions for drivers.
 *
 * - getTrafficAwareRouteSuggestions - A function that handles the route suggestion process.
 * - TrafficAwareRouteSuggestionsInput - The input type for the getTrafficAwareRouteSuggestions function.
 * - TrafficAwareRouteSuggestionsOutput - The return type for the getTrafficAwareRouteSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const getRealtimeTraffic = ai.defineTool(
  {
    name: 'getRealtimeTraffic',
    description: 'Get real-time traffic conditions from Google Maps for a given route.',
    inputSchema: z.object({
      origin: z.string().describe("The starting point of the route (e.g., 'Kaneshie Market, Accra')."),
      destination: z.string().describe("The final destination of the route (e.g., 'Madina Zongo Junction, Accra')."),
      waypoints: z.array(z.string()).describe("A list of intermediate stops or points on the route (e.g., ['Accra Mall', 'UPSA Gate']).")
    }),
    outputSchema: z.string().describe("A summary of the real-time traffic conditions from Google Maps, including congestion, incidents, and estimated travel times for route segments."),
  },
  async ({origin, destination, waypoints}) => {
    // In a real application, this would call the Google Maps Directions API.
    // For this demo, we are returning realistic mock data.
    console.log(`Fetching directions from ${origin} to ${destination} via ${waypoints.join(', ')}`);
    return JSON.stringify({
      status: "OK",
      routes: [
        {
          summary: "N1 Hwy",
          legs: [
            {
              summary: "Heavy traffic on N1 Western Bypass",
              distance: { text: "5.2 km", value: 5200 },
              duration: { text: "25 mins", value: 1500 },
              duration_in_traffic: { text: "45 mins", value: 2700 },
              start_address: origin,
              end_address: waypoints[0] || destination,
            },
            {
              summary: "Moderate traffic on Liberation Rd",
              distance: { text: "8.1 km", value: 8100 },
              duration: { text: "15 mins", value: 900 },
              duration_in_traffic: { text: "20 mins", value: 1200 },
              start_address: waypoints[0] || origin,
              end_address: waypoints[1] || destination,
            }
          ],
          warnings: ["Heavy traffic is causing significant delays on the N1 Western Bypass. Consider alternative routes."],
          copyrights: "Map data ©2024 Google",
        },
      ],
    });
  }
);


const TrafficAwareRouteSuggestionsInputSchema = z.object({
  currentBusLocation: z
    .string()
    .describe('The current GPS coordinates or address of the bus.'),
  upcomingStops: z
    .array(z.string())
    .describe('An ordered list of upcoming stops on the route.'),
});
export type TrafficAwareRouteSuggestionsInput = z.infer<
  typeof TrafficAwareRouteSuggestionsInputSchema
>;

const TrafficAwareRouteSuggestionsOutputSchema = z.object({
  suggestedRoute: z
    .string()
    .describe('A description of the suggested route. This should be short, understandable, and precise.'),
  estimatedTravelTime: z
    .string()
    .describe('The estimated travel time for the suggested route.'),
  reasoning: z
    .string()
    .describe('A brief explanation for the suggested route.'),
});
export type TrafficAwareRouteSuggestionsOutput = z.infer<
  typeof TrafficAwareRouteSuggestionsOutputSchema
>;

export async function getTrafficAwareRouteSuggestions(
  input: TrafficAwareRouteSuggestionsInput
): Promise<TrafficAwareRouteSuggestionsOutput> {
  return trafficAwareRouteSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trafficAwareRouteSuggestionsPrompt',
  input: {schema: TrafficAwareRouteSuggestionsInputSchema},
  output: {schema: TrafficAwareRouteSuggestionsOutputSchema},
  tools: [getRealtimeTraffic],
  prompt: `You are an AI assistant for bus drivers. Your task is to provide a traffic-aware route suggestion using real-time data.

  The suggestion must be short, understandable, and precise to avoid delays. Be direct.

  Here is the current situation:
  - Bus Location: {{{currentBusLocation}}}
  - Upcoming Stops: {{{upcomingStops}}}

  Use the 'getRealtimeTraffic' tool to fetch live traffic data for the planned route. Based on the tool's output, provide an optimal route, an estimated travel time, and a brief reason for your suggestion. If the current route is fine, confirm that.`,
});

const trafficAwareRouteSuggestionsFlow = ai.defineFlow(
  {
    name: 'trafficAwareRouteSuggestionsFlow',
    inputSchema: TrafficAwareRouteSuggestionsInputSchema,
    outputSchema: TrafficAwareRouteSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
