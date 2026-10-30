const crypto = require("node:crypto");
const { generateAIResponse, readSettings } = require("./chatAiProvider");

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 6;
const MAX_HISTORY_MESSAGE_LENGTH = 300;
const MAX_AI_CALLS_PER_DAY = 50;
const AI_RESPONSE_CACHE_TTL_MS = 60 * 1000;
const AI_RESPONSE_CACHE_MAX_SIZE = 200;
const PRODUCT_FIELDS = [
  "name",
  "description",
  "category",
  "brand",
  "tags",
  "colors",
  "sizes",
  "collections",
  "gender",
  "material",
];
const PRODUCT_COLORS = [
  "black", "blue", "brown", "green", "grey", "gray", "orange", "pink",
  "purple", "red", "white", "yellow",
];
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "megakart991@gmail.com";

const STOP_WORDS = new Set([
  "a", "about", "an", "and", "are", "best", "buy", "can",
  "could", "find", "for", "from", "get", "give", "have", "help", "i",
  "in", "is", "it", "me", "of", "on", "or", "please", "product",
  "products", "recommend", "recommendation", "show", "some", "the", "to",
  "under", "below", "less", "than", "within", "with", "budget", "around",
  "price", "cost", "my", "what", "you", "something", "anything", "item",
  "items", "option", "options", "looking", "want", "shop", "shopping",
  "wear", "stylish", "trendy", "nice", "good", "me",
  "yes", "yeah", "yep", "sure", "okay", "ok", "use", "usd", "dollar",
  "dollars", "confirm", "treat", "as",
]);

const SEARCH_ALIASES = {
  apparel: ["top wear", "bottom wear", "shirt", "trousers", "dress", "jacket"],
  clothes: ["apparel", "top wear", "bottom wear", "shirt", "trousers", "dress"],
  clothing: ["apparel", "top wear", "bottom wear", "shirt", "trousers", "dress"],
  cloths: ["clothes", "apparel", "top wear", "bottom wear"],
  tee: ["t-shirt", "tshirt"],
  tees: ["t-shirts", "tshirt"],
  tshirt: ["t-shirt", "tee"],
  tshirts: ["t-shirts", "tee"],
  trouser: ["trousers", "pants"],
  pant: ["pants", "trousers"],
  jean: ["jeans", "denim"],
  retun: ["return"],
  shiping: ["shipping"],
};

