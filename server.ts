import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client dynamically on server with telemetry user-agent
function getGeminiClient(): GoogleGenAI | null {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean any roleplay asterisks, markdown bold stars, or stray asterisks from text
function cleanOctoText(text: string): string {
  if (!text) return '';
  return text
    // Remove decorative actions like *waves*, *tentacles wave*, *blub blub*, *ink alert*, etc.
    .replace(/\*[a-zA-Z\s,!'’~-]{1,50}\*/g, '')
    // Remove markdown bold asterisks **word** -> word
    .replace(/\*{2,}([^*]+)\*{2,}/g, '$1')
    // Remove ALL remaining asterisks
    .replace(/\*/g, '')
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const OCTO_SYSTEM_PROMPT = `
You are Octo 🐙, the friendly, knowledgeable AI travel assistant for Emerald Andaman.

CRITICAL RULES:
1. TOPICS YOU ANSWER:
   - Answer ANY question about Andaman & Nicobar Islands (beaches, ferry timings, scuba diving, hotels, food, local spots, Cellular Jail, permits, weather, itineraries).
   - Answer ANY question about this app (how to plan trips, view reels, save bookmarks, switch themes, voice chat, profile).
   - Answer directly and accurately to whatever the user asks.

2. SHORT & DIRECT ANSWERS:
   - Keep answers SHORT and crisp: strictly 2 to 3 sentences (or short, clean bullet points with simple '-' dashes).
   - Never write essays, walls of text, or verbose commentary.

3. ZERO ASTERISKS:
   - NEVER use asterisks (*). No bold stars (**word**), no italic stars (*word*), no bullet stars (* item), and no roleplay actions (*waves*). Clean plain text only.

4. DO NOT CONTINUOUSLY LIST WHAT TO ASK:
   - NEVER provide a menu or list of questions the user should ask.
   - Do NOT say "You can ask me about A, B, C, or D".
   - Just directly answer what the user asked.

5. TONE:
   - Friendly, warm, helpful, and concise. If asked in Hindi or Hinglish, reply briefly in natural Hindi or Hinglish without asterisks.
`;

// Comprehensive concise response engine for Octo when Gemini API key is missing or offline
function getOctoLocalResponse(query: string): string {
  const lower = query.toLowerCase().trim();
  const isHindi =
    lower.includes('kya') ||
    lower.includes('kaise') ||
    lower.includes('batao') ||
    lower.includes('kaha') ||
    lower.includes('kab') ||
    lower.includes('itinerary') ||
    /[\u0900-\u097F]/.test(query);

  // APP RELATED QUERIES
  // App planner
  if (lower.includes('how to use') && lower.includes('plan') || lower.includes('how to plan') || lower.includes('planner tab')) {
    return "Tap the Plan tab in the bottom bar to generate or customize your day-by-day Andaman itinerary. You can adjust trip duration, islands, travel style, and budget tiers.";
  }

  // App reels / explore
  if (lower.includes('reel') || lower.includes('video') || lower.includes('explore tab')) {
    return "Tap the Reels tab at the bottom to watch full-screen 2x2 reels of Andaman beaches, diving spots, and scenic locations. You can also like and bookmark reels.";
  }

  // App save / bookmark
  if (lower.includes('save') || lower.includes('bookmark') || lower.includes('favorite')) {
    return "Tap the bookmark icon on any island card, activity, or reel to save it. You can access all your saved items anytime in your Profile tab.";
  }

  // App themes
  if (lower.includes('theme') || lower.includes('dark mode') || lower.includes('light mode') || lower.includes('color')) {
    return "Tap the palette icon in the top header to switch between 4 themes: Abyss Blue, Midnight Minimal, Oceanic Light, and Pure White.";
  }

  // App voice chat
  if (lower.includes('voice') || lower.includes('speak') || lower.includes('mic') || lower.includes('audio') || lower.includes('listen')) {
    return "Tap the microphone icon next to the chat input to speak with me directly. You can also tap the speaker icon in the header or beside any message to hear voice responses.";
  }

  // App profile
  if (lower.includes('profile') || lower.includes('account')) {
    return "Tap the Profile tab in the bottom bar to review your saved islands, custom itineraries, and travel profile.";
  }

  // App tour guide
  if (lower.includes('tour') || lower.includes('guide') || lower.includes('tutorial')) {
    return "The app features an interactive spotlight tour that guides you through every feature. You can explore all pages seamlessly from the bottom navigation.";
  }

  // ANDAMAN TRAVEL QUERIES (concise, direct, zero asterisks)
  // 1. Cellular Jail & Sound and Light Show
  if (lower.includes('cellular') || lower.includes('jail') || lower.includes('kaala paani') || lower.includes('kala pani') || lower.includes('light and sound') || lower.includes('sound and light')) {
    if (isHindi) {
      return "Cellular Jail subah 9:00 AM se 4:00 PM tak khula rehta hai (Monday closed). Shaam ko Sound & Light show 5:30 PM aur 6:45 PM par hota hai. Show ki tickets 2 din pehle official portal se book kar lein.";
    }
    return "Cellular Jail in Port Blair is open 9:00 AM to 4:00 PM (closed Mondays). Evening Sound & Light shows run at 5:30 PM and 6:45 PM in Hindi and English. Book show tickets 2-3 days in advance on the official Andaman Tourism portal.";
  }

  // 2. Best time to visit / Weather / Seasons / Monsoon
  if (lower.includes('best time') || lower.includes('season') || lower.includes('weather') || lower.includes('when to visit') || lower.includes('monsoon') || lower.includes('rain') || lower.includes('climate')) {
    return "The best time to visit Andaman is October to May when the sea is calm and underwater visibility is clear. Monsoon lasts from June to September with rain and possible ferry delays. November to March is ideal for comfortable weather and water sports.";
  }

  // 3. Ross Island / North Bay
  if (lower.includes('ross island') || lower.includes('netaji') || lower.includes('subhash') || lower.includes('north bay')) {
    return "Ross Island is 15 minutes by ferry from Port Blair, famous for British ruins, spotted deer, and peacocks. North Bay is known for sea walking, glass-bottom boats, and coral snorkeling. Combined boat trips depart from Aberdeen Jetty.";
  }

  // 4. Elephant Beach
  if (lower.includes('elephant beach') || lower.includes('hathi beach') || lower.includes('trek elephant')) {
    return "Elephant Beach on Havelock is reachable by a 20-minute speedboat from Havelock Jetty or a scenic 2-km jungle trek. It is the premier hub for sea walking, snorkeling, and jet skis. Water activities close by 3:00 PM.";
  }

  // 5. Baratang Island / Limestone Caves / Mud Volcano
  if (lower.includes('baratang') || lower.includes('limestone') || lower.includes('cave') || lower.includes('mud volcano')) {
    return "Baratang Island is 100 km north of Port Blair. Trips start early at 3:30 AM via police convoy through the Jarawa Tribal Reserve. A speedboat through mangrove tunnels takes you to the stalactite limestone caves.";
  }

  // 6. Neil Island / Shaheed Dweep (Beaches, Natural Bridge, Sunsets)
  if (lower.includes('neil') || lower.includes('shaheed') || lower.includes('natural bridge') || lower.includes('laxmanpur') || lower.includes('bharatpur') || lower.includes('sitapur')) {
    return "Neil Island is quiet and easily explored by scooter. Visit the living coral Natural Bridge strictly during low tide. Enjoy Bharatpur Beach for gentle shallow swimming and Laxmanpur Beach for spectacular sunsets.";
  }

  // 7. Scuba Diving / Snorkeling / Non-swimmers
  if (lower.includes('scuba') || lower.includes('diving') || lower.includes('nemo') || lower.includes('snork') || lower.includes('sea walk') || lower.includes('swim')) {
    return "Non-swimmers can definitely do Scuba Diving! Discover Scuba Diving (DSD) is conducted 1-on-1 with a certified PADI or SSI instructor holding you throughout. Nemo Reef at Havelock is the top beginner site. Always wait 24 hours after diving before flying.";
  }

  // 8. Ferries / Catamarans / Makruzz / Nautika / Green Ocean / DSS / Boats
  if (lower.includes('ferr') || lower.includes('boat') || lower.includes('catamaran') || lower.includes('makruzz') || lower.includes('nautika') || lower.includes('green ocean') || lower.includes('dss') || lower.includes('cruis') || lower.includes('ship')) {
    return "High-speed private catamarans like Nautika and Makruzz take about 90 minutes between Port Blair and Havelock, and 45 minutes between Havelock and Neil. Book tickets 10 to 14 days ahead in peak season and report to the jetty 45 minutes before departure.";
  }

  // 9. Flights / How to Reach / Airport
  if (lower.includes('flight') || lower.includes('reach') || lower.includes('airport') || lower.includes('how to get') || lower.includes('ixz')) {
    return "Port Blair's Veer Savarkar International Airport (IXZ) has direct daily flights from Chennai, Kolkata, Bengaluru, Mumbai, and Delhi. Fly into Port Blair, then take catamarans to Havelock and Neil.";
  }

  // 10. Hotels / Resorts / Stays
  if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') || lower.includes('accommodation') || lower.includes('lodge')) {
    return "Havelock offers beachside resorts at Beach No. 3 and 5 (like Taj Exotica, Barefoot, and Sea Shell). Neil Island has cozy boutique cottages near Laxmanpur. Book 3 to 4 weeks ahead for peak winter months.";
  }

  // 11. Budget / Cost / Prices
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || lower.includes('expense') || lower.includes('kitna kharcha')) {
    return "A comfortable 5-day Andaman trip typically costs 25,000 to 45,000 Rupees per person excluding airfare. Budget travel ranges around 15,000 to 20,000 Rupees. Check the Plan tab to tailor your budget tier.";
  }

  // 9. Cash / ATM / Money / Banking
  if (lower.includes('cash') || lower.includes('atm') || lower.includes('money') || lower.includes('upi') || lower.includes('card')) {
    return "Always carry at least 5,000 to 8,000 Rupees in cash from Port Blair. ATMs on Neil Island frequently run out of cash, and remote beach cafes often have poor mobile network for UPI payments.";
  }

  // 10. Radhanagar Beach
  if (lower.includes('radhanagar') || lower.includes('beach 7') || lower.includes('beach no 7')) {
    return "Radhanagar Beach on Havelock Island is ranked among Asia's top beaches for its turquoise water and sunset. Arrive by 3:30 PM to swim before lifeguards restrict deep water at 5:00 PM. Single-use plastic bottles are prohibited.";
  }

  // 11. Permits, Passport, IDs for Indians & Foreigners
  if (lower.includes('permit') || lower.includes('rap') || lower.includes('passport') || lower.includes('id') || lower.includes('foreigner') || lower.includes('visa')) {
    return "Indian citizens need only an original Government Photo ID (Aadhaar, Passport, or Driving License) for hotel and ferry check-ins. Foreign tourists only need a valid Indian Visa and passport, as Restricted Area Permits are no longer required for major islands.";
  }

  // 12. Night Kayaking & Bioluminescence
  if (lower.includes('biolum') || lower.includes('kayak') || lower.includes('night kayak') || lower.includes('glow')) {
    return "Bioluminescent night kayaking happens in Havelock mangrove canals. Water glows electric blue when your paddle moves through phytoplankton. It is best experienced on new moon nights with minimal moonlight.";
  }

  // 13. Packing checklist
  if (lower.includes('pack') || lower.includes('what to wear') || lower.includes('clothes') || lower.includes('shoes')) {
    return "Essential packing items include reef-safe sunscreen (SPF 50+), aqua shoes for coral walking, a waterproof phone pouch or dry bag, breathable cotton clothing, government photo ID, and cash.";
  }

  // 14. Food & Dining / Seafood / Vegetarian
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('seafood') || lower.includes('veg') || lower.includes('curry')) {
    return "Try fresh local Andaman fish curry and grilled tiger prawns. For vegetarian dining in Port Blair, visit Annapurna or Icy Spicy. In Havelock, Something Different and Full Moon Cafe serve great seafood, continental, and vegetarian food.";
  }

  // 15. Diglipur & Ross & Smith Twin Islands
  if (lower.includes('diglipur') || lower.includes('ross and smith') || lower.includes('ross & smith') || lower.includes('twin island') || lower.includes('saddle peak')) {
    return "Diglipur is 300 km north of Port Blair and famous for the Ross and Smith twin islands, connected by a natural white sandbar. It is ideal for travelers with 7 or more days seeking pristine, crowd-free beaches.";
  }

  // 16. Itinerary & Trip Planning
  if (lower.includes('itinerary') || lower.includes('plan') || lower.includes('days') || lower.includes('trip') || lower.includes('schedule')) {
    if (isHindi) {
      return "Andaman ke 5 din ka ideal plan: Day 1 Port Blair & Cellular Jail, Day 2 Havelock & Radhanagar sunset, Day 3 Elephant Beach water sports, Day 4 Neil Island Natural Bridge & Laxmanpur, Day 5 Bharatpur swim aur Port Blair return. Detailed plan ke liye Plan tab kholein.";
    }
    return "Here is a balanced 5-day route: Day 1 Cellular Jail in Port Blair, Day 2 Catamaran to Havelock and Radhanagar Beach sunset, Day 3 Elephant Beach snorkeling and water sports, Day 4 Ferry to Neil Island and Natural Bridge walk, Day 5 Bharatpur lagoon swim and return to Port Blair. You can customize this in the Plan tab.";
  }

  // 17. Greetings & General Conversational
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('who are you') || lower.includes('what can you do')) {
    return "Hello! How can I help you today with Andaman travel or this app?";
  }

  // 18. Default fallback for any open question
  return "I am happy to help. What would you like to know about Andaman or this app?";
}

