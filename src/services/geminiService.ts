import { GoogleGenAI, Modality, Type } from "@google/genai";

const USER_API_KEY_STORAGE = 'tuai-user-api-key';

const getApiKey = (): string => {
  const userKey = localStorage.getItem(USER_API_KEY_STORAGE);
  if (userKey && userKey.trim().startsWith('AIza')) {
    return userKey.trim();
  }
  return process.env.GEMINI_API_KEY || '';
};

let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    const key = getApiKey();
    if (!key) {
      throw new Error('Không tìm thấy Gemini API Key. Vui lòng nhập API Key trong cài đặt.');
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const resetAiInstance = () => {
  aiInstance = null;
};

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleError = (error: any, context: string): never => {
  if (error instanceof ApiError) {
      throw error;
  }

  let messageKey = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
  let specificMessage = '';

  if (error instanceof Error) {
    specificMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
      if (error.message) specificMessage = error.message;
      else if (error.error?.message) specificMessage = error.error.message;
      else specificMessage = JSON.stringify(error);
  } else if (typeof error === 'string') {
      specificMessage = error;
  }

  if (specificMessage) {
    const errorMessageLower = specificMessage.toLowerCase();
    
    if (errorMessageLower.includes('safety')) {
      messageKey = 'Yêu cầu của bạn bị từ chối vì lý do an toàn. Vui lòng thử mô tả hoặc hình ảnh khác.';
    } else if (errorMessageLower.includes('429') || errorMessageLower.includes('rate limit') || errorMessageLower.includes('quota') || errorMessageLower.includes('resource_exhausted')) {
      messageKey = 'Hệ thống AI đang quá tải hoặc hết hạn mức. Vui lòng đợi giây lát và thử lại.';
    } else if (errorMessageLower.includes('403') || errorMessageLower.includes('permission_denied') || errorMessageLower.includes('forbidden')) {
      messageKey = 'Truy cập API bị từ chối. Vui lòng liên hệ quản trị viên.';
    } else if (errorMessageLower.includes('api key not valid')) {
      messageKey = 'Lỗi cấu hình hệ thống (API Key không hợp lệ). Vui lòng liên hệ quản trị viên.';
    } else if (errorMessageLower.includes('model returned a text response')) {
      messageKey = 'AI không thể thực hiện yêu cầu này.';
    } else if (errorMessageLower.includes('failed to fetch')) {
        messageKey = 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.';
    }
  }
  
  throw new ApiError(messageKey);
};

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type VideoStyle = 'Mặc định' | 'Điện ảnh' | 'Sống động' | 'Tối giản';
export type BilingualPrompt = {
    vi: string;
    en: string;
};
export type ImageInput = {
    base64: string;
    mimeType: string;
};
export type VideoScript = {
  title: string;
  summary: string;
  scenes: {
    scene_number: number;
    visuals: string;
    voiceover: string;
    imageUrl?: string | 'loading' | 'failed';
  }[];
};

export const getCalligraphyPrompt = (
    text: string,
    typographyPrompt: string,
    backgroundPrompt: string,
    motifPrompt: string,
    textColor: string,
    stampPrompt: string,
    referenceImage?: boolean,
    imageMode: 'background' | 'overlay' | 'hybrid' | 'swap' = 'overlay'
): string => {
    const FONT_SAFE_GUARD = `
CRITICAL FONT INSTRUCTION: 
You MUST use a standard font that fully supports Vietnamese diacritics 
(dấu tiếng Việt: sắc, huyền, hỏi, ngã, nặng, ă, â, đ, ê, ô, ơ, ư). 
DO NOT use fonts that break on Vietnamese characters. 
Ensure every accent mark is clearly and correctly drawn. 
Treat the word "${text}" as a precise geometric composition.
NO broken letters. NO missing diacritics.`.trim();

    const COMPOSITION_GUARD = `
CRITICAL COMPOSITION (ZERO-TEXT POLICY): 
Strictly render ONLY the requested word "${text}". 
DO NOT add any random letters, English text, symbols, or watermarks.
This MUST be ONE single unified image. 
DO NOT create multiple versions, grids, or collage. 
The artwork must occupy the entire frame as a single cohesive scene. 
Perfectly straight alignment.`.trim();

    const strictTextPrompt = `CRITICAL INSTRUCTION (CHỈ DẪN CỰC KỲ QUAN TRỌNG)
You are an AI generating an image. The most important requirement is rendering the text EXACTLY as provided.
The exact central text to render is: "${text}"

### ORTHOGRAPHY & TEXT RENDERING GUIDELINES:
- **Exact Letter Replication**: Treat every character as a precise geometric shape. Do NOT "guess" or "autocorrect" the spelling.
- **Vietnamese Diacritics (Tone Marks)**: Pay extreme attention to the marks: "Võ", "Ngọc", "Tùng". DO NOT ADD ANY RANDOM DOTS/ACCENTS.
- **Syllable Separation**: Every word MUST be clearly and distinctly separated by a space.
- Keep the letters highly legible.`.trim();

    if (referenceImage) {
        let integrationInstruction = "";
        if (imageMode === 'background') {
            integrationInstruction = "Use the provided image as a strict background. Paint the calligraphy prominently on top of it.";
        } else if (imageMode === 'overlay') {
            integrationInstruction = "Elegantly overlay the calligraphy onto the image, maintaining all original subjects and characters from the source image.";
        } else if (imageMode === 'hybrid') {
            integrationInstruction = "Seamlessly blend the calligraphy with the image. The strokes should interact with the subjects (e.g., flowing around characters or appearing to be held by them).";
        } else if (imageMode === 'swap') {
            integrationInstruction = "CRITICAL SWAP INSTRUCTION: Identifying subjects/characters in Image 1 and Image 2. Replace the character from Image 1 with the character from Image 2 while perfectly maintaining Image 1's environment and lighting.";
        }

        return `
A breathtaking realism edit. ${integrationInstruction}
${strictTextPrompt}
Text: "${text}"
Style: ${typographyPrompt}
Color: ${textColor}
Motif: ${motifPrompt}
Stamp: ${stampPrompt}
${FONT_SAFE_GUARD}
${COMPOSITION_GUARD}`.trim();
    } else {
        return `
A breathtaking, hyper-realistic masterpiece of East Asian typography/calligraphy art.
${strictTextPrompt}
Text: "${text}"
Style: ${typographyPrompt}
Background: ${backgroundPrompt}
Color: ${textColor}
Motif: ${motifPrompt}
Stamp: ${stampPrompt}
${FONT_SAFE_GUARD}
${COMPOSITION_GUARD}`.trim();
    }
};

export const generateCalligraphyImage = async (
    text: string,
    typographyPrompt: string,
    backgroundPrompt: string,
    motifPrompt: string,
    textColor: string,
    stampPrompt: string,
    aspectRatio: AspectRatio,
    referenceImages?: { base64: string; mimeType: string }[],
    numberOfImages: number = 1,
    imageMode: 'background' | 'overlay' | 'hybrid' | 'swap' = 'overlay'
): Promise<string[]> => {
    try {
        const enhancedPrompt = getCalligraphyPrompt(
            text,
            typographyPrompt,
            backgroundPrompt,
            motifPrompt,
            textColor,
            stampPrompt,
            !!referenceImages && referenceImages.length > 0,
            imageMode
        );
        
        const imageUrls: string[] = [];
        for (let i = 0; i < numberOfImages; i++) {
            const parts: any[] = [{ text: enhancedPrompt }];
            if (referenceImages && referenceImages.length > 0) {
                referenceImages.forEach(img => {
                    parts.unshift({ inlineData: { data: img.base64, mimeType: img.mimeType } });
                });
            }
            
            const response = await getAi().models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    imageConfig: { aspectRatio: aspectRatio },
                    responseModalities: [Modality.IMAGE],
                },
            });
            const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imagePart?.inlineData?.data) {
                imageUrls.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            }
        }
        if (imageUrls.length === 0) throw new Error('AI không trả về dữ liệu ảnh.');
        return imageUrls;
    } catch (error) {
        return handleError(error, 'tạo thư pháp');
    }
};