const ORDER_STATUS_INTENT =
  /\b(?:track(?:ing)?\s+(?:my\s+)?order|where(?:'s| is)\s+my\s+(?:order|package)|my\s+(?:recent|latest|previous)\s+orders?\b|my\s+orders\b|\borders?\s+(?:status|update|progress)\b|\bmy\s+order\s+(?:status|update|progress|shipped|delivered|arrived|processed)\b|\bstatus\s+(?:of|for)\s+(?:my\s+)?order\b|\b(?:check|update)\s+(?:on\s+)?(?:my\s+)?order\b|\bupdate\s+(?:about|on)\s+my\s+order\b|when\s+(?:will|should)\s+my\s+(?:order|package)\s+arrive|(?:order|package)\s+[a-f\d]{24})/i;
const ORDER_ID = /\b[a-f\d]{24}\b/i;
const GREETING = /^(?:hi|hello|hey|good morning|good afternoon|good evening|howdy|namaste)[!.?,\s]*$/i;
const BUDGET_PHRASE =
  /\b(?:under|below|less than|within|budget(?:\s+(?:of|is|around))?|up to|around)\s*(₹|rs\.?|inr|\$)?\s*([\d,]+(?:\.\d{1,2})?)\s*(rupees?|inr|dollars?)?/i;
const CURRENCY_AMOUNT = /(₹|rs\.?|inr|\$)\s*([\d,]+(?:\.\d{1,2})?)/i;
const AMOUNT_WITH_CURRENCY_SUFFIX = /([\d,]+(?:\.\d{1,2})?)\s*(rupees?|inr|dollars?)\b/i;

const responseCache = new Map();
let dailyAIUsage = { date: new Date().toISOString().slice(0, 10), count: 0 };

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBudget = (text) => {
  const phraseMatch = text.match(BUDGET_PHRASE);
  const prefixMatch = phraseMatch ? null : text.match(CURRENCY_AMOUNT);
  const suffixMatch = phraseMatch || prefixMatch ? null : text.match(AMOUNT_WITH_CURRENCY_SUFFIX);
  if (!phraseMatch && !prefixMatch && !suffixMatch) return null;

  const amountText = phraseMatch?.[2] || prefixMatch?.[2] || suffixMatch?.[1];
  const currencyText =
    `${phraseMatch?.[1] || prefixMatch?.[1] || ""} ${phraseMatch?.[3] || suffixMatch?.[2] || ""}`.toLowerCase();
  const amount = Number(amountText.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) return null;

  return {
    amount,
    currency: /₹|rs\.?|inr|rupees?/.test(currencyText) ? "INR" : "USD",
  };
};

const normalizeSpelling = (word) => {
  const corrections = {
    shrit: "shirt",
    tshrit: "tshirt",
    cltohes: "clothes",
    cloths: "clothes",
    dres: "dress",
    jeens: "jeans",
    hoodi: "hoodie",
    swetshirt: "sweatshirt",
    retun: "return",
    shiping: "shipping",
  };
  return corrections[word] || word;
};

const extractSearchTerms = (text) => {
  const withoutBudget = text
    .replace(BUDGET_PHRASE, " ")
    .replace(CURRENCY_AMOUNT, " ")
    .replace(AMOUNT_WITH_CURRENCY_SUFFIX, " ")
    .replace(/\b\d+(?:\.\d{1,2})?\b/g, " ")
    .toLowerCase();

  return [...new Set(
    withoutBudget
      .split(/[^a-z0-9]+/)
      .map(normalizeSpelling)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
  )].slice(0, 8);
};

const expandSearchTerms = (terms) =>
  [...new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] || [])]))]
    .slice(0, 20);

const isProductRequest = (message, history = []) => {
  if (parseBudget(message)) return true;
  if (/\b(?:product|item|shirt|tee|top|trouser|pant|dress|jacket|hoodie|jean|coat|sweater|skirt|shoe|bag|accessor|wear|clothes|clothing|apparel)\w*\b/i.test(message)) {
    return true;
  }
  if (/\b(?:show|find|recommend|suggest|browse|shop for|looking for|want to buy)\b/i.test(message)) {
    return true;
  }

  const lastUserMessage = history.filter((entry) => entry.role === "user").at(-1)?.content || "";
  return isProductRequestWithoutHistory(lastUserMessage) &&
    /\b(?:it|that|those|them|one|ones|color|colour|size|another|similar|cheaper|black|blue|red|white)\b/i.test(message);
};

const isProductRequestWithoutHistory = (message) =>
  Boolean(parseBudget(message)) ||
  /\b(?:product|item|shirt|tee|top|trouser|pant|dress|jacket|hoodie|jean|coat|sweater|skirt|shoe|bag|accessor|wear|clothes|clothing|apparel)\w*\b|\b(?:show|find|recommend|suggest|browse|shop for|looking for|want to buy)\b/i.test(message);

const isOrderStatusRequest = (message, history = []) => {
  if (ORDER_STATUS_INTENT.test(message) || ORDER_ID.test(message)) return true;
  const lastAssistantMessage =
    history.filter((entry) => entry.role === "assistant").at(-1)?.content || "";
  return ORDER_STATUS_INTENT.test(lastAssistantMessage) &&
    /\b(?:it|that|one|order|status|tracking|track|where|when)\b/i.test(message);
};

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) =>
      entry &&
      ["user", "assistant"].includes(entry.role) &&
      typeof entry.content === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map(({ role, content }) => ({
      role,
      content: content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH),
    }))
    .filter((entry) => entry.content);
};

const sanitizeHistory = (history) =>
  normalizeHistory(history).filter((entry) =>
    !ORDER_ID.test(entry.content) &&
    !ORDER_STATUS_INTENT.test(entry.content)
  );

