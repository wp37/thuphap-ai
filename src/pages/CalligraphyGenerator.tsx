import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCalligraphyImage, getCalligraphyPrompt, AspectRatio } from '../services/geminiService';
import { SparklesIcon, DownloadIcon, LoaderIcon, UploadIcon, TerminalIcon, CopyIcon, CheckIcon, ChevronDownIcon } from '../components/Icons';

interface CalligraphyGeneratorProps {
  onOpenPreview: (url: string, onDownload: () => void) => void;
}

const typographyStyles = [
  { id: 'quoc_ngu', label: 'Thư pháp Quốc ngữ', prompt: 'modern clear typography styled to look vaguely like brush script, prioritizing 100% exact legibility of Latin characters' },
  { id: 'classic', label: 'Thư pháp truyền thống', prompt: 'elegant and readable brush lettering' },
  { id: 'modern', label: 'Thư pháp bay bổng', prompt: 'bold, contemporary typography with minimal flourishes to ensure spelling is preserved' },
  { id: 'hannom', label: 'Hán Nôm cổ điển', prompt: 'square, structured typographic font styling, highly legible' },
  { id: 'woodcut', label: 'Khắc gỗ / Typography', prompt: 'sharp typographic woodblock print style, clearly readable letters' },
];

const calligraphySuggestions = [
  { category: 'Đơn chữ', items: ['Tâm', 'Đức', 'Nhẫn', 'Phúc', 'Lộc', 'Thọ', 'An', 'Khang', 'Trí', 'Dũng', 'Hiếu', 'Nghĩa'] },
  { category: 'Cặp chữ (Đối)', items: ['Phát Tài - Phát Lộc', 'Vạn Sự - Như Ý', 'An Khang - Thịnh Vượng', 'Gia Hòa - Vạn Sự Hưng', 'Thành Công - Mỹ Mãn', 'Đắc Nhân - Tâm'] },
  { category: 'Bộ ba (Tam đa)', items: ['Phúc - Lộc - Thọ', 'Chân - Thiện - Mỹ', 'Nhẫn - Trí - Dũng'] },
  { category: 'Bộ bốn (Tứ quý)', items: ['Tùng - Trúc - Cúc - Mai', 'Xuân - Hạ - Thu - Đông', 'Phong - Hoa - Tuyết - Nguyệt'] },
];

const imageModes = [
  { id: 'overlay', label: 'Giữ nguyên nhân vật', description: 'Chèn chữ lên ảnh, giữ nguyên chủ thể và nhân vật gốc.' },
  { id: 'hybrid', label: 'Hòa hợp nghệ thuật', description: 'Chữ uốn lượn xung quanh nhân vật, tạo cảm giác chữ và người hòa quyện.' },
  { id: 'background', label: 'Làm phông nền', description: 'Dùng ảnh tải lên làm nền chính cho tác phẩm thư pháp.' }
];

