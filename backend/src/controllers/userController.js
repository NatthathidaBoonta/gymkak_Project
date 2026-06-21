const Account = require("../models/Account");

const toSafeNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getBmiCategory = (bmi) => {
  if (!Number.isFinite(bmi)) return "ไม่มีข้อมูลเพียงพอ";
  if (bmi < 18.5) return "น้ำหนักน้อย";
  if (bmi < 23) return "สมส่วน";
  if (bmi < 25) return "น้ำหนักเกินเล็กน้อย";
  if (bmi < 30) return "อ้วนระดับ 1";
  return "อ้วนระดับ 2";
};

const buildFallbackSummary = ({
  fullName,
  membershipPlan,
  weight,
  height,
  bodyFat,
  calorieGoal,
  calorieConsumed,
  protein,
  weightHistory,
  strengthTrendPercent
}) => {
  const bmi = Number.isFinite(weight) && Number.isFinite(height) && height > 0
    ? weight / ((height / 100) ** 2)
    : null;
  const calorieProgress = Number.isFinite(calorieGoal) && calorieGoal > 0
    ? (Math.max(0, calorieConsumed || 0) / calorieGoal) * 100
    : null;

  const history = Array.isArray(weightHistory)
    ? weightHistory.filter((v) => Number.isFinite(Number(v))).map(Number)
    : [];
  const weightDelta = history.length >= 2 ? history[history.length - 1] - history[0] : null;

  let score = 50;
  if (Number.isFinite(calorieProgress)) {
    if (calorieProgress >= 80 && calorieProgress <= 110) score += 18;
    else if (calorieProgress >= 60 && calorieProgress <= 130) score += 10;
  }
  if (Number.isFinite(protein)) {
    if (protein >= 120) score += 15;
    else if (protein >= 80) score += 10;
    else if (protein >= 50) score += 5;
  }
  if (Number.isFinite(strengthTrendPercent)) {
    if (strengthTrendPercent > 0) score += 12;
    else if (strengthTrendPercent === 0) score += 6;
    else score -= 6;
  }
  if (Number.isFinite(bodyFat)) {
    if (bodyFat >= 10 && bodyFat <= 22) score += 8;
    else if (bodyFat <= 30) score += 4;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const highlights = [
    Number.isFinite(bmi)
      ? `BMI ประมาณ ${bmi.toFixed(1)} (${getBmiCategory(bmi)})`
      : "ยังคำนวณ BMI ไม่ได้ (ข้อมูลส่วนสูง/น้ำหนักไม่ครบ)",
    Number.isFinite(calorieProgress)
      ? `พลังงานวันนี้ ${Math.round(calorieProgress)}% ของเป้าหมาย (${Math.round(calorieConsumed || 0)} / ${Math.round(calorieGoal)} kcal)`
      : "ยังไม่มีข้อมูลเป้าหมายแคลอรี่วันนี้",
    Number.isFinite(weightDelta)
      ? `แนวโน้มน้ำหนักล่าสุด ${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)} kg จาก 5 ครั้งล่าสุด`
      : "ยังมีข้อมูลน้ำหนักย้อนหลังไม่พอสำหรับวิเคราะห์แนวโน้ม"
  ];

  const recommendations = [];
  if (!Number.isFinite(calorieProgress) || calorieProgress < 80) {
    recommendations.push("เพิ่มพลังงานรวมต่อวันให้อยู่ใกล้เป้าหมาย (80-110%)");
  }
  if (Number.isFinite(calorieProgress) && calorieProgress > 115) {
    recommendations.push("ลดพลังงานส่วนเกินเล็กน้อย โดยเน้นคุมอาหารแปรรูปและน้ำตาล");
  }
  if (!Number.isFinite(protein) || protein < 100) {
    recommendations.push("เพิ่มโปรตีนเป็นอย่างน้อย 100-120 กรัม/วัน เพื่อการฟื้นตัวและรักษามวลกล้ามเนื้อ");
  }
  if (Number.isFinite(strengthTrendPercent) && strengthTrendPercent < 0) {
    recommendations.push("ลด volume ชั่วคราว 1 สัปดาห์ (deload) และปรับเทคนิคท่าหลัก");
  }
  if (!recommendations.length) {
    recommendations.push("ภาพรวมอยู่ในเกณฑ์ดี รักษาวินัยต่อเนื่องและประเมินซ้ำทุก 7 วัน");
  }

  const summaryText = `${fullName || "สมาชิก"} มีคะแนนภาพรวม ${score}/100 ` +
    `(${membershipPlan || "ไม่มีแพ็กเกจ"}). ` +
    `${highlights[0]}. ${highlights[1]}.`;

  return {
    score,
    summaryText,
    highlights: highlights.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    source: "rule-based"
  };
};

const tryGenerateWithAi = async (metrics, fallback) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = (process.env.AI_BASE_URL || "https://api.opentyphoon.ai/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "typhoon-v2.5-30b-a3b-instruct";

  const promptPayload = {
    profile: {
      fullName: metrics.fullName,
      membershipPlan: metrics.membershipPlan
    },
    metrics: {
      weight: metrics.weight,
      height: metrics.height,
      bodyFat: metrics.bodyFat,
      calorieGoal: metrics.calorieGoal,
      calorieConsumed: metrics.calorieConsumed,
      protein: metrics.protein,
      strengthTrendPercent: metrics.strengthTrendPercent,
      latestWeightHistory: metrics.weightHistory
    }
  };

  const system = "You are a Thai fitness coach assistant. Analyze provided data and return JSON only.";
  const user = `ตอบกลับเป็น JSON เท่านั้น ตาม schema นี้: {\"score\":number(0-100),\"summaryText\":string,\"highlights\":string[3],\"recommendations\":string[3]}\\n\\nDATA: ${JSON.stringify(promptPayload)}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.4,
      max_completion_tokens: 450,
      top_p: 0.7,
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
    score: Math.max(0, Math.min(100, Math.round(toSafeNumber(parsed.score, fallback.score)))),
    summaryText: typeof parsed.summaryText === "string" && parsed.summaryText.trim()
      ? parsed.summaryText.trim()
      : fallback.summaryText,
    highlights: Array.isArray(parsed.highlights)
      ? parsed.highlights.filter((v) => typeof v === "string" && v.trim()).slice(0, 3)
      : fallback.highlights,
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((v) => typeof v === "string" && v.trim()).slice(0, 3)
      : fallback.recommendations,
    source: "ai"
  };
};

const formatThaiDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const getMembershipViewModel = (membership = {}) => {
  const plan = membership.plan || "None";
  const hasMembership = plan !== "None";

  if (!hasMembership) {
    return {
      hasMembership: false,
      type: "",
      status: "Inactive",
      expiryDate: "",
      purchaseDate: "",
      price: "",
      duration: "",
      benefits: []
    };
  }

  const now = new Date();
  const expireDateObj = membership.expireDate ? new Date(membership.expireDate) : null;
  const purchaseDateObj = membership.startDate ? new Date(membership.startDate) : null;

  const durationByPlan = {
    Daily: "1 day",
    Monthly: "30 days",
    "1 Year": "365 days",
    "3 Years": "1095 days"
  };

  const benefitsByPlan = {
    Daily: ["Gym access (1 day)", "All equipment"],
    Monthly: ["Unlimited gym access", "All equipment"],
    "1 Year": [
      "Unlimited gym access",
      "All equipment",
      "4 PT sessions/month",
      "Priority booking"
    ],
    "3 Years": [
      "Unlimited gym access",
      "All equipment",
      "8 PT sessions/month",
      "Priority booking",
      "Nutrition consultation"
    ]
  };

  const computedStatus = expireDateObj && expireDateObj < now ? "Expired" : (membership.status || "Active");

  return {
    hasMembership: true,
    type: `${plan} Plan`,
    status: computedStatus,
    expiryDate: formatThaiDate(expireDateObj),
    purchaseDate: formatThaiDate(purchaseDateObj),
    price: membership.price ? `$${membership.price}` : "",
    duration: durationByPlan[plan] || "",
    benefits: benefitsByPlan[plan] || ["Unlimited gym access", "All equipment"]
  };
};

const getUserViewModel = (account) => {
  const fullName = `${account.firstName || ""} ${account.lastName || ""}`.trim();

  return {
    fullName: fullName || account.username,
    username: account.username,
    email: account.email || `${account.username}@gymkak.com`,
    phone: account.phone || "",
    memberSince: formatThaiDate(account.createdAt)
  };
};

const getProfile = async (req, res) => {
  try {
    const account = await Account.findById(req.user._id).select("-password");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: getUserViewModel(account),
        membership: getMembershipViewModel(account.membership)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const account = await Account.findById(req.user._id).select("-password");
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    account.firstName = typeof firstName === "string" ? firstName.trim() : account.firstName;
    account.lastName = typeof lastName === "string" ? lastName.trim() : account.lastName;
    account.phone = typeof phone === "string" ? phone.trim() : account.phone;

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: getUserViewModel(account),
        membership: getMembershipViewModel(account.membership)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};

const generateAiSummary = async (req, res) => {
  try {
    const account = await Account.findById(req.user._id).select("-password");
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const body = req.body || {};
    const metrics = {
      fullName: `${account.firstName || ""} ${account.lastName || ""}`.trim() || account.username,
      membershipPlan: account?.membership?.plan || "None",
      weight: toSafeNumber(body.weight),
      height: toSafeNumber(body.height),
      bodyFat: toSafeNumber(body.bodyFat),
      calorieGoal: toSafeNumber(body.calorieGoal),
      calorieConsumed: toSafeNumber(body.calorieConsumed, 0),
      protein: toSafeNumber(body.protein, 0),
      strengthTrendPercent: toSafeNumber(body.strengthTrendPercent),
      weightHistory: Array.isArray(body.weightHistory)
        ? body.weightHistory.map((v) => toSafeNumber(v)).filter((v) => Number.isFinite(v)).slice(-5)
        : []
    };

    const fallback = buildFallbackSummary(metrics);
    let result = fallback;

    try {
      const aiResult = await tryGenerateWithAi(metrics, fallback);
      if (aiResult) {
        result = {
          ...aiResult,
          highlights: aiResult.highlights.length ? aiResult.highlights : fallback.highlights,
          recommendations: aiResult.recommendations.length ? aiResult.recommendations : fallback.recommendations
        };
      }
    } catch (_) {
      result = fallback;
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI summary",
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  generateAiSummary
};