const sanitizePromptText = (text) =>
  text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email omitted]")
    .replace(/\b(?:my (?:home )?address is|i live at|delivery address is|deliver to|ship to)\s+[^.!?\n]+/gi, "[address omitted]")
    .replace(/\b(?:password|passcode|verification code)\s*(?:is|:|=)\s*\S+/gi, "[credential omitted]")
    .replace(/\b(?:\+?\d[\d ().-]{6,}\d)\b/g, "[phone number omitted]")
    .replace(ORDER_ID, "[order reference omitted]");

const extractProductFilters = (message) => {
  const lowerMessage = message.toLowerCase();
  const color = PRODUCT_COLORS.find((value) =>
    new RegExp(`\\b${value}\\b`, "i").test(lowerMessage)
  );
  const sizeMatch = lowerMessage.match(/\bsize\s*(xxl|xl|xs|s|m|l)\b/i);
  const gender = lowerMessage.match(/\b(?:for|in)\s+(men|women|unisex)\b/i)?.[1];
  return {
    ...(color ? { color } : {}),
    ...(sizeMatch ? { size: sizeMatch[1].toUpperCase() } : {}),
    ...(gender ? { gender: gender[1].toLowerCase() === "men" ? "Men" : gender[1][0].toUpperCase() + gender[1].slice(1) } : {}),
  };
};

const productQuery = (terms, stockOnly = true, filters = {}) => {
  const query = { isPublished: true };
  if (stockOnly) query.countInStock = { $gt: 0 };
  if (filters.color) query.colors = { $regex: escapeRegex(filters.color), $options: "i" };
  if (filters.size) query.sizes = { $regex: `^${escapeRegex(filters.size)}$`, $options: "i" };
  if (filters.gender) query.gender = filters.gender;
  const expandedTerms = expandSearchTerms(terms);
  if (expandedTerms.length) {
    query.$or = expandedTerms.flatMap((term) => PRODUCT_FIELDS.map((field) => ({
      [field]: { $regex: escapeRegex(term), $options: "i" },
    })));
  }
  return query;
};

const pricePipeline = (terms, budget, stockOnly, filters) => [
  { $match: productQuery(terms, stockOnly, filters) },
  {
    $addFields: {
      effectivePrice: {
        $cond: [
          {
            $and: [
              { $gt: ["$discountPrice", 0] },
              { $lt: ["$discountPrice", "$price"] },
            ],
          },
          "$discountPrice",
          "$price",
        ],
      },
    },
  },
  { $match: { effectivePrice: { $lte: budget.amount } } },
  { $sort: { effectivePrice: 1, rating: -1 } },
  { $limit: 6 },
  {
    $project: {
      name: 1,
      description: 1,
      price: 1,
      discountPrice: 1,
      effectivePrice: 1,
      images: 1,
      category: 1,
      brand: 1,
      rating: 1,
      colors: 1,
      sizes: 1,
      gender: 1,
      material: 1,
      collections: 1,
      countInStock: 1,
    },
  },
];

const findProducts = async (Product, terms, budget, filters) => {
  if (budget) {
    return Product.aggregate(pricePipeline(terms, budget, true, filters));
  }
  return Product.find(productQuery(terms, true, filters))
    .sort({ rating: -1, createdAt: -1 })
    .limit(6)
    .select("name description price discountPrice images category brand rating colors sizes countInStock");
};

const findUnavailableProducts = async (Product, terms, budget, filters) => {
  if (budget) {
    return Product.aggregate(pricePipeline(terms, budget, false, filters).map((stage) => {
      if (stage.$match?.["isPublished"]) {
        return { $match: { ...stage.$match, countInStock: { $lte: 0 } } };
      }
      return stage;
    }));
  }
  return Product.find(productQuery(terms, false, filters))
    .where("countInStock")
    .lte(0)
    .limit(3)
    .select("name");
};

const effectivePrice = (product) => {
  const basePrice = Number(product.price);
  const salePrice = Number(product.discountPrice);
  return Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice
    ? salePrice
    : basePrice;
};

const formatBudget = (budget) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: budget.currency }).format(budget.amount);