const backgroundStyles = [
  { id: 'sand', label: 'Cát Sa Mạc', prompt: 'vast desert sand dunes, golden sunset sunlight, hyperrealistic 3D carving in sand with deep shadows' },
  { id: 'porcelain', label: 'Gốm sứ trắng', prompt: 'painted on a pure white, shiny traditional ceramic vase/plate, beautiful reflections' },
  { id: 'do_paper', label: 'Giấy dó cổ vàng', prompt: 'ancient, slightly weathered yellowed Do paper (Vietnamese traditional paper) with rich handmade texture' },
  { id: 'thuymac', label: 'Thủy mặc (Shui-mo)', prompt: 'traditional wet ink wash painting background with subtle, ethereal, faded misty mountains' },
  { id: 'wood', label: 'Gỗ mộc mạc', prompt: 'rustic, time-worn dark wooden board with beautiful deep organic wood grains' },
  { id: 'beach_pebbles', label: 'Đá cuội bãi biển', prompt: 'carved onto smooth, round, wet pebbles scattered on a serene beach, gentle waves, natural sunlight' },
  { id: 'jade', label: 'Ngọc bích nguyên khối', prompt: 'carved deeply into polished, glowing green jade stone, elegant and luxurious texture' },
  { id: 'bamboo', label: 'Thẻ tre cổ', prompt: 'written on ancient, weathered bamboo slips securely tied together with string, historical texture' },
  { id: 'lotus_leaf', label: 'Lá sen sương mai', prompt: 'painted over a giant green lotus leaf covered in magical glowing morning dew drops' },
  { id: 'autumn_leaves', label: 'Thảm lá mùa thu', prompt: 'scattered dry golden, orange, and red autumn leaves covering the ground' },
  { id: 'bronze_plate', label: 'Mặt đồng cổ', prompt: 'engraved on an ancient oxidized bronze plate with beautiful green patina textures' },
  { id: 'silk_scroll', label: 'Lụa vàng hoàng gia', prompt: 'painted on a luxurious, shiny golden silk scroll with delicate woven patterns' },
  { id: 'frozen_ice', label: 'Băng tuyết ngàn năm', prompt: 'carved into a clear, solid chunk of winter ice with frosted edges and internal cracks' },
  { id: 'leather', label: 'Da thuộc cổ', prompt: 'burnt or etched onto an old, worn dark brown leather hide with rough edges' },
  { id: 'coastal_rock', label: 'Tảng đá lớn ven biển', prompt: 'carved deeply into the flat top surface of a large, prominent squarish rock resting on a beautiful sandy beach next to gentle ocean waves. Scenic coastal mountains and a winding road in the background under warm golden hour sunlight, highly detailed and photorealistic' },
  { id: 'cloud_mist', label: 'Mây trời mờ ảo', prompt: 'floating amongst ethereal swirling white clouds and gentle mist against a clear sky' },
];

const stampStyles = [
  { id: 'none', label: 'Không ấn chương', prompt: 'No stamps or seals in the image' },
  { id: 'tiger_stamp', label: 'Triện đỏ (Tác phẩm của VNT)', prompt: 'An authentic red personal seal graphic in the corner, containing the words "Tác phẩm của VNT" clearly printed in a basic legible font' },
  { id: 'vnt_logo', label: 'Logo Sư Tử / VNT', prompt: 'A small elegant red and gold circular logo graphic in the corner containing the letters "VNT" clearly printed' }
];

const motifs = [
  { id: 'none', label: 'Không (Chữ thuần)', prompt: 'The calligraphy stands alone beautifully, with impeccable traditional brushstroke structure' },
  { id: 'rat', label: 'Linh Thử (Rat)', prompt: 'The calligraphy strokes intelligently morph into the subtle, clever form of a rat' },
  { id: 'ox', label: 'Trâu Rừng (Ox)', prompt: 'The calligraphy strokes form the powerful, grounded, and majestic head and horns of an ox' },
  { id: 'tiger', label: 'Mãnh Hổ (Tiger)', prompt: 'The calligraphy strokes seamlessly morph into the shape of a majestic, pacing tiger in an artistic, expressive manner' },
  { id: 'cat', label: 'Linh Miêu (Cat)', prompt: 'The calligraphy strokes elegantly form the agile, graceful silhouette of a cat' },
  { id: 'dragon', label: 'Thần Long (Dragon)', prompt: 'The calligraphy flows elegantly into the form of an oriental dragon soaring through clouds' },
  { id: 'snake', label: 'Linh Xà (Snake)', prompt: 'The calligraphy strokes glide smoothly to form the coiling, mystical shape of a snake' },
  { id: 'horse', label: 'Tuấn Mã (Horse)', prompt: 'The calligraphy perfectly outlines the silhouette of a galloping horse with a flowing mane' },
  { id: 'goat', label: 'Kim Dương (Goat)', prompt: 'The calligraphy gracefully outlines the sturdy shape and majestic horns of a goat/ram' },
  { id: 'monkey', label: 'Linh Hầu (Monkey)', prompt: 'The calligraphy creatively twists into the dynamic, playful silhouette of a monkey' },
  { id: 'rooster', label: 'Thần Kê (Rooster)', prompt: 'The calligraphy flourishes proudly into the shape of a majestic rooster with an elegant tail' },
  { id: 'dog', label: 'Thiên Cẩu (Dog)', prompt: 'The calligraphy forms the loyal, protective profile of a majestic dog' },
  { id: 'pig', label: 'Kim Trư (Pig)', prompt: 'The calligraphy smoothly creates the prosperous, rounded silhouette of a pig' },
  { id: 'phoenix', label: 'Phượng Hoàng (Phoenix)', prompt: 'The calligraphy flourishes gracefully shape a flying phoenix with beautiful tail feathers' },
  { id: 'carp', label: 'Cá Chép (Carp)', prompt: 'The calligraphy intertwines with the elegant leaps of a koi carp over a water gate' }
];