export const generateImageFromText = async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number = 1): Promise<string[]> => {
  try {
    const enhancedPrompt = `${prompt}, 8k resolution, photorealistic, highly detailed, sharp focus, professional photography. No text or watermarks.`;
    const imageUrls: string[] = [];
    for (let i = 0; i < numberOfImages; i++) {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: enhancedPrompt }] },
            config: {
                imageConfig: { aspectRatio: aspectRatio },
                responseModalities: [Modality.IMAGE],
            },
        });
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart?.inlineData?.data) {
            imageUrls.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
        }
    }
    if (imageUrls.length === 0) throw new Error('AI không trả về dữ liệu ảnh. Vui lòng thử lại.');
    return imageUrls;
  } catch (error) {
    return handleError(error, 'tạo ảnh từ văn bản');
  }
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<any> => {
    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        return handleError(error, 'phân tích ảnh');
    }
};

export const editImageWithText = async (base64ImageData: string, mimeType: string, prompt: string, aspectRatio?: AspectRatio): Promise<string> => {
    try {
        const enhancedPrompt = `${prompt}. High quality, photorealistic, sharp details, professional. No text or watermarks.`;
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: enhancedPrompt },
                ],
            },
            config: {
                ...(aspectRatio ? { imageConfig: { aspectRatio } } : {}),
                responseModalities: [Modality.IMAGE],
            },
        });
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart?.inlineData?.data) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts.find(part => part.text);
            if (textPart?.text) throw new Error(`Model returned a text response: ${textPart.text}`);
            throw new Error('Không có dữ liệu ảnh trả về từ API.');
        }
    } catch (error) {
        return handleError(error, 'chỉnh sửa ảnh');
    }
};