const buildRuleBasedReply = ({ message, faqAnswer, products, unavailable, budget, isProduct, isClarifyingCurrency }) => {
  if (isClarifyingCurrency) {
    return "MegaKart currently displays product prices in USD. Should I use your stated amount as a USD budget, without converting currencies?";
  }
  if (faqAnswer) return faqAnswer;
  if (GREETING.test(message)) {
    return "Hi! I can help you find something to wear, compare options within a budget, or answer questions about shipping and returns. What are you shopping for?";
  }
  if (isProduct && products.length) {
    return budget
      ? `I found in-stock options within your ${formatBudget(budget)} budget. The product cards show the current catalogue prices.`
      : "I found a few in-stock options that may fit what you're looking for.";
  }
  if (isProduct && unavailable.length) {
    return budget
      ? `I couldn't find an in-stock match within ${formatBudget(budget)}. Some matching items are currently unavailable; would you like to adjust your budget or try another style?`
      : "I found matching items, but they are currently out of stock. Would you like to try a different style or category?";
  }
  if (isProduct && budget) {
    return `I couldn't find an in-stock match within your ${formatBudget(budget)} budget. Would you like to try a different category or budget?`;
  }
  if (isProduct) {
    return "I couldn't find an in-stock match for that search. Try another product name, category, or color.";
  }
  if (/\b(?:thank you|thanks|thx)\b/i.test(message)) {
    return "You're welcome! Let me know what else I can help you find.";
  }
  if (/\b(?:shipping|ship|delivery|deliver|dispatch|arriv)\w*\b/i.test(message)) {
    return `I don't have confirmed shipping prices or delivery estimates. Please email ${SUPPORT_EMAIL} with your order number, if available, and our team can confirm the details.`;
  }
  if (/\b(?:return|refund|exchange)\w*\b/i.test(message)) {
    return `I don't have confirmed return or refund terms. Please email ${SUPPORT_EMAIL} with your order number, if available, and our team can confirm the options for your order.`;
  }
  return `I'm not sure about that yet. I can help with products, budgets, shipping, and returns. For other questions, email ${SUPPORT_EMAIL}.`;
};

const buildFaqAnswer = (message) => {
  const normalized = message
    .replace(/\bretun\b/gi, "return")
    .replace(/\brefnd\b/gi, "refund")
    .replace(/\bshiping\b/gi, "shipping")
    .replace(/\bdelivry\b/gi, "delivery");
  if (/\b(?:return|refund|exchange)\w*\b/i.test(normalized)) {
    return `MegaKart doesn't publish return or refund terms in the information available to me. Please email ${SUPPORT_EMAIL} with your order number, if available, so our team can confirm the options for your order.`;
  }
  if (/\b(?:shipping|ship|delivery|deliver|dispatch|arriv)\w*\b/i.test(normalized)) {
    return `MegaKart doesn't publish shipping prices or delivery estimates in the information available to me. Please email ${SUPPORT_EMAIL} with your order number, if available, so our team can confirm the details.`;
  }
  if (/\b(?:warrant(?:y|ies)|guarantee)\b/i.test(normalized)) {
    return `I don't have confirmed warranty or guarantee information for MegaKart products. Please email ${SUPPORT_EMAIL} with the product name so our team can confirm the details.`;
  }
  if (/\b(?:payment|payments|pay|paid|credit card|debit card|cash on delivery|cod|upi|paypal|visa|mastercard|amex|american express)\b/i.test(normalized)) {
    return `I don't have confirmed information about MegaKart's payment methods or terms. Please email ${SUPPORT_EMAIL} and our team can confirm the available options.`;
  }
  return null;
};

const getProductContext = (products, budget) => JSON.stringify({
  catalogueCurrency: "USD",
  budget,
  products: products.map((product) => ({
    name: product.name,
    category: product.category,
    brand: product.brand,
    description: String(product.description || "").slice(0, 180),
    price: effectivePrice(product),
    colours: Array.isArray(product.colors) ? product.colors.slice(0, 8) : [],
    sizes: Array.isArray(product.sizes) ? product.sizes.slice(0, 8) : [],
    gender: product.gender || null,
    material: product.material || null,
    collection: product.collections || null,
    available: Number(product.countInStock) > 0,
  })),
});

