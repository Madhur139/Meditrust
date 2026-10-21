import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import uploadToCloudinary from "../../middleware/cloudinaryMiddleware.js";
import Prescription from "../../models/prescriptionModel.js";
import Product from "../../models/productModel.js";
import Pathologist from "../../models/pathologistModel.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT = `
You are a medical prescription parser. Extract the following from this 
prescription image and return ONLY valid JSON, no markdown fences, no explanation:

{
  "patient_name": null,
  "doctor_name": null,
  "date": null,
  "medicines": [
    {
      "name": null,
      "dosage": null,
      "frequency": null,
      "duration": null,
      "notes": null
    }
  ],
  "diagnosis_notes": null
}

If any field is illegible or missing, use null. Do not guess medicine names 
you're not confident about — flag uncertain reads in "notes" instead.
`;

function fileToBase64(path) {
  return fs.readFileSync(path).toString("base64");
}

const explainPrescription = async (req, res) => {
  let userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const base64 = fileToBase64(req.file.path);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: PROMPT },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const image = await uploadToCloudinary(req.file.path);
    fs.unlinkSync(req.file.path); // cleanup temp file

    const text = response.text; // property, not a function, in the new SDK
    const data = JSON.parse(text);

    const prescription = new Prescription({
      user: userId,
      patient_name: data.patient_name,
      doctor_name: data.doctor_name,
      date: data.date,
      medicines: data.medicines,
      diagnosis_notes: data.diagnosis_notes,
      image: image.secure_url,
    });

    await prescription.save();
    await prescription.populate("user");

    res.status(200).json(prescription);
  } catch (err) {
    fs.unlinkSync(req.file.path); // cleanup temp file
    console.error(err);
    res.status(500).json({ error: "Extraction failed", details: err.message });
  }
};

const findMedicines = async (req, res) => {
  const pid = req.params.pid;

  const products = await Product.find();
  const pathologists = await Pathologist.find();
  const prescription = await Prescription.findById(pid);

  const payload = { products, pathologists, medicines: prescription.medicines };

  const MEDICINE_FOUNDER_PROMPT = `You are a medicine and pathology-test availability checker for a healthcare platform.

You will receive THREE pieces of data in JSON:
1. "products" — the pharmacy's inventory (id, name, description, price, stock, expiresOn, isActive)
2. "pathologists" — labs/diagnostic centers with their specializations and fees
3. "medicines" — a list of medicines extracted via OCR from a doctor's prescription (name, dosage, frequency, duration, notes)

YOUR TASK:
For each entry in "medicines", determine whether it is available in "products" using fuzzy/partial name matching (OCR text is often noisy — e.g. "O-claram-625" may match "Amoxyclav 625" or similar; match on best semantic/brand similarity, not exact string equality). Only mark a product as available if isActive is true, stock > 0, and it is not expired (compare expiresOn to today's date).

If any prescription line looks like a lab test / diagnostic order rather than a medicine (e.g. "CBC", "CT Scan", "Blood Sugar"), match it against pathologists' "specialization" arrays instead, and list which labs offer it, their consultationFee, and availableDays/workingHours.

OUTPUT FORMAT — return ONLY valid JSON, no preamble, no markdown fences:

{
  "products": <the exact "products" array from the input, unmodified>,
  "pathologists": <the exact "pathologists" array from the input, unmodified>,
  "medicines": [
    {
      "prescribed_name": "<name as it appeared on prescription>",
      "matched_product_name": "<name from products, or null if no match found>",
      "match_confidence": "high" | "medium" | "low" | "none",
      "available": true | false,
      "reason": "<short reason, e.g. 'in stock, active' / 'out of stock' / 'expired' / 'no matching product found'>",
      "price": <number or null>,
      "stock": <number or null>,
      "dosage": "<from prescription, if any>",
      "duration": "<from prescription, if any>"
    }
  ],
  "tests": [
    {
      "prescribed_test": "<test name as extracted>",
      "available_labs": [
        {
          "laboratoryName": "<string>",
          "laboratoryAddress": "<string>",
          "consultationFee": <number>,
          "availableDays": [<strings>],
          "workingHours": { "start": "<string>", "end": "<string>" }
        }
      ]
    }
  ],
  "summary": {
    "total_medicines_prescribed": <number>,
    "medicines_available": <number>,
    "medicines_unavailable": <number>,
    "tests_prescribed": <number>,
    "tests_with_available_labs": <number>
  }
}

RULES:
- Never invent a product, price, or lab that isn't in the provided data.
- If a prescription entry's "notes" says it's crossed out or unclear, still attempt a match but flag match_confidence as "low" and add a note.
- Be conservative: if you're not reasonably confident of a match, set matched_product_name to null and available to false rather than guessing.
- Do not include any explanation outside the JSON object.

Here is the data: ${JSON.stringify(payload)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: MEDICINE_FOUNDER_PROMPT }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text; // property, not a function, in the new SDK
    const data = JSON.parse(text);

    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(409);
    throw new Error("Error In Getting Data From Server!");
  }
};