export const removeBackground = async (base64ImageData: string, mimeType: string): Promise<string> => {
    return await editImageWithText(base64ImageData, mimeType, "Remove the background completely, keeping only the main subject on a transparent background.");
};

export const restoreOldPhoto = async (base64ImageData: string, mimeType: string): Promise<string> => {
    const prompt = `Restore and colorize this old photograph. Full natural colors, fix scratches, sharpen details, modern high-quality photo look.`;
    return await editImageWithText(base64ImageData, mimeType, prompt);
};

export const upscaleImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
    return await editImageWithText(base64ImageData, mimeType, "Upscale to high resolution, enhance details, sharpen focus, high quality.");
};

export const generateMultipleImageEdits = async (base64ImageData: string, mimeType: string, prompt: string, numberOfImages: number, aspectRatio?: AspectRatio): Promise<string[]> => {
    try {
        const imageUrls: string[] = [];
        for (let i = 0; i < numberOfImages; i++) {
            const url = await editImageWithText(base64ImageData, mimeType, prompt, aspectRatio);
            imageUrls.push(url);
        }
        return imageUrls;
    } catch (error) {
        return handleError(error, 'tạo nhiều ảnh biến thể');
    }
};

export const generatePromptFromImage = async (base64ImageData: string, mimeType: string, userWish?: string): Promise<BilingualPrompt> => {
    try {
        let textPrompt = `Analyze this image and create a highly creative, detailed video prompt for a 5-10 second clip.`;
        if (userWish?.trim()) textPrompt += ` Incorporate user wish: "${userWish.trim()}".`;
        textPrompt += ' Provide result as JSON with keys "vi" and "en".';
        const response = await getAi().models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: textPrompt },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vi: { type: Type.STRING },
                        en: { type: Type.STRING },
                    },
                    required: ['vi', 'en'],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        return handleError(error, 'tạo prompt từ ảnh');
    }
};

export const suggestBackground = async (model: ImageInput | null, clothing: ImageInput | null, accessory: ImageInput | null): Promise<string> => {
    try {
        const parts: any[] = [];
        if (model) parts.push({ inlineData: { data: model.base64, mimeType: model.mimeType } });
        if (clothing) parts.push({ inlineData: { data: clothing.base64, mimeType: clothing.mimeType } });
        if (accessory) parts.push({ inlineData: { data: accessory.base64, mimeType: accessory.mimeType } });
        parts.push({text: "Suggest a professional photography background for this fashion item/model/product. Return only one line in Vietnamese."});
        const response = await getAi().models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: { parts },
        });
        return response.text.trim();
    } catch(error) {
        return "bối cảnh studio tối giản";
    }
}

