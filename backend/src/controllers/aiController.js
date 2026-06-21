const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const FOOD_RULES = [
  { keywords: ["ไข่ดาว", "fried egg"], perUnit: { kcal: 70, protein: 6, carbs: 0.4, fat: 5 }, unitLabel: "1 ฟอง" },
  { keywords: ["ไข่ต้ม", "boiled egg"], perUnit: { kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 }, unitLabel: "1 ฟอง" },
  { keywords: ["ข้าวสวย", "rice"], perUnit: { kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 }, unitLabel: "100 กรัม" },
  { keywords: ["อกไก่", "chicken breast"], perUnit: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 }, unitLabel: "100 กรัม" },
  { keywords: ["กล้วย", "banana"], perUnit: { kcal: 105, protein: 1.3, carbs: 27, fat: 0.3 }, unitLabel: "1 ผลกลาง" },
  { keywords: ["นม", "milk"], perUnit: { kcal: 122, protein: 8, carbs: 12, fat: 4.8 }, unitLabel: "1 แก้ว (240 ml)" },
  { keywords: ["ข้าวผัด", "fried rice"], perUnit: { kcal: 320, protein: 12, carbs: 45, fat: 10 }, unitLabel: "1 จาน" },
  { keywords: ["กะเพรา", "basil chicken", "pad kra pao"], perUnit: { kcal: 420, protein: 22, carbs: 38, fat: 20 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวมันไก่", "chicken rice"], perUnit: { kcal: 585, protein: 27, carbs: 65, fat: 24 }, unitLabel: "1 จาน" },
  { keywords: ["สลัด", "salad"], perUnit: { kcal: 180, protein: 7, carbs: 14, fat: 10 }, unitLabel: "1 ถ้วย" },

  { keywords: ["ข้าวไข่เจียว", "omelet rice"], perUnit: { kcal: 420, protein: 14, carbs: 45, fat: 19 }, unitLabel: "1 จาน" },
  { keywords: ["ไข่เจียว", "omelet"], perUnit: { kcal: 215, protein: 12, carbs: 1.5, fat: 17 }, unitLabel: "1 ฟอง" },
  { keywords: ["โจ๊ก", "rice porridge", "congee"], perUnit: { kcal: 230, protein: 12, carbs: 30, fat: 7 }, unitLabel: "1 ชาม" },
  { keywords: ["ข้าวต้ม", "boiled rice soup"], perUnit: { kcal: 180, protein: 8, carbs: 28, fat: 4 }, unitLabel: "1 ชาม" },
  { keywords: ["ต้มยำกุ้ง", "tom yum goong"], perUnit: { kcal: 180, protein: 20, carbs: 10, fat: 7 }, unitLabel: "1 ชาม" },
  { keywords: ["แกงเขียวหวาน", "green curry"], perUnit: { kcal: 380, protein: 19, carbs: 20, fat: 25 }, unitLabel: "1 ถ้วย" },
  { keywords: ["ผัดไทย", "pad thai"], perUnit: { kcal: 560, protein: 20, carbs: 70, fat: 20 }, unitLabel: "1 จาน" },
  { keywords: ["ราดหน้า", "rad na"], perUnit: { kcal: 540, protein: 20, carbs: 72, fat: 16 }, unitLabel: "1 จาน" },
  { keywords: ["ผัดซีอิ๊ว", "pad see ew"], perUnit: { kcal: 610, protein: 24, carbs: 78, fat: 22 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวหมูแดง", "red pork rice"], perUnit: { kcal: 540, protein: 23, carbs: 74, fat: 16 }, unitLabel: "1 จาน" },

  { keywords: ["ข้าวหมูกรอบ", "crispy pork rice"], perUnit: { kcal: 690, protein: 24, carbs: 74, fat: 32 }, unitLabel: "1 จาน" },
  { keywords: ["หมูปิ้ง", "grilled pork skewer"], perUnit: { kcal: 110, protein: 8, carbs: 6, fat: 6 }, unitLabel: "1 ไม้" },
  { keywords: ["ลาบหมู", "pork larb"], perUnit: { kcal: 260, protein: 24, carbs: 8, fat: 14 }, unitLabel: "1 จาน" },
  { keywords: ["ส้มตำไทย", "som tam thai"], perUnit: { kcal: 180, protein: 4, carbs: 26, fat: 6 }, unitLabel: "1 จาน" },
  { keywords: ["น้ำตกหมู", "nam tok"], perUnit: { kcal: 240, protein: 22, carbs: 7, fat: 13 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวขาหมู", "stewed pork leg rice"], perUnit: { kcal: 650, protein: 27, carbs: 72, fat: 28 }, unitLabel: "1 จาน" },
  { keywords: ["ก๋วยเตี๋ยวเรือ", "boat noodle"], perUnit: { kcal: 360, protein: 18, carbs: 45, fat: 12 }, unitLabel: "1 ชาม" },
  { keywords: ["ก๋วยเตี๋ยวต้มยำ", "tom yum noodle"], perUnit: { kcal: 420, protein: 18, carbs: 55, fat: 14 }, unitLabel: "1 ชาม" },
  { keywords: ["ก๋วยเตี๋ยวน้ำใส", "clear noodle soup"], perUnit: { kcal: 320, protein: 16, carbs: 44, fat: 8 }, unitLabel: "1 ชาม" },
  { keywords: ["บะหมี่หมูแดง", "egg noodle bbq pork"], perUnit: { kcal: 460, protein: 20, carbs: 58, fat: 16 }, unitLabel: "1 ชาม" },

  { keywords: ["ขนมจีน", "kanom jeen"], perUnit: { kcal: 380, protein: 12, carbs: 58, fat: 11 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวคลุกกะปิ", "shrimp paste rice"], perUnit: { kcal: 560, protein: 19, carbs: 80, fat: 18 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวหน้าเป็ด", "roasted duck rice"], perUnit: { kcal: 620, protein: 25, carbs: 72, fat: 24 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวผัดกุ้ง", "shrimp fried rice"], perUnit: { kcal: 520, protein: 22, carbs: 62, fat: 20 }, unitLabel: "1 จาน" },
  { keywords: ["กะเพราหมูกรอบ", "crispy pork basil"], perUnit: { kcal: 640, protein: 23, carbs: 44, fat: 38 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวไก่ทอด", "fried chicken rice"], perUnit: { kcal: 700, protein: 29, carbs: 72, fat: 31 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวหมูทอด", "fried pork rice"], perUnit: { kcal: 680, protein: 28, carbs: 70, fat: 30 }, unitLabel: "1 จาน" },
  { keywords: ["ข้าวหน้าไก่", "chicken gravy rice"], perUnit: { kcal: 560, protein: 24, carbs: 72, fat: 18 }, unitLabel: "1 จาน" },
  { keywords: ["แกงจืดเต้าหู้หมูสับ", "clear soup tofu minced pork"], perUnit: { kcal: 170, protein: 16, carbs: 7, fat: 8 }, unitLabel: "1 ถ้วย" },
  { keywords: ["ต้มข่าไก่", "tom kha gai"], perUnit: { kcal: 320, protein: 20, carbs: 10, fat: 22 }, unitLabel: "1 ถ้วย" },

  { keywords: ["ข้าวแกง", "rice and curry"], perUnit: { kcal: 700, protein: 24, carbs: 92, fat: 26 }, unitLabel: "1 จาน (2 อย่าง)" },
  { keywords: ["แซนด์วิชแฮมชีส", "ham cheese sandwich"], perUnit: { kcal: 340, protein: 16, carbs: 35, fat: 14 }, unitLabel: "1 ชิ้น" },
  { keywords: ["แฮมเบอร์เกอร์", "burger"], perUnit: { kcal: 520, protein: 24, carbs: 43, fat: 28 }, unitLabel: "1 ชิ้น" },
  { keywords: ["พิซซ่า", "pizza"], perUnit: { kcal: 285, protein: 12, carbs: 33, fat: 11 }, unitLabel: "1 ชิ้น" },
  { keywords: ["สปาเกตตีโบโลเนส", "spaghetti bolognese"], perUnit: { kcal: 560, protein: 23, carbs: 68, fat: 20 }, unitLabel: "1 จาน" },
  { keywords: ["สปาเกตตีคาโบนารา", "spaghetti carbonara"], perUnit: { kcal: 650, protein: 24, carbs: 66, fat: 30 }, unitLabel: "1 จาน" },
  { keywords: ["ไก่ย่าง", "grilled chicken"], perUnit: { kcal: 240, protein: 30, carbs: 0, fat: 12 }, unitLabel: "100 กรัม" },
  { keywords: ["สเต๊กไก่", "chicken steak"], perUnit: { kcal: 320, protein: 33, carbs: 7, fat: 17 }, unitLabel: "1 จาน" },
  { keywords: ["สเต๊กหมู", "pork steak"], perUnit: { kcal: 420, protein: 30, carbs: 9, fat: 28 }, unitLabel: "1 จาน" },
  { keywords: ["ปลาซาบะย่าง", "grilled saba", "mackerel"], perUnit: { kcal: 290, protein: 24, carbs: 0, fat: 21 }, unitLabel: "1 ชิ้น" },

  { keywords: ["ทูน่าสลัด", "tuna salad"], perUnit: { kcal: 250, protein: 22, carbs: 11, fat: 13 }, unitLabel: "1 ถ้วย" },
  { keywords: ["โยเกิร์ต", "yogurt"], perUnit: { kcal: 120, protein: 6, carbs: 15, fat: 3 }, unitLabel: "1 ถ้วย" },
  { keywords: ["ข้าวโอ๊ต", "oatmeal", "oats"], perUnit: { kcal: 150, protein: 5, carbs: 27, fat: 3 }, unitLabel: "40 กรัม" },
  { keywords: ["เวย์", "whey protein"], perUnit: { kcal: 120, protein: 24, carbs: 3, fat: 2 }, unitLabel: "1 scoop" },
  { keywords: ["ชานมไข่มุก", "bubble milk tea", "boba"], perUnit: { kcal: 320, protein: 3, carbs: 55, fat: 9 }, unitLabel: "1 แก้ว" },
  { keywords: ["กาแฟเย็น", "iced coffee"], perUnit: { kcal: 180, protein: 3, carbs: 24, fat: 8 }, unitLabel: "1 แก้ว" },
  { keywords: ["น้ำอัดลม", "soft drink", "soda"], perUnit: { kcal: 140, protein: 0, carbs: 35, fat: 0 }, unitLabel: "1 กระป๋อง" },
  { keywords: ["เฟรนช์ฟราย", "french fries"], perUnit: { kcal: 365, protein: 4, carbs: 48, fat: 17 }, unitLabel: "1 กล่องกลาง" },
  { keywords: ["นักเก็ตไก่", "chicken nuggets"], perUnit: { kcal: 290, protein: 14, carbs: 18, fat: 18 }, unitLabel: "6 ชิ้น" },
  { keywords: ["ไอศกรีม", "ice cream"], perUnit: { kcal: 210, protein: 4, carbs: 24, fat: 11 }, unitLabel: "1 ถ้วยเล็ก" }
];

const KEYWORD_ALIASES = {
  "กะเพรา": ["กระเพรา", "กะเพา", "กระเพา", "ผัดกระเพรา", "ผัดกะเพา"],
  "กะเพราหมูกรอบ": ["กระเพราหมูกรอบ", "กะเพาหมูกรอบ", "กระเพาหมูกรอบ"],
  "ไข่เจียว": ["ไข่เจียวว", "ไข่เจียวๆ", "ไข่เจียวหมูสับ"],
  "ไข่ดาว": ["ไข่ด่าว", "ไข่ดาวว"],
  "ข้าวไข่เจียว": ["ข้าวไข่เจียวว", "ข้าวไข่เจียวหมูสับ"],
  "ข้าวผัด": ["ข้าวผัดด", "ข้าวผดั", "ข้าวผัดรวม"],
  "ข้าวผัดกุ้ง": ["ข้าวผัดกุ้งง", "ข้าวผัดกุ้งสด"],
  "ข้าวมันไก่": ["ข้าวมันไก", "ข้าวมันไก่ต้ม"],
  "ข้าวหมูแดง": ["ข้าวหมูแดงง"],
  "ข้าวหมูกรอบ": ["ข้าวหมูกรอบบ"],
  "ข้าวขาหมู": ["ข้าวขาหมูู"],
  "ข้าวคลุกกะปิ": ["ข้าวคลุกกะปิ้", "ข้าวคลุกกปิ"],
  "ข้าวหน้าเป็ด": ["ข้าวหน้าเปด", "ข้าวหน้าเป็ดด"],
  "ข้าวหน้าไก่": ["ข้าวหน้าไก", "ข้าวหน้าไก่ทอด"],
  "ผัดไทย": ["ผัดไท", "ผัดไทยย", "padthai"],
  "ผัดซีอิ๊ว": ["ผัดซีอิว", "ผัดซิอิ๊ว", "ผัดซีอิ้ว"],
  "ราดหน้า": ["ลาดหน้า", "ราดน่า"],
  "โจ๊ก": ["โจ้ก", "โจ๊กก"],
  "ข้าวต้ม": ["ข้าวต้มม"],
  "ต้มยำกุ้ง": ["ต้มยํากุ้ง", "ต้มยำกุ้งง", "ต้มยำ"],
  "ต้มข่าไก่": ["ต้มขาไก่", "ต้มข่าไก"],
  "แกงเขียวหวาน": ["แกงเขียวหวานน", "เขียวหวาน"],
  "แกงจืดเต้าหู้หมูสับ": ["แกงจืดเต้าหู้", "แกงจืดหมูสับ"],
  "ก๋วยเตี๋ยวเรือ": ["ก๋วยเตี๋ยวเรื่อ", "ก๋วยเตี๋ยวเรืออ"],
  "ก๋วยเตี๋ยวต้มยำ": ["ก๋วยเตี๋ยวต้มยํา", "ก๋วยเตี๋ยวต้มยำม"],
  "ก๋วยเตี๋ยวน้ำใส": ["ก๋วยเตี๋ยวน้าใส", "ก๋วยเตี๋ยวน้ำไส"],
  "บะหมี่หมูแดง": ["บะหมี่หมูแดงง", "บะหมี่หมูแดงแห้ง"],
  "ส้มตำไทย": ["ส้มตําไทย", "ส้มตำไท", "ส้มตำ"],
  "น้ำตกหมู": ["น้ําตกหมู", "น้ำตกหมูู"],
  "ลาบหมู": ["ลาบหมูู", "ลาบ"],
  "หมูปิ้ง": ["หมูปิ้งง", "หมูปิง"],
  "สปาเกตตีโบโลเนส": ["สปาเก็ตตี้โบโลเนส", "สปาเกตตี้โบโลเนส", "spagetti bolognese", "spaghetti bologne"],
  "สปาเกตตีคาโบนารา": ["สปาเก็ตตี้คาโบนารา", "spagetti carbonara", "spaghetti carbonera"],
  "แซนด์วิชแฮมชีส": ["แซนวิชแฮมชีส", "แซนวิช", "sandwich"],
  "แฮมเบอร์เกอร์": ["เบอร์เกอร์", "hamberger", "hambuger"],
  "พิซซ่า": ["พิซซา", "pizzaa", "piza"],
  "เฟรนช์ฟราย": ["เฟรนฟราย", "เฟรนช์ฟรายส์", "french fry"],
  "นักเก็ตไก่": ["นักเกตไก่", "นักเก็ต", "nuggets"],
  "ไอศกรีม": ["ไอติม", "ไอศครีม", "icecream"],
  "ชานมไข่มุก": ["ชานม", "ชานมไข่มุข", "บับเบิลที", "bubble tea"],
  "กาแฟเย็น": ["กาแฟ", "กาแฟเยน", "iced coffe"],
  "น้ำอัดลม": ["นํ้าอัดลม", "น้ำดำ", "โซดา", "softdrink"],
  "โยเกิร์ต": ["โยเกริต", "โยเกิรต์", "yoghurt"],
  "ข้าวโอ๊ต": ["ข้าวโอ๊ตต", "โอ๊ต", "oat meal"],
  "เวย์": ["เวย์โปรตีน", "whey", "เวย"],
  "ปลาซาบะย่าง": ["ซาบะย่าง", "ปลาซาบะ", "mackerel grilled"],
  "ทูน่าสลัด": ["ทูน่าสลัดด์", "สลัดทูน่า", "tuna"],
  "สเต๊กไก่": ["สเต็กไก่", "chicken stek"],
  "สเต๊กหมู": ["สเต็กหมู", "pork stek"],
  "ไก่ย่าง": ["ไก่ย่างง", "ไก่ยาง"],
  "อกไก่": ["อกไก", "อกไก่ย่าง"],
  "กล้วย": ["กล้วยย", "กล้วยหอม"],
  "นม": ["นมสด", "นมจืด", "milk plain"]
};

const normalizeMealText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\u0E48-\u0E4C]/g, "")
    .replace(/[._,()/\\-]/g, "");

const parseMultiplier = (quantityText = "") => {
  const text = String(quantityText || "").trim().toLowerCase();
  if (!text) {
    return 1;
  }

  const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
  const value = numberMatch ? Number(numberMatch[1]) : 1;
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  if (text.includes("ช้อน") || text.includes("tbsp")) {
    return value * 0.25;
  }

  if (text.includes("g") || text.includes("กรัม")) {
    return value / 100;
  }

  return value;
};

const findRuleEstimate = (mealName, quantityText) => {
  const normalized = normalizeMealText(mealName);
  let matchedRule = null;
  let bestMatchLength = 0;

  for (const rule of FOOD_RULES) {
    for (const keyword of rule.keywords) {
      const keywordAliases = KEYWORD_ALIASES[keyword] || [];
      const variants = [keyword, ...keywordAliases];

      for (const variant of variants) {
        const normalizedVariant = normalizeMealText(variant);
        if (!normalizedVariant) {
          continue;
        }

        if (normalized.includes(normalizedVariant) && normalizedVariant.length > bestMatchLength) {
          matchedRule = rule;
          bestMatchLength = normalizedVariant.length;
        }
      }
    }
  }

  if (!matchedRule) {
    return null;
  }

  const multiplier = parseMultiplier(quantityText || mealName);
  const round = (num) => Math.max(0, Math.round(num * 10) / 10);

  return {
    kcal: Math.round(matchedRule.perUnit.kcal * multiplier),
    protein: round(matchedRule.perUnit.protein * multiplier),
    carbs: round(matchedRule.perUnit.carbs * multiplier),
    fat: round(matchedRule.perUnit.fat * multiplier),
    confidence: multiplier === 1 ? "high" : "medium",
    note: `ประเมินจากฐานข้อมูลอาหารพื้นฐาน (${matchedRule.unitLabel})`
  };
};

const tryEstimateWithAi = async (mealName, quantityText) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = (process.env.AI_BASE_URL || "https://api.opentyphoon.ai/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "typhoon-v2.5-30b-a3b-instruct";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a nutrition assistant. Return only JSON with kcal, protein, carbs, fat, confidence, note."
        },
        {
          role: "user",
          content: `Estimate nutrition for this meal in Thai context. mealName=${mealName}, quantity=${quantityText || "ไม่ระบุ"}. Return JSON only.`
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 220,
      top_p: 0.8,
      stream: false
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return null;
  }

  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    return null;
  }

  const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
  return {
    kcal: Math.max(0, Math.round(toNumber(parsed.kcal, 0))),
    protein: Math.max(0, Math.round(toNumber(parsed.protein, 0) * 10) / 10),
    carbs: Math.max(0, Math.round(toNumber(parsed.carbs, 0) * 10) / 10),
    fat: Math.max(0, Math.round(toNumber(parsed.fat, 0) * 10) / 10),
    confidence: typeof parsed.confidence === "string" ? parsed.confidence : "medium",
    note: typeof parsed.note === "string" && parsed.note.trim()
      ? parsed.note.trim()
      : "AI ประเมินจากรายการอาหารที่ระบุ"
  };
};

const estimateMealNutrition = async (req, res) => {
  try {
    const mealName = String(req.body?.mealName || "").trim();
    const quantityText = String(req.body?.quantityText || "").trim();

    if (!mealName) {
      return res.status(400).json({
        success: false,
        message: "mealName is required"
      });
    }

    const ruleResult = findRuleEstimate(mealName, quantityText);

    try {
      const aiResult = await tryEstimateWithAi(mealName, quantityText);
      if (aiResult) {
        return res.status(200).json({
          success: true,
          data: {
            ...aiResult,
            source: "ai"
          }
        });
      }
    } catch (_) {
      // Continue to fallback below.
    }

    if (ruleResult) {
      return res.status(200).json({
        success: true,
        data: {
          ...ruleResult,
          source: "rule"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        kcal: 250,
        protein: 10,
        carbs: 25,
        fat: 10,
        confidence: "low",
        note: "ไม่พบรายการอาหารตรงฐานข้อมูล ใช้ค่าประมาณเบื้องต้น",
        source: "default"
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to estimate meal nutrition",
      error: error.message
    });
  }
};

module.exports = {
  estimateMealNutrition
};