const textColors = [
  { id: 'black_ink', label: 'Mực Tàu (Đen)', color: 'black ink' },
  { id: 'cinnabar_red', label: 'Châu Sa (Đỏ)', color: 'cinnabar red' },
  { id: 'imperial_gold', label: 'Kim Nhung (Vàng)', color: 'imperial gold' },
  { id: 'cobalt_blue', label: 'Lam Ngọc (Xanh Dương)', color: 'cobalt blue' },
  { id: 'jade_green', label: 'Lục Ngọc (Xanh Ngọc)', color: 'jade green' },
  { id: 'pure_white', label: 'Bạch Ngọc (Trắng)', color: 'pure white' },
];

const videoStyles = [
  { id: 'ink_bleed', label: 'Mực loang (Ink flow)', prompt: 'Cinematic slow motion, black ink naturally expanding and absorbing into textured paper, organic fluid motion, high resolution.' },
  { id: 'flying_brush', label: 'Nét bút bay (Flying brush)', prompt: 'An invisible brush stroke magically painting calligraphy in mid-air, leaving a trail of glowing ink, dynamic camera panning.' },
  { id: 'gold_particles', label: 'Hạt vàng lấp lánh', prompt: 'Calligraphy strokes dispersing into tiny glowing gold particles, floating upwards like embers, magical atmosphere, hyper-detailed.' },
  { id: 'smoke_reveal', label: 'Khói mờ ảo (Smoke)', prompt: 'Ethereal colored smoke swirling and shaping itself into elegant calligraphy characters, dark moody background, smooth transition.' },
  { id: 'sweeping_light', label: 'Ánh sáng quét qua', prompt: 'A cinematic beam of warm light sweeping across the calligraphy carving, highlighting the 3D texture and creating dramatic shadows, photorealistic.' },
  { id: 'cinematic_zoom', label: 'Zoom chậm điện ảnh', prompt: 'Slow dramatic zoom in on the intricate details of the calligraphy ink and paper texture, shallow depth of field, 4k ultra realistic.' },
  { id: '3d_emboss', label: 'Chữ nổi 3D (3D popup)', prompt: 'Calligraphy magically embossing and raising off the surface of jade/stone, 3D macro photography, cinematic lighting.' },
  { id: 'time_lapse', label: 'Phai màu (Time-lapse)', prompt: 'Time-lapse effect showing calligraphy aging gracefully, edges softly fraying and ancient patina appearing over years.' },
  { id: 'watercolor_flow', label: 'Thủy mặc (Watercolor)', prompt: 'Watercolor style animation, colors smoothly flowing and blending into the calligraphy strokes, artistic, soothing motion.' },
  { id: 'dragon_phoenix', label: 'Rồng bay phượng múa', prompt: 'Calligraphy strokes transforming into abstract ethereal dragons and phoenixes flying out of the frame, epic fantasy style, dynamic movement.' },
];