export const generateAdCreative = async (model: ImageInput | null, clothing: ImageInput | null, accessory: ImageInput | null, userPrompt: string, aspectRatio: AspectRatio): Promise<string[]> => {
    try {
        let backgroundPrompt = userPrompt.trim() || await suggestBackground(model, clothing, accessory);
        const promptText = `Create a photorealistic fashion ad. Background: ${backgroundPrompt}. Aspect ratio ${aspectRatio}.`;
        const parts: any[] = [];
        if (model) parts.push({ inlineData: { data: model.base64, mimeType: model.mimeType } });
        if (clothing) parts.push({ inlineData: { data: clothing.base64, mimeType: clothing.mimeType } });
        if (accessory) parts.push({ inlineData: { data: accessory.base64, mimeType: accessory.mimeType } });
        parts.push({ text: promptText });
        const processOne = async () => {
            const res = await getAi().models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    imageConfig: { aspectRatio: aspectRatio },
                    responseModalities: [Modality.IMAGE],
                },
            });
            const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (!part?.inlineData?.data) throw new Error('Không có dữ liệu ảnh trả về.');
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        };
        const imageUrls = [];
        for (let i = 0; i < 2; i++) imageUrls.push(await processOne());
        return imageUrls;
    } catch (error) {
        return handleError(error, 'tạo ảnh quảng cáo');
    }
};

export const generateProductPhotoshoot = async (productImage: ImageInput, finalPrompt: string, aspectRatio: AspectRatio, numberOfImages: number): Promise<string[]> => {
    try {
        const imageUrls: string[] = [];
        for (let i = 0; i < numberOfImages; i++) {
            const response = await getAi().models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: productImage.base64, mimeType: productImage.mimeType } },
                        { text: finalPrompt },
                    ],
                },
                config: {
                    imageConfig: { aspectRatio: aspectRatio },
                    responseModalities: [Modality.IMAGE],
                },
            });
            const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (part?.inlineData?.data) imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
        return imageUrls;
    } catch (error) {
        return handleError(error, 'tạo ảnh sản phẩm');
    }
};

export const extractFashionProduct = async (modelImage: ImageInput, itemsToExtract: string[]): Promise<string> => {
    const prompt = `Extract only these items: ${itemsToExtract.join(', ')}. Isolated on transparent background.`;
    return await editImageWithText(modelImage.base64, modelImage.mimeType, prompt);
};

export const dressOnModel = async (clothingImage: ImageInput, modelImage: ImageInput, aspectRatio: AspectRatio, userPrompt: string, autoFit: boolean = false): Promise<string> => {
    try {
        const autoFitInstruction = autoFit ? "IMPORTANT: Tailored fit." : "";
        const prompt = `Dress the model. ${autoFitInstruction} ${userPrompt}. Aspect ratio ${aspectRatio}.`;
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: clothingImage.base64, mimeType: clothingImage.mimeType } },
                    { inlineData: { data: modelImage.base64, mimeType: modelImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                imageConfig: { aspectRatio: aspectRatio },
                responseModalities: [Modality.IMAGE],
            },
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return `data:${part?.inlineData?.mimeType};base64,${part?.inlineData?.data}`;
    } catch (error) {
        return handleError(error, 'mặc đồ lên mẫu');
    }
};

export const displayFashionProduct = async (clothingImage: ImageInput, scenePrompt: string, aspectRatio: AspectRatio): Promise<string> => {
    return await generateProductPhotoshoot(clothingImage, scenePrompt, aspectRatio, 1).then(urls => urls[0]);
};

export const generateProductPackaging = async (productImage: ImageInput, coverImage: ImageInput | null, finalPrompt: string, aspectRatio: AspectRatio, numberOfImages: number): Promise<string[]> => {
    try {
        const imageUrls: string[] = [];
        for (let i = 0; i < numberOfImages; i++) {
            const parts: any[] = [{ inlineData: { data: productImage.base64, mimeType: productImage.mimeType } }];
            if (coverImage) parts.push({ inlineData: { data: coverImage.base64, mimeType: coverImage.mimeType } });
            parts.push({ text: finalPrompt });
            const response = await getAi().models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    imageConfig: { aspectRatio: aspectRatio },
                    responseModalities: [Modality.IMAGE],
                },
            });
            const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (part?.inlineData?.data) imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
        return imageUrls;
    } catch (error) {
        return handleError(error, 'tạo bao bì sản phẩm');
    }
};

export const generateVideoScript = async (images: (ImageInput | null)[], productName: string, productInfo: string, industry: string, brandTone: string, targetAudience: string, duration: string, cta: string): Promise<VideoScript> => {
    try {
        const parts: any[] = [];
        images.filter(img => img).forEach(img => parts.push({ inlineData: { data: img!.base64, mimeType: img!.mimeType } }));
        parts.push({ text: `Create a video script for ${productName}. Tone: ${brandTone}. CTA: ${cta}.` });
        const response = await getAi().models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    scene_number: { type: Type.INTEGER },
                                    visuals: { type: Type.STRING },
                                    voiceover: { type: Type.STRING },
                                },
                                required: ['scene_number', 'visuals', 'voiceover'],
                            },
                        },
                    },
                    required: ['title', 'summary', 'scenes'],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        return handleError(error, 'tạo kịch bản video');
    }
};