const buildPrompt = ({ message, history, context }) => ({
  systemInstruction:
    `You are MegaKart's friendly shopping assistant. Be warm, conversational, and concise. Understand follow-ups using the recent conversation, and ask one helpful clarifying question when the category, size, style, or budget is unclear. Never invent catalogue products, prices, discounts, availability, materials, colours, sizes, shipping charges or times, return/refund periods, warranty, payment terms, or order facts. Use only the verified context for store/product facts; product cards are authoritative for current prices and stock. The store catalogue displays USD prices. If a customer gives an INR/rupee budget, ask whether they want to use that number as USD; never do currency conversion. If policy details are missing, say so and direct the customer to ${SUPPORT_EMAIL}. Never discuss or infer an order from conversation history; order status is handled separately by a secure database lookup. Do not echo private information.`,
  input: [
    `Verified store and catalogue context: ${context}`,
    "Recent conversation (for intent only; not a source of store facts):",
    ...history.map(({ role, content }) => `${role === "user" ? "Customer" : "Assistant"}: ${content}`),
    `Customer: ${message}`,
  ].join("\n").slice(0, 5000),
});

const getDailyAiLimit = () => {
  const configured = Number(process.env.CHAT_AI_DAILY_LIMIT);
  return Number.isInteger(configured) && configured > 0
    ? Math.min(configured, 1000)
    : MAX_AI_CALLS_PER_DAY;
};

const getCachedReply = (key) => {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return cached.reply;
};

const cacheReply = (key, reply) => {
  responseCache.set(key, { reply, expiresAt: Date.now() + AI_RESPONSE_CACHE_TTL_MS });
  if (responseCache.size > AI_RESPONSE_CACHE_MAX_SIZE) {
    responseCache.delete(responseCache.keys().next().value);
  }
};

const generateCachedReply = async ({ message, history, context }) => {
  const settings = readSettings();
  const cacheable = !history.length && GREETING.test(message);
  const key = crypto
    .createHash("sha256")
    .update(JSON.stringify({
      provider: settings.provider,
      model: settings.provider === "ollama" ? settings.ollamaModel : settings.geminiModel,
      message,
      history,
      context,
    }))
    .digest("hex");
  if (cacheable) {
    const cachedReply = getCachedReply(key);
    if (cachedReply) return cachedReply;
  }

  const today = new Date().toISOString().slice(0, 10);
  if (dailyAIUsage.date !== today) dailyAIUsage = { date: today, count: 0 };
  if (dailyAIUsage.count >= getDailyAiLimit()) {
    throw new Error("The chatbot's daily AI request limit has been reached.");
  }

  dailyAIUsage.count += 1;
  const reply = await generateAIResponse(buildPrompt({ message, history, context }));
  if (cacheable) cacheReply(key, reply);
  return reply;
};

const resetDailyAiUsageForTests = () => {
  dailyAIUsage = { date: new Date().toISOString().slice(0, 10), count: 0 };
  responseCache.clear();
};

const confirmsUsdBudget = (message, history) => {
  const lastAssistantMessage =
    history.filter((entry) => entry.role === "assistant").at(-1)?.content || "";
  const explicitUsd = /\b(?:use|treat|count|consider)\b.{0,40}\b(?:usd|dollars?)\b/i.test(message);
  const confirmsQuestion =
    /\bshould i\b.{0,100}\b(?:usd|dollars?)\b/i.test(lastAssistantMessage) &&
    /\b(?:yes|yeah|yep|sure|okay|ok|please do|that works)\b/i.test(message);
  return explicitUsd || confirmsQuestion;
};