const AI_CHAT_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const AI_CHAT_MAX_MESSAGE_CHARS = 2000;
const AI_CHAT_MAX_HISTORY_MESSAGES = 20;
const AI_CHAT_MAX_CONTEXT_CHARS = 12000;

const AI_DOCTOR_SYSTEM_INSTRUCTION = `You are MediTrust's basic health guidance assistant. Rules you MUST follow:
- Give only general, non-diagnostic health education and cautious, evidence-based information.
- You are NOT a licensed physician. Never claim to be one and never provide a definitive medical diagnosis.
- Never prescribe medicines, invent dosages, or recommend starting, stopping, or changing prescription medications.
- Keep answers short and easy to understand.
- Always suggest booking a real doctor on MediTrust for anything specific or urgent.
- If the question describes an emergency or serious symptoms, urge seeking immediate professional care.`;

const getChatClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const toChatContents = (history, message) => {
  const valid = (Array.isArray(history) ? history : [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "model") &&
        typeof m.text === "string" &&
        m.text.trim(),
    )
    .slice(-AI_CHAT_MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text.slice(0, AI_CHAT_MAX_MESSAGE_CHARS) }],
    }));

  let used = valid.reduce((n, m) => n + m.parts[0].text.length, 0);
  while (valid.length > 0 && used + message.length > AI_CHAT_MAX_CONTEXT_CHARS) {
    used -= valid.shift().parts[0].text.length;
  }

  valid.push({ role: "user", parts: [{ text: message }] });
  return valid;
};

const chatWithAi = async (req, res) => {
  const { message, history } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    res.status(400);
    throw new Error("Please enter a message.");
  }

  const text = message.trim();
  if (text.length > AI_CHAT_MAX_MESSAGE_CHARS) {
    res.status(413);
    throw new Error(
      `Message is too long. Keep it under ${AI_CHAT_MAX_MESSAGE_CHARS} characters.`,
    );
  }

  const client = getChatClient();
  if (!client) {
    res.status(503);
    throw new Error("AI service is not configured. Please try again later.");
  }

  try {
    const response = await client.models.generateContent({
      model: AI_CHAT_MODEL,
      contents: toChatContents(history, text),
      config: {
        systemInstruction: AI_DOCTOR_SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      res.status(502);
      throw new Error("AI service returned an empty response. Please retry.");
    }

    res.status(200).json({ reply });
  } catch (error) {
    if (res.statusCode && res.statusCode !== 200) throw error;
    const providerStatus = error.status ?? error.code;
    const providerMessage = String(error.message || "unknown provider error");
    // Diagnostic log only: status + message. Never logs the API key or
    // conversation content.
    console.error(
      `AI chat provider error (model=${AI_CHAT_MODEL} status=${providerStatus}):`,
      providerMessage.slice(0, 300),
    );
    if (
      providerStatus === 429 ||
      /quota|rate.?limit|resource.?exhausted/i.test(providerMessage)
    ) {
      res.status(429);
      throw new Error(
        "AI service is busy right now. Please wait a moment and retry.",
      );
    }
    if (
      providerStatus === 400 ||
      providerStatus === 401 ||
      providerStatus === 403 ||
      /api.?key|invalid.?argument|permission|not.?found/i.test(providerMessage)
    ) {
      res.status(503);
      throw new Error(
        "AI service is misconfigured and cannot answer right now. An administrator needs to check the server configuration.",
      );
    }
    res.status(503);
    throw new Error("AI service is temporarily unavailable. Please retry.");
  }
};

const getMyPrescriptions = async (req, res) => {
  const userId = req.user._id ?? req.user.id;

  const prescriptions = await Prescription.find({ user: userId }).sort({
    createdAt: -1,
  });

  return res.status(200).json(prescriptions ?? []);
};

const aiController = {
  explainPrescription,
  getMyPrescriptions,
  findMedicines,
  chatWithAi,
};

export default aiController;