export const generateImageForScene = async (visuals: string, brandTone: string, productName: string, productImage: ImageInput | null, aspectRatio: AspectRatio): Promise<string> => {
    try {
        const prompt = `Ad scene for ${productName}. Visuals: ${visuals}. Tone: ${brandTone}. Aspect ratio ${aspectRatio}.`;
        const parts: any[] = [];
        if (productImage) parts.push({ inlineData: { data: productImage.base64, mimeType: productImage.mimeType } });
        parts.push({ text: prompt });
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                imageConfig: { aspectRatio: aspectRatio },
                responseModalities: [Modality.IMAGE],
            },
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return `data:${part?.inlineData?.mimeType};base64,${part?.inlineData?.data}`;
    } catch (error) {
        return handleError(error, `tạo ảnh cho cảnh`);
    }
};

export const generateAdCopyFromScript = async (script: VideoScript): Promise<string> => {
    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Write a social media ad copy in Vietnamese: ${script.title}.`,
        });
        return response.text.trim();
    } catch (error) {
        return "Không thể tạo nội dung quảng cáo.";
    }
};

export const generateFacebookPost = async (imageDetail: string, mood: string, wordCount: number): Promise<{ title: string; content: string }> => {
    try {
        const prompt = `Dựa vào mô tả: "${imageDetail}". Tâm trạng: ${mood}. Độ dài: ${wordCount} từ. Trả về JSON: title, content.`;
        const response = await getAi().models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                    },
                    required: ['title', 'content'],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        return handleError(error, 'tạo bài viết Facebook');
    }
};

export interface SwapAnalysis {
    backgroundSlot: {
        position: string;
        pose: string;
        elevation: string; // Added to capture height context
        lightingCondition: string;
        occlusionDetails: string;
    };
    sourceCharacter: {
        identity: string;
        clothingDetails: string;
        keyAccessories: string;
    };
    integrationInstructions: string;
}

export const analyzeSwapContext = async (backgroundImg: ImageInput, characterImg: ImageInput): Promise<SwapAnalysis> => {
    try {
        const prompt = `
Analyze these two images for a character swap task.
IMAGE 1 (Background): The base image where a character will be replaced.
IMAGE 2 (Character Source): The image containing the new character to be inserted.

Output ONLY a valid JSON object with this structure:
{
  "backgroundSlot": {
    "position": "precise coordinates or description of where the subject stands in Image 1",
    "pose": "pose of the subject in Image 1",
    "elevation": "Crucial: Is the subject standing on an elevated platform/machine? Describe the height and what they are standing on.",
    "lightingCondition": "lighting in Image 1",
    "occlusionDetails": "what blocks the subject in Image 1"
  },
  "sourceCharacter": {
    "identity": "identity in Image 2",
    "clothingDetails": "clothing in Image 2",
    "keyAccessories": "accessories in Image 2"
  },
  "integrationInstructions": "How to put Image 2's character into Image 1's slot without moving the platform or changing the background."
}
        `.trim();

        const response = await getAi().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: "IMAGE 1 (Background):" },
                    { inlineData: { data: backgroundImg.base64, mimeType: backgroundImg.mimeType } },
                    { text: "IMAGE 2 (Character Source):" },
                    { inlineData: { data: characterImg.base64, mimeType: characterImg.mimeType } },
                    { text: prompt },
                ],
            }
        });

        const text = response.candidates?.[0]?.content?.parts[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI không thể phân tích bối cảnh hình ảnh.");
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        throw new Error("Lỗi phân tích hình ảnh: " + (error instanceof Error ? error.message : String(error)));
    }
};

export const swapCharacter = async (backgroundImg: ImageInput, characterImg: ImageInput, aspectRatio: AspectRatio, analysis?: SwapAnalysis): Promise<string> => {
    try {
        let prompt = "";
        
        if (analysis) {
            prompt = `
[TASK: 100% CHARACTER REPLACEMENT - 8K ULTRA-HD]
1. DELETE ORIGINAL: Locate the original subject in Image 1 at position: ${analysis.backgroundSlot.position}. REMOVE THEM COMPLETELY from the scene.
2. HEAL BACKGROUND: Inpaint/Heal the background behind the removed person. DO NOT move or lower the ${analysis.backgroundSlot.elevation}.
3. TRANSPLANT: Extract the character from Image 2 and place them EXACTLY where the original person was.
4. HEIGHT: They must be standing at the SAME HIGH ELEVATION as before (${analysis.backgroundSlot.elevation}).
5. IDENTITY: Keep the character from Image 2 100% identical. No changes to clothing, face or accessories.
6. QUALITY: Output MUST be 8K Ultra-HD resolution, sharper and more detailed than the original images.
7. INTEGRATION: Match environment lighting (${analysis.backgroundSlot.lightingCondition}) and shadows perfectly.
            `.trim();
        } else {
            prompt = `
[TASK: SEAMLESS CHARACTER TRANSPLANT - 8K]
1. REMOVE: Identify the person in Image 1 and delete them.
2. REPLACE: Place the person from Image 2 in the exact same location and height.
3. BACKGROUND: Keep Image 1's background 100% the same. No lifting or lowering of objects.
4. QUALITY: Ultra-sharp 8K resolution.
            `.trim();
        }

        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: "IMAGE 1: BACKGROUND ENVIRONMENT" },
                    { inlineData: { data: backgroundImg.base64, mimeType: backgroundImg.mimeType } },
                    { text: "IMAGE 2: NEW CHARACTER TO INSERT" },
                    { inlineData: { data: characterImg.base64, mimeType: characterImg.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                imageConfig: { aspectRatio: aspectRatio },
                responseModalities: [Modality.IMAGE],
            },
        });

        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!part?.inlineData?.data) throw new Error('AI không trả về kết quả hoán đổi.');
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } catch (error) {
        return handleError(error, 'hoán đổi nhân vật');
    }
};

export const startVideoGeneration = async (prompt: string, style: VideoStyle, aspectRatio: AspectRatio, image: ImageInput | null) => {
    try {
        const config: any = { 
            model: 'veo-3.1-lite-generate-preview', 
            prompt: `${prompt}. Style: ${style}.`, 
            config: { resolution: '720p', aspectRatio: aspectRatio, numberOfVideos: 1 } 
        };
        if (image) config.image = { imageBytes: image.base64, mimeType: image.mimeType };
        return await getAi().models.generateVideos(config);
    } catch (error) {
        return handleError(error, 'bắt đầu tạo video');
    }
};

export const pollVideoGeneration = async (operation: any) => {
    return await getAi().operations.getVideosOperation({ operation });
};

export const translateTextToEnglish = async (text: string): Promise<string> => {
    const response = await getAi().models.generateContent({ model: 'gemini-3.1-pro-preview', contents: `Translate to English: ${text}` });
    return response.text.trim();
};

export const generateSpeechFromText = async (text: string, voiceName: string, persona?: string, speed?: number, pitch?: number): Promise<string> => {
    try {
        const isChild = persona?.toLowerCase().includes('đứa trẻ') || persona?.toLowerCase().includes('bé');
        const speedText = speed ? (speed > 1.1 ? "nhanh" : speed < 0.9 ? "chậm" : "bình thường") : "bình thường";
        const pitchText = pitch ? (pitch > 2 ? "cao" : pitch < -2 ? "trầm" : "tự nhiên") : "tự nhiên";

        if (isChild) {
            const response = await getAi().models.generateContent({ 
                model: "gemini-3-flash-preview",
                contents: [{ parts: [{ text: `Đọc: "${text}"` }] }],
                config: {
                    systemInstruction: `VAI DIỄN: ${persona}. Tốc độ: ${speedText}. Tông: ${pitchText}.`,
                    responseModalities: [Modality.AUDIO]
                }
            });
            const audioData = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
            if (!audioData) throw new Error("Không nhận được dữ liệu âm thanh.");
            return audioData;
        }

        const response = await getAi().models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: `Đọc: "${text}"` }] }],
            config: {
                systemInstruction: persona ? `GIỌNG: ${persona}. Tốc độ: ${speedText}. Tông: ${pitchText}.` : undefined,
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
            },
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) throw new Error("Không nhận được dữ liệu âm thanh.");
        return audioData;
    } catch (error) {
        return handleError(error, 'tạo giọng nói');
    }
};