// Chat API route
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        console.log(`[Gemini AI] Processing query via gemini-3.8-flash: "${message.slice(0, 60)}"`);
        const chatContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-8)) {
            if (item && item.role && Array.isArray(item.parts)) {
              chatContents.push({
                role: item.role === 'model' ? 'model' : 'user',
                parts: [{ text: item.parts[0]?.text || '' }],
              });
            }
          }
        }

        chatContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatContents,
          config: {
            systemInstruction: OCTO_SYSTEM_PROMPT,
            temperature: 0.8,
          },
        });

        const reply = response.text;
        if (reply && reply.trim()) {
          const sanitized = cleanOctoText(reply);
          console.log('[Gemini AI] Response generated successfully');
          res.json({ reply: sanitized, poweredBy: 'gemini' });
          return;
        }
      } catch (err: any) {
        console.warn('[Gemini AI] Call failed, using knowledge fallback:', err?.message || err);
      }
    } else {
      console.log('[Gemini AI] No API key present, using intelligent Andaman knowledge engine');
    }

    // Fallback response
    const fallbackReply = cleanOctoText(getOctoLocalResponse(message));
    res.json({ reply: fallbackReply, poweredBy: 'local' });
  } catch (error) {
    console.error('Server error in /api/chat:', error);
    res.status(500).json({
      reply: "My tentacles got tangled in some seaweed for a second. Please ask me again!",
      poweredBy: 'error',
    });
  }
});