const DropdownField = ({
  number,
  title,
  options,
  selected,
  onSelect,
  renderOption = (opt: any) => opt.label,
  columns = 1
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden">
      <button 
        className={`w-full p-4 flex flex-col gap-1 text-left transition-colors focus:outline-none ${isOpen ? 'bg-zinc-900/30' : 'hover:bg-zinc-900/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 cursor-pointer">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black transition-colors ${isOpen ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-[#D4AF37] group-hover:bg-zinc-700'}`}>{number}</span>
            <span className={isOpen ? 'text-[#D4AF37]' : ''}>{title}</span>
          </label>
          <ChevronDownIcon className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        <div className="text-[#fafafa] font-medium ml-7 mt-0.5 text-sm truncate opacity-80">
          {renderOption(selected)}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-800/50 bg-black/40"
          >
            <div className={`p-3 grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              {options.map((opt: any, index: number) => {
                 const isSelected = (selected.id ? selected.id === opt.id : selected.ratio ? selected.ratio === opt.ratio : selected.value === opt.value);
                 return (
                   <button 
                     key={opt.id || opt.ratio || opt.value || index}
                     onClick={() => { onSelect(opt); setIsOpen(false); }}
                     className={`w-full text-left p-3 rounded-lg text-sm transition-all focus:outline-none ${
                       isSelected ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30' : 'text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800'
                     }`}
                   >
                     {renderOption(opt)}
                   </button>
                 );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CalligraphyGenerator: React.FC<CalligraphyGeneratorProps> = ({ onOpenPreview }) => {
  const [numImages, setNumImages] = useState({ value: 1, label: '1 bức (Đơn)' });
  const [texts, setTexts] = useState<string[]>(['Phát Tài', '', '', '']);
  const [selectedTypography, setSelectedTypography] = useState(typographyStyles[0]);
  const [selectedBackground, setSelectedBackground] = useState(backgroundStyles[0]);
  const [selectedMotif, setSelectedMotif] = useState(motifs[0]);
  const [selectedColor, setSelectedColor] = useState(textColors[0]);
  const [selectedStamp, setSelectedStamp] = useState(stampStyles[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedVideoStyle, setSelectedVideoStyle] = useState(videoStyles[0]);
  const [selectedImageMode, setSelectedImageMode] = useState(imageModes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isVideoCopied, setIsVideoCopied] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showVideoPromptModal, setShowVideoPromptModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [referenceImage, setReferenceImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validTexts = texts.slice(0, numImages.value).filter(t => t.trim());
  const displayTexts = validTexts.length > 0 ? validTexts : ['Thư Pháp'];

  const exportedPrompt = displayTexts.map((txt, i) => {
    const prompt = getCalligraphyPrompt(
      txt,
      selectedTypography.prompt,
      selectedBackground.prompt,
      selectedMotif.prompt,
      selectedColor.color,
      selectedStamp.prompt,
      !!referenceImage,
      selectedImageMode.id as any
    );
    
    return `[ELITE AI IMAGE PROMPT - CALLIGRAPHY PIECE ${i + 1}/${numImages.value}]
[1. CORE CONCEPT]
- SUBJECT: A masterpiece-level calligraphy featuring the exact text: "${txt}".
- VISUAL STYLE: ${selectedTypography.label}.
- MOTIF: ${selectedMotif.label}.
- COLOR: ${selectedColor.color} ink.
- STAMP: ${selectedStamp.label}.
${referenceImage ? `- IMAGE INTEGRATION MODE: ${selectedImageMode.label} (${selectedImageMode.description})` : ''}
${numImages.value > 1 ? `- COLLECTION CONTEXT: This is piece #${i + 1} of a matching ${numImages.value}-piece set. Maintain perfect stylistic consistency with other pieces.` : ''}

[2. TECHNICAL DETAILS]
- AUTHENTICITY: 100% correct Vietnamese spelling and diacritics. No extra letters.
- QUALITY: 8k resolution, hyper-realistic textures, professional lighting.
${prompt}`;
  }).join('\n\n' + '='.repeat(40) + '\n\n');

  const exportedVideoPrompt = `[ELITE AI VIDEO PROMPT - CALLIGRAPHY MASTERPIECE SERIES]

[1. CORE CONCEPTS - MULTI-PIECE COLLECTION]
- SUBJECTS: A series of ${numImages.value} majestic calligraphy compositions.
- TEXTS TO FEATURE: ${displayTexts.map(t => `"${t}"`).join(', ')}.
- VISUAL STYLE: ${selectedTypography.label} — ${selectedColor.color} ink strokes on ${selectedBackground.prompt}, highly artistic, elegant traditional feel.
- ELITE DETAILS: Masterpiece with ${selectedStamp.label} seal and ${selectedMotif.label} motifs.
- ENVIRONMENT: A close-up of high-quality highly textured ${selectedBackground.label} environment filling the frame.

[2. CINEMATIC MOVEMENT]
- ACTION: ${selectedVideoStyle.prompt}

[3. SENSORY & ATMOSPHERE]
- LIGHTING: Dramatic, highly professional cinematography with volumetric light rays and deep contrasts.
- TEXTURES: Ultra-realistic, high-fidelity tactile textures.
- CAMERA WORK: Masterful camera movement across the collection, shallow depth of field, sharp focus on the calligraphy.
- AUDIO DESIGN: Deep, cinematic traditional sounds. ABSOLUTELY NO VOICEOVER, NO SPOKEN WORDS.

[4. STRICT INSTRUCTIONS]
- PRESERVATION: Maintain 100% integrity of all ${numImages.value} original calligraphy texts and their styling.
- RESTRICTION: The video must purely focus on the requested visual motion, magic effects, and soundscape. Do not add any narrations or speech. No morphing of the text letters.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(exportedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyVideoPrompt = () => {
    navigator.clipboard.writeText(exportedVideoPrompt);
    setIsVideoCopied(true);
    setTimeout(() => setIsVideoCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isSubject: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const imageData = {
           url,
           base64: base64Data,
           mimeType: file.type
        };
        if (isSubject) setSubjectImage(imageData);
        else setReferenceImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const handleApplySuggestion = (item: string) => {
    const words = item.split(' - ');
    const newTexts = [...texts];
    words.forEach((w, i) => {
      if (i < 4) newTexts[i] = w;
    });
    // Adjust numImages if needed
    if (words.length > 1 && numImages.value < words.length) {
      setNumImages({ value: words.length, label: `${words.length} bức (${words.length === 2 ? 'Đối' : words.length === 3 ? 'Tam' : 'Tứ'})` });
    }
    setTexts(newTexts);
    setShowSuggestions(false);
  };

  const handleGenerate = async () => {
    const validTexts = texts.slice(0, numImages.value).filter(t => t.trim());
    if (validTexts.length === 0) {
      setError('Vui lòng nhập chữ thư pháp.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setResults([]);

    try {
      const allUrls: string[] = [];
      const refImages = [];
      if (referenceImage) refImages.push({ base64: referenceImage.base64, mimeType: referenceImage.mimeType });

      for (const t of validTexts) {
        const urls = await generateCalligraphyImage(
          t.trim(),
          selectedTypography.prompt,
          selectedBackground.prompt,
          selectedMotif.prompt,
          selectedColor.color,
          selectedStamp.prompt,
          aspectRatio,
          refImages.length > 0 ? refImages : undefined,
          1,
          selectedImageMode.id as any
        );
        allUrls.push(...urls);
      }
      setResults(allUrls);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo ảnh.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    if (url.startsWith('data:')) {
      const arr = url.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `calligraphy_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = `calligraphy_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-full min-h-[85vh]">
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 border border-zinc-800 bg-zinc-950/50 backdrop-blur-md p-6 rounded-2xl flex flex-col gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
            <SparklesIcon className="text-[#D4AF37] w-6 h-6" />
            TUAI Thư Pháp Đại Sư
          </h2>
          <p className="text-sm text-zinc-400">
            Kiến tạo kiệt tác thư pháp kết hợp tinh hoa mỹ thuật Á Đông.
          </p>
        </div>
        <div className="space-y-12 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-10">
          {/* STEP 1: CONTENT */}
          <section className="space-y-6 relative">
            <div className="absolute -left-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D4AF37] to-transparent opacity-20"></div>
            <div className="flex items-center gap-4 mb-4 px-1">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(212,175,55,0.4)]">1</div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Khởi Tạo</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Nội dung cốt lõi</p>
              </div>
            </div>
            
            <div className="pl-6 space-y-4">
              <DropdownField
                number="A"
                title="Số lượng bức chữ (Bộ sưu tập)"
                options={[{ value: 1, label: '1 bức (Đơn)' }, { value: 2, label: '2 bức (Đối)' }, { value: 3, label: '3 bức (Tam)' }, { value: 4, label: '4 bức (Tứ)' }]}
                selected={numImages}
                onSelect={(opt: any) => setNumImages(opt)}
                columns={2}
              />

              <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#D4AF37] flex items-center justify-center text-[10px] shrink-0 font-black">B</span>
                    Nội dung chữ thư pháp
                  </label>
                  <button onClick={() => setShowSuggestions(true)} className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded hover:bg-[#D4AF37]/20 transition-colors">Gợi ý nội dung</button>
                </div>
                <div className="pl-7 space-y-3">
                  {Array.from({ length: numImages.value }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={texts[idx]}
                      onChange={(e) => handleTextChange(idx, e.target.value)}
                      placeholder={`Bức ${idx + 1}: VD: ${['Phát Tài', 'Vạn Sự', 'Như Ý', 'An Khang'][idx] || 'Tâm'}...`}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white text-base font-medium focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2: ART STYLE */}
          <section className="space-y-6 relative">
            <div className="absolute -left-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D4AF37] via-[#D4AF37] to-transparent opacity-20"></div>
            <div className="flex items-center gap-4 mb-4 px-1">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(212,175,55,0.4)]">2</div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Hồn Chữ</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Tinh hoa mỹ thuật</p>
              </div>
            </div>

            <div className="pl-6 space-y-4">
              <DropdownField
                number="C"
                title="Phong Cách Chữ"
                options={typographyStyles}
                selected={selectedTypography}
                onSelect={setSelectedTypography}
                columns={2}
              />

              <DropdownField
                number="D"
                title="Chất Liệu Nền"
                options={backgroundStyles}
                selected={selectedBackground}
                onSelect={setSelectedBackground}
                columns={2}
              />

              <DropdownField
                number="E"
                title="Linh Thú Ẩn Hình"
                options={motifs}
                selected={selectedMotif}
                onSelect={setSelectedMotif}
                columns={2}
              />

              <DropdownField
                number="F"
                title="Màu Sắc Khởi Vận"
                options={textColors}
                selected={selectedColor}
                onSelect={setSelectedColor}
                columns={2}
                renderOption={(opt: any) => (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: opt.id === 'black_ink' ? '#111' : opt.id === 'cinnabar_red' ? '#e8382c' : opt.id === 'imperial_gold' ? '#D4AF37' : opt.id === 'cobalt_blue' ? '#0047AB' : opt.id === 'jade_green' ? '#00A86B' : opt.id === 'pure_white' ? '#FFFFFF' : 'transparent' }} />
                    {opt.label}
                  </span>
                )}
              />

              <DropdownField
                number="G"
                title="Dấu Ấn / Triện"
                options={stampStyles}
                selected={selectedStamp}
                onSelect={setSelectedStamp}
                columns={1}
              />

              <div className={`bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 transition-all duration-300 ${referenceImage ? 'ring-1 ring-[#D4AF37]/30' : ''}`}>
                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#D4AF37] flex items-center justify-center text-[10px] shrink-0 font-black">H</span>
                  Tải lên & Hoán đổi nhân vật
                </label>
                <div className="pl-7 space-y-5">
                  {/* Mode Selector */}
                  <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Chế độ hòa quyện / Hoán đổi</label>
                      <div className="grid grid-cols-1 gap-2">
                        {imageModes.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setSelectedImageMode(mode)}
                            className={`text-left p-3 rounded-lg border transition-all ${selectedImageMode.id === mode.id ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                          >
                            <div className="text-xs font-bold uppercase tracking-tight">{mode.label}</div>
                            <div className="text-[10px] opacity-60 leading-tight mt-0.5">{mode.description}</div>
                          </button>
                        ))}
                      </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-zinc-800/50">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                        ẢNH MẪU
                        {referenceImage && <button onClick={() => setReferenceImage(null)} className="text-red-500 hover:text-red-400">Gỡ bỏ</button>}
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${referenceImage ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800'}`} onClick={() => fileInputRef.current?.click()}>
                          <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, false)} />
                          {referenceImage ? (
                            <div className="flex items-center gap-4 text-left">
                                <img src={referenceImage.url} alt="Reference" className="w-16 h-16 object-cover rounded-lg border border-zinc-700" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#D4AF37]">Đã tải ảnh mẫu</p>
                                  <p className="text-xs text-zinc-500">Kích vào để thay đổi</p>
                                </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-2">
                                <UploadIcon className="w-6 h-6 text-zinc-500" />
                                <p className="text-sm text-zinc-400 font-medium">Tải ảnh mẫu / nhân vật</p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: PUBLISH CONFIG */}
          <section className="space-y-6 relative">
            <div className="absolute -left-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D4AF37] via-[#D4AF37] to-[#D4AF37] opacity-20"></div>
            <div className="flex items-center gap-4 mb-4 px-1">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(212,175,55,0.4)]">3</div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Khai Bút</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Thông số & Xuất bản</p>
              </div>
            </div>

            <div className="pl-6 space-y-4">
              <DropdownField
                number="I"
                title="Tỷ lệ khung hình"
                options={[{ ratio: '1:1', label: 'Vuông (1:1)' }, { ratio: '3:4', label: 'Dọc (3:4)' }, { ratio: '9:16', label: 'Cao (9:16)' }, { ratio: '16:9', label: 'Ngang (16:9)' }]}
                selected={{ ratio: aspectRatio, label: aspectRatio === '1:1' ? 'Vuông (1:1)' : aspectRatio === '3:4' ? 'Dọc (3:4)' : aspectRatio === '9:16' ? 'Cao (9:16)' : 'Ngang (16:9)' }}
                onSelect={(opt: any) => setAspectRatio(opt.ratio)}
                columns={2}
              />

              <DropdownField
                number="K"
                title="Phong Cách Video Cảnh Động"
                options={videoStyles}
                selected={selectedVideoStyle}
                onSelect={setSelectedVideoStyle}
                columns={2}
              />
            </div>
          </section>
        </div>

        <div className="pt-4 border-t border-zinc-800 relative z-10 shrink-0">
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={isGenerating || !texts.slice(0, numImages.value).some(t => t.trim())} className="flex-[2] bg-white hover:bg-[#D4AF37] disabled:bg-zinc-800 disabled:text-zinc-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-xl shrink-0">
              {isGenerating ? <LoaderIcon className="w-4 h-4 animate-spin shrink-0" /> : <SparklesIcon className="w-4 h-4 shrink-0" />}
              Vẽ Thư Pháp
            </button>
            <button onClick={() => setShowPromptModal(true)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[#D4AF37] border border-zinc-800 py-4 px-1 rounded-xl font-black uppercase tracking-[0.05em] text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-1 text-center shrink-0">
              <TerminalIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              Lấy Lệnh
            </button>
            <button onClick={() => setShowVideoPromptModal(true)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[#D4AF37] border border-zinc-800 py-4 px-1 rounded-xl font-black uppercase tracking-[0.05em] text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-1 text-center shrink-0">
              <span className="shrink-0 font-serif font-black text-xs sm:text-sm italic pl-1 leading-none">V</span>
              Tạo Video
            </button>
          </div>
          {error && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">{error}</motion.div>}
        </div>
      </div>

      <div className="flex-1 border border-zinc-800 bg-zinc-950/30 backdrop-blur-sm rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[60vh] lg:min-h-0">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}></div>
         {results.length > 0 ? (
           <div className="w-full h-full flex flex-col gap-10 relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar p-1 pb-40 lg:pb-0">
             <div className={`grid w-full h-fit gap-4 lg:gap-6 mx-auto items-start p-4 ${
               results.length === 1 ? 'max-w-2xl grid-cols-1' :
               results.length === 2 ? 'max-w-5xl grid-cols-2' :
               results.length === 3 ? 'max-w-7xl grid-cols-3' :
               'max-w-7xl grid-cols-2 md:grid-cols-4'
             }`}>
                {results.map((url, idx) => (
                  <div key={idx} className="w-full flex flex-col items-center gap-3">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: -20 }} 
                      animate={{ opacity: 1, scale: 1, x: 0 }} 
                      transition={{ 
                        delay: idx * 0.15, 
                        type: "spring", 
                        stiffness: 100,
                        damping: 15
                      }} 
                      className="group relative rounded-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-zinc-800 bg-black w-full" 
                      style={{ 
                        aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : aspectRatio === '3:4' ? '3/4' : '1/1',
                      }}
                    >
                      <img src={url} alt={`Result ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-4 pb-6">
                          <div className="flex flex-col gap-2 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <button onClick={() => onOpenPreview(url, () => handleDownload(url))} className="w-full bg-white/10 hover:bg-white/25 backdrop-blur-xl border border-white/10 text-white py-2.5 rounded-full font-bold transition-all text-xs shadow-2xl">Phóng to</button>
                            <button onClick={() => handleDownload(url)} className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black py-2.5 rounded-full font-black transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 text-xs"><DownloadIcon className="w-3.5 h-3.5" />Lưu</button>
                          </div>
                      </div>
                    </motion.div>
                    <div className="text-center px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/50">
                      <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Tác phẩm #{idx + 1}</span>
                    </div>
                  </div>
                ))}
             </div>
           </div>
         ) : isGenerating ? (
           <div className="flex flex-col items-center justify-center text-center space-y-6 relative z-10">
              <div className="relative"><div className="w-32 h-32 rounded-full border-4 border-zinc-800 border-t-[#D4AF37] animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><SparklesIcon className="text-[#D4AF37] w-10 h-10 animate-pulse" /></div></div>
              <div><p className="text-xl font-medium text-white mb-2">Bút pháp thăng hoa...</p></div>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center text-zinc-500 space-y-4 text-center relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transform -rotate-6 shadow-xl mb-4"><span className="text-5xl font-serif text-[#D4AF37] opacity-50">字</span></div>
              <p className="text-lg">Tuyệt tác không lời chờ bạn khai bút.</p>
           </div>
         )}
      </div>

      {showPromptModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20"><TerminalIcon className="text-[#D4AF37] w-5 h-5" /></div><div><h3 className="text-white font-bold">Lệnh AI Chuyên Sâu</h3></div></div>
                  <button onClick={() => setShowPromptModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white">✕</button>
               </div>
               <div className="p-8">
                  <div className="group relative bg-black/60 border border-zinc-800 rounded-2xl overflow-hidden"><div className="p-6 font-mono text-sm text-zinc-300 select-all max-h-[350px] overflow-y-auto custom-scrollbar"><pre className="whitespace-pre-wrap break-words">{exportedPrompt}</pre></div></div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                     <button onClick={handleCopyPrompt} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isCopied ? 'bg-green-500 text-white' : 'bg-[#D4AF37] hover:bg-[#F3E5AB] text-black'}`}>
                        {isCopied ? <><CheckIcon className="w-5 h-5" />Đã Sao Chép</> : <><CopyIcon className="w-4 h-4" />Sao Chép Lệnh AI</>}
                     </button>
                     <button onClick={() => setShowPromptModal(false)} className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl transition-all">Đóng</button>
                  </div>
               </div>
            </motion.div>
         </div>
      )}

      {showVideoPromptModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20"><SparklesIcon className="text-[#D4AF37] w-5 h-5" /></div><div><h3 className="text-white font-bold">Lệnh Tạo Video (Runway, Luma, Kling...)</h3></div></div>
                  <button onClick={() => setShowVideoPromptModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white">✕</button>
               </div>
               <div className="p-8">
                  <div className="group relative bg-black/60 border border-zinc-800 rounded-2xl overflow-hidden"><div className="p-6 font-mono text-sm text-zinc-300 select-all max-h-[350px] overflow-y-auto custom-scrollbar"><pre className="whitespace-pre-wrap break-words">{exportedVideoPrompt}</pre></div></div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                     <button onClick={handleCopyVideoPrompt} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isVideoCopied ? 'bg-green-500 text-white' : 'bg-[#D4AF37] hover:bg-[#F3E5AB] text-black'}`}>
                        {isVideoCopied ? <><CheckIcon className="w-5 h-5" />Đã Sao Chép</> : <><CopyIcon className="w-4 h-4" />Sao Chép Lệnh Video</>}
                     </button>
                     <button onClick={() => setShowVideoPromptModal(false)} className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl transition-all">Đóng</button>
                  </div>
               </div>
            </motion.div>
         </div>
      )}

      {showSuggestions && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20"><CheckIcon className="text-[#D4AF37] w-5 h-5" /></div><div><h3 className="text-white font-bold">Gợi ý nội dung (Grammar)</h3></div></div>
                  <button onClick={() => setShowSuggestions(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white">✕</button>
               </div>
               <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-8">
                     {calligraphySuggestions.map((group) => (
                       <div key={group.category}>
                          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">{group.category}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {group.items.map((item) => (
                               <button 
                                 key={item} 
                                 onClick={() => handleApplySuggestion(item)}
                                 className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all text-center"
                               >
                                 {item}
                               </button>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="p-6 border-t border-zinc-800 text-center">
                  <button onClick={() => setShowSuggestions(false)} className="px-8 py-3 bg-zinc-900 text-zinc-400 rounded-xl font-bold">Đóng</button>
               </div>
            </motion.div>
         </div>
      )}
    </div>
  );
};

export default CalligraphyGenerator;
