import type { LeadInput } from "./schemas";

// Realistic enquiries that cover the range a sales team sees: urgent and qualified,
// urgent but under-budgeted, vague, investor with blockers, Hindi and Hinglish.
// Used by "Try an example" on the form and by scripts/seed.mjs.
export const SAMPLE_LEADS: LeadInput[] = [
  {
    name: "Priya Sharma",
    phone: "+91 98450 12873",
    location: "Whitefield, Bengaluru",
    requirement: "3BHK, ready to move, near a CBSE school",
    budget: "₹1.3–1.5 Cr",
    timeline: "1–3 months",
    message:
      "Hi, my husband has moved to a role at ITPL and we're relocating from Pune with our two kids. We need a ready-to-move 3BHK close to a CBSE school, ideally within 3 km of ITPL. Our home loan is pre-approved with HDFC up to 1.2 Cr and we have the rest as down payment. School admissions close in April so we want to finalise soon. Can we see a few options this Saturday? One worry: we've heard Whitefield has water supply issues, so we'd want a society with reliable water.",
  },
  {
    name: "Rohit Verma",
    phone: "98110 45672",
    location: "Sector 150, Noida",
    requirement: "2BHK, ready to move only",
    budget: "₹75 L max",
    timeline: "Within 1 month",
    message:
      "Hello sir, mujhe Sector 150 mein 2BHK chahiye, ready to move hi chahiye kyunki mera rent agreement next month khatam ho raha hai. Budget 75 lakh tak hai, usse upar nahi ja paunga. Loan ke liye abhi apply nahi kiya. Kya is budget mein koi option milega? Under construction ho toh mat bhejna.",
  },
  {
    name: "Neha Gupta",
    phone: "94140 77812",
    location: "Mansarovar, Jaipur",
    requirement: "2BHK for parents, ground floor or lift",
    budget: "₹45–50 L",
    timeline: "1–3 months",
    message:
      "नमस्ते, मुझे मानसरोवर में अपने माता-पिता के लिए 2BHK फ्लैट चाहिए। पापा अगले महीने रिटायर हो रहे हैं और उनके घुटनों में दर्द रहता है, इसलिए ग्राउंड फ्लोर या लिफ्ट वाली बिल्डिंग ज़रूरी है। बजट 45 से 50 लाख है, PF का पैसा आने के बाद पूरा पेमेंट कर देंगे। पास में अस्पताल और मंदिर हो तो अच्छा रहेगा। क्या इस हफ्ते देखने आ सकते हैं?",
  },
  {
    name: "Sanjay Patel",
    phone: "98250 66104",
    location: "SG Highway, Ahmedabad",
    requirement: "1BHK or studio as a rental investment",
    budget: "₹60 L",
    timeline: "1–3 months",
    message:
      "I'm looking at a 1BHK purely as an investment for rental income. Need at least 4% rental yield, otherwise I'll stick with mutual funds. I'd also have to sell my plot in Gandhinagar first to free up the money, and my wife isn't fully convinced about real estate. Can you share expected rent and maintenance for your projects?",
  },
  {
    name: "Ananya Iyer",
    location: "Bandra West, Mumbai",
    requirement: "3BHK sea-facing, high floor, 2 parking",
    budget: "₹2 Cr",
    timeline: "3–6 months",
    message:
      "Looking for a sea-facing 3BHK in Bandra West, preferably on a high floor with parking for 2 cars. Budget is around 2 Cr. Not in a hurry, want to buy sometime this year. Please share whatever you have.",
  },
  {
    name: "Vikram Kapoor",
    phone: "+91 99100 33221",
    location: "Golf Course Road, Gurugram",
    requirement: "4BHK luxury apartment or penthouse",
    budget: "₹7–9 Cr",
    timeline: "6+ months",
    message:
      "Saw your ad. We might upgrade next year after my son's wedding in February. Send brochures for your top projects on Golf Course Road, will look when time permits.",
  },
];