const handleChat = async (req, res, { Product, Order, aiProvider = generateCachedReply } = {}) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ message: `Enter a message between 1 and ${MAX_MESSAGE_LENGTH} characters.` });
  }

  const rawHistory = normalizeHistory(req.body.history);
  const history = sanitizeHistory(rawHistory);
  if (isOrderStatusRequest(message, rawHistory)) {
    if (!req.user) {
      return res.status(401).json({ message: "Sign in to securely check your order status." });
    }
    return handleOrderStatus(req, res, { Order });
  }

  const faqAnswer = buildFaqAnswer(message);
  const previousBudget =
    history.filter((entry) => entry.role === "user").map((entry) => parseBudget(entry.content)).filter(Boolean).at(-1) ||
    null;
  const confirmedBudget = previousBudget?.currency === "INR" && confirmsUsdBudget(message, rawHistory)
    ? { ...previousBudget, currency: "USD" }
    : null;
  const budget = parseBudget(message) || confirmedBudget || previousBudget;
  const isClarifyingCurrency = Boolean(budget?.currency === "INR");
  const combinedSearchText = [
    ...history.filter((entry) => entry.role === "user").slice(-2).map((entry) => entry.content),
    message,
  ].join(" ");
  const searchTerms = extractSearchTerms(combinedSearchText);
  const filters = extractProductFilters(message);
  const isProduct = isProductRequest(message, history) || Boolean(budget);
  let products = [];
  let unavailable = [];
  try {
    if (isProduct && !isClarifyingCurrency && searchTerms.length) {
      products = await findProducts(Product, searchTerms, budget, filters);
      if (!products.length) {
        unavailable = await findUnavailableProducts(Product, searchTerms, budget, filters);
      }
    }
  } catch (error) {
    console.error("Chatbot product lookup failed:", error);
    return res.status(500).json({ message: "Unable to search the catalogue right now." });
  }
  const ruleBasedReply = buildRuleBasedReply({
    message,
    faqAnswer,
    products,
    unavailable,
    budget,
    isProduct,
    isClarifyingCurrency,
  });
  const context = getProductContext(products, isClarifyingCurrency ? null : budget);
  if (faqAnswer) {
    return res.json({ reply: faqAnswer, products });
  }
  const providerHistory = history
    .map((entry) => ({ ...entry, content: sanitizePromptText(entry.content) }))
    .filter((entry) => entry.content);

  try {
    const reply = await aiProvider({
      message: sanitizePromptText(message),
      history: providerHistory,
      context,
    });
    return res.json({ reply, products, aiAvailable: true });
  } catch (error) {
    console.warn("Chatbot AI response unavailable:", {
      stage: error.stage || "provider",
      httpStatus: error.httpStatus,
      googleCode: error.googleCode,
      googleStatus: error.googleStatus,
      googleDetails: error.googleDetails,
      failureType: error.failureType,
      message: error.message,
    });
    return res.json({
      reply: ruleBasedReply,
      products,
      aiAvailable: false,
      aiNotice: "Natural-language AI is temporarily unavailable; product search and verified support help are still available.",
    });
  }
};

const handleOrderStatus = async (req, res, { Order } = {}) => {
  const orderId =
    (typeof req.body?.orderId === "string" && req.body.orderId.trim()) ||
    req.body?.message?.match(ORDER_ID)?.[0] ||
    "";

  if (!req.user?._id) {
    return res.status(401).json({ message: "Sign in to securely check your order status." });
  }

  try {
    const query = { user: req.user._id };
    if (orderId) {
      if (!/^[a-f\d]{24}$/i.test(orderId)) {
        return res.status(400).json({ message: "That order number is not valid." });
      }
      query._id = orderId;
    }

    const order = await Order.findOne(query)
      .sort({ createdAt: -1 })
      .select("_id status paymentStatus createdAt");

    if (!order) {
      return res.status(404).json({
        message: orderId
          ? "I couldn't find that order on your account."
          : "There are no orders on your account yet.",
      });
    }

    return res.json({
      reply: `Your order #${order._id} is ${order.status}. Payment is ${order.paymentStatus}.`,
      orderLookup: true,
    });
  } catch (error) {
    console.error("Chatbot order lookup failed:", error);
    return res.status(500).json({ message: "Unable to retrieve your order status right now." });
  }
};

module.exports = {
  MAX_HISTORY_MESSAGE_LENGTH,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  buildFaqAnswer,
  buildRuleBasedReply,
  effectivePrice,
  expandSearchTerms,
  extractProductFilters,
  extractSearchTerms,
  formatBudget,
  generateCachedReply,
  handleChat,
  handleOrderStatus,
  isOrderStatusRequest,
  isProductRequest,
  parseBudget,
  productQuery,
  resetDailyAiUsageForTests,
  sanitizePromptText,
  sanitizeHistory,
  normalizeHistory,
};
