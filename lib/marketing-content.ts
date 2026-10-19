export const marketingContent = {
  announcement: "A cooler way to think about every walk",
  nav: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Compare", href: "#compare" },
    { label: "FAQ", href: "#faq" },
  ],
  hero: {
    eyebrow: "Shade-aware walking routes",
    title: "Walk in the shade.",
    description: "The quickest path is not always the kindest one. CoolRoute helps you find a more comfortable walk, balancing sun exposure with the time it takes to get there.",
    primary: "Plan a cool route",
    secondary: "See how it works",
    note: "A little more shade. A better way there.",
  },
  // TODO: Replace all illustrative metrics with validated measurements from real routes.
  stats: [
    { value: "56 pp", label: "less direct sun on this sample route" },
    { value: "+2 min", label: "walking time traded for more shade" },
    { value: "22%", label: "of the sample route in direct sun" },
    { value: "1.4 km", label: "illustrative city walk" },
  ],
  how: {
    eyebrow: "A simple idea, thoughtfully done",
    title: "A better walk starts before you leave.",
    intro: "Tell CoolRoute where you are going. It looks beyond the shortest line to help you understand the walk ahead.",
    steps: [
      { number: "01", title: "Choose your two places", description: "Add a starting point and destination. CoolRoute finds walkable paths between them." },
      { number: "02", title: "Set the moment and your comfort", description: "Sun angle changes through the day. Choose when you will walk and how much extra time feels right." },
      { number: "03", title: "Compare the routes", description: "See the time and modeled sun exposure side by side, then pick the path that suits you." },
    ],
  },
  features: {
    eyebrow: "Made for the walk outside",
    title: "More context for the way there.",
    intro: "Small details make a real difference when the sun is strong.",
    items: [
      { icon: "route", title: "Shade-first routing", description: "Compare practical walking paths with shade and direct sun in view." },
      { icon: "heat", title: "A heat exposure budget", description: "Set a comfort target and see how route choices compare with it." },
      { icon: "sun", title: "Time-aware sunlight", description: "Model the sun’s position for the time you plan to leave." },
      { icon: "trees", title: "Street-level shade cues", description: "Use available building and tree-cover context to estimate shaded segments." },
      { icon: "slider", title: "Your time trade-off", description: "Decide whether a small detour is worth spending less time in direct sun." },
      { icon: "phone", title: "Ready for the sidewalk", description: "Plan and compare routes on a phone, wherever your day takes you." },
    ],
  },
  comparison: {
    eyebrow: "The route is yours to choose",
    title: "Shortest is one answer. Comfortable is another.",
    intro: "A quick look at how a sample trip can change when shade becomes part of the plan.",
    routes: {
      fastest: { name: "Shortest route", time: "12 min", exposure: "78% sun", distance: "0.9 km", note: "Direct and quick, with more time in open sun." },
      cool: { name: "CoolRoute", time: "14 min", exposure: "22% sun", distance: "1.0 km", note: "A little longer, with more of the walk in modeled shade." },
    },
  },
  // TODO: Replace sample quotes with approved, attributable feedback from real users.
  testimonials: {
    eyebrow: "Notes from the walk",
    title: "Designed around how a walk feels.",
    items: [
      { quote: "I’d happily add a couple of minutes if I knew the route had more shade.", byline: "Sample walker · placeholder" },
      { quote: "Seeing the time and sun exposure together makes the choice feel simple.", byline: "Sample walker · placeholder" },
      { quote: "It helps me plan the walk I want to take, not just the fastest one.", byline: "Sample walker · placeholder" },
    ],
  },
  faq: {
    eyebrow: "A few useful answers",
    title: "Frequently asked questions.",
    items: [
      { question: "How does CoolRoute choose a shadier path?", answer: "It compares available pedestrian routes and estimates how much of each route may be in direct sun at your selected time. The estimate depends on the map and shade data available for that area." },
      { question: "Will the shadiest route always be the shortest?", answer: "Usually not. CoolRoute shows the walking-time trade-off alongside modeled sun exposure so you can choose what works for you." },
      { question: "Does the sun estimate change during the day?", answer: "Yes. The sun’s position changes over time, so the model can give different exposure estimates for different departure times." },
      { question: "Is this a medical or exact temperature forecast?", answer: "No. CoolRoute is a route-planning aid. Sun exposure estimates are not a measurement of body temperature, medical advice, or a guarantee of shade on the ground." },
      { question: "Can I use CoolRoute on my phone?", answer: "Yes. The planner and route comparison are designed to work on mobile screens as well as desktop." },
    ],
  },
  closing: {
    eyebrow: "A better way to get there",
    title: "Make room for a little more shade.",
    description: "Plan your next walk with sunlight and comfort in mind.",
    button: "Try CoolRoute",
  },
  footer: {
    description: "A walking route planner that helps you see the sun, find the shade, and choose the way that feels right.",
    groups: [
      { title: "Product", links: [{ label: "How it works", href: "#how-it-works" }, { label: "Features", href: "#features" }, { label: "Compare routes", href: "#compare" }, { label: "Plan a walk", href: "/planner" }] },
      { title: "Company", links: [{ label: "About CoolRoute", href: "#how-it-works" }, { label: "Contact", href: "mailto:hello@example.com" }] },
      { title: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
    ],
    // TODO: Replace the contact address and add approved privacy and terms copy before launch.
    legalNotes: [
      { id: "privacy", label: "Privacy policy", text: "TODO: publish the approved privacy policy before public launch." },
      { id: "terms", label: "Terms of use", text: "TODO: publish the approved terms of use before public launch." },
    ],
  },
} as const;