// Itinerary generation API route
app.post('/api/itinerary/generate', async (req: Request, res: Response) => {
  try {
    const {
      days = 5,
      travelStyle = 'Balanced Explorer',
      islands = ['Havelock Island', 'Neil Island', 'Port Blair'],
      budget = 'Comfort Standard',
      travelers = 'Couple',
    } = req.body;

    const parsedDays = Math.min(Math.max(Number(days) || 5, 2), 10);
    const ai = getGeminiClient();

    if (ai) {
      try {
        console.log(`[Gemini AI] Generating ${parsedDays}-day itinerary with gemini-3.8-flash...`);
        const prompt = `
Create a comprehensive, personalized, day-by-day travel itinerary for a ${parsedDays}-day trip to the Andaman Islands.
Travel Style: ${travelStyle}
Target Islands: ${Array.isArray(islands) ? islands.join(', ') : 'Port Blair, Havelock, Neil'}
Budget tier: ${budget}
Travelers: ${travelers}
Personality: Generated by OCTO 🐙 for EMERALD ANDAMAN.
Requirements:
- Realistic Andaman logistics: accounts for ferry departures (Nautika/Makruzz/DSS), check-in times, sunset timing (~5:15 PM), tide constraints for Natural Bridge.
- Each day must include Morning, Afternoon, and Sunset/Evening activities.
- Provide practical transport advice (scooter rental, auto, private cab, catamaran ferry).
- Highlight dining suggestions (fresh Andaman fish curry, seaside pizza cafes).
- Return valid JSON matching the exact schema.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: OCTO_SYSTEM_PROMPT + `\nYou must respond ONLY with clean valid JSON according to the schema. Do not add markdown backticks.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tagline: { type: Type.STRING },
                octoIntro: { type: Type.STRING },
                totalDays: { type: Type.INTEGER },
                estimatedBudgetPerPerson: { type: Type.STRING },
                bestSeason: { type: Type.STRING },
                essentialPacking: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.INTEGER },
                      island: { type: Type.STRING },
                      dayTheme: { type: Type.STRING },
                      octoSecretTip: { type: Type.STRING },
                      morning: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          activity: { type: Type.STRING },
                          location: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                        required: ['time', 'activity', 'location', 'description'],
                      },
                      afternoon: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          activity: { type: Type.STRING },
                          location: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                        required: ['time', 'activity', 'location', 'description'],
                      },
                      evening: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          activity: { type: Type.STRING },
                          location: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                        required: ['time', 'activity', 'location', 'description'],
                      },
                      diningSpot: { type: Type.STRING },
                      logisticsSummary: { type: Type.STRING },
                    },
                    required: ['dayNumber', 'island', 'dayTheme', 'octoSecretTip', 'morning', 'afternoon', 'evening', 'diningSpot', 'logisticsSummary'],
                  },
                },
              },
              required: ['title', 'tagline', 'octoIntro', 'totalDays', 'estimatedBudgetPerPerson', 'bestSeason', 'essentialPacking', 'days'],
            },
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          res.json({ itinerary: parsed });
          return;
        }
      } catch (err) {
        console.warn('Gemini itinerary generation error, using fallback:', err);
      }
    }

    // Dynamic fallback itinerary
    const fallbackItinerary = {
      title: `Octo's Handpicked ${parsedDays}-Day Andaman Archipelago Escape`,
      tagline: `Sunlit turquoise lagoons, living coral reefs, and tranquil island magic`,
      octoIntro: `🐙 *Tentacles ready!* I've crafted the ultimate ${parsedDays}-day escape tailored for ${travelers} with a ${travelStyle.toLowerCase()} vibe. Every ferry connection, sunset spot, and coconut break is timed to oceanic perfection!`,
      totalDays: parsedDays,
      estimatedBudgetPerPerson: '₹22,000 - ₹34,000',
      bestSeason: 'October to May',
      essentialPacking: [
        'Reef-safe biodegradable sunscreen (SPF 50+)',
        'Waterproof dry-bag / phone pouch',
        'Aqua shoes for rocky reef walks at Neil',
        'At least ₹5,000-8,000 in cash for Neil Island',
        'Original Govt Photo ID for ferry boarding',
        'Polarized UV sunglasses & rash guard',
      ],
      days: [
        {
          dayNumber: 1,
          island: 'Port Blair (Sri Vijaya Puram)',
          dayTheme: 'Arrival, Cellular Jail & Sound & Light Show',
          octoSecretTip: 'Grab a window seat on the left side of your flight into Port Blair for dramatic aerial reef views!',
          morning: {
            time: '09:00 AM - 12:30 PM',
            activity: 'Airport Arrival & Waterfront Check-in',
            location: 'Port Blair Waterfront',
            description: 'Check in, enjoy fresh tender coconut water, and take in the tropical harbor air.',
          },
          afternoon: {
            time: '01:30 PM - 04:30 PM',
            activity: 'Cellular Jail Memorial Tour',
            location: 'Atlanta Point, Port Blair',
            description: "Explore the historic seven-wing colonial prison (Kaala Paani) and Veer Savarkar's solitary cell.",
          },
          evening: {
            time: '05:30 PM - 08:30 PM',
            activity: 'Cellular Jail Sound & Light Show',
            location: 'Memorial Courtyard',
            description: 'Stirring historical presentation under the stars, followed by fresh seafood dinner.',
          },
          diningSpot: 'New Lighthouse Restaurant or Amaya Rooftop',
          logisticsSummary: 'Airport cab (~₹500), auto-rickshaws for city travel.',
        },
        {
          dayNumber: 2,
          island: 'Havelock Island (Swaraj Dweep)',
          dayTheme: 'High-Speed Catamaran & Asia #1 Radhanagar Sunset',
          octoSecretTip: 'Rent a 125cc scooter right at Havelock Jetty! The roads are paved and flat.',
          morning: {
            time: '07:30 AM - 11:00 AM',
            activity: 'Catamaran Cruise to Havelock',
            location: 'Phoenix Bay Jetty to Havelock Jetty',
            description: 'Board Nautika or Makruzz catamaran for a 90-minute scenic voyage.',
          },
          afternoon: {
            time: '12:30 PM - 03:00 PM',
            activity: 'Kalapathar Beach Coastal Ride',
            location: 'Kalapathar Beach',
            description: 'Marvel at black volcanic rocks contrasting against luminescent aqua waters.',
          },
          evening: {
            time: '03:45 PM - 06:30 PM',
            activity: 'Radhanagar Beach Sunset (Beach No. 7)',
            location: 'Radhanagar Beach',
            description: "Asia's premier beach! Dip toes into powder-soft white sand as the sun sets in amber.",
          },
          diningSpot: 'Something Different - A Beachside Cafe',
          logisticsSummary: 'Catamaran ferry (90 mins), scooter rental (~₹500/day).',
        },
      ],
    };

    res.json({ itinerary: fallbackItinerary });
  } catch (error) {
    console.error('Server error in /api/itinerary/generate:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// Static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EMERALD ANDAMAN server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
