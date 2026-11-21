export type BreakfastFormat = 'video' | 'text' | 'both';

export type BreakfastItem = {
  id: string;
  title: string;
  date: string;
  formattedDate: string;
  duration: string;
  readTime: string;
  format: BreakfastFormat;
  scriptureRef: string;
  scriptureText: string;
  author: string;
  tags: string[];
  summary: string;
  text: string;
  prayer: string;
  videoDurationSeconds: number;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
};

export const BREAKFASTS: BreakfastItem[] = [
  {
    id: 'peace',
    title: 'La paix au milieu du bruit',
    date: 'Aujourd’hui, 19 nov.',
    formattedDate: 'Jeudi 19 novembre 2026',
    duration: '12 min',
    readTime: '6 min de lecture',
    format: 'both',
    scriptureRef: 'Jean 15.4-5',
    scriptureText: '« Demeurez en moi, et je demeurerai en vous. Comme le sarment ne peut de lui-même porter du fruit, s’il ne demeure attaché au cep, ainsi vous ne le pouvez non plus, si vous ne demeurez en moi. »',
    author: 'Pasteur Selwyn',
    tags: ['Paix', 'Communion', 'Silence'],
    summary: 'Apprendre à faire silence dans un quotidien bruyant pour entendre le murmure de la présence divine.',
    text: `Au milieu des sollicitations incessantes, des notifications et des urgences du quotidien, notre esprit peut facilement devenir encombré. Nous courons après le temps, nous inquiétons pour le lendemain, et nous oublions la source même de notre paix.

Jésus nous adresse cette invitation fondamentale : « Demeurez en moi ». Demeurer n’est pas un effort anxieux, c’est une posture de repos intérieur. C’est choisir, même pendant quelques minutes au lever du jour, de déposer nos fardeaux et de nous rappeler que nous ne sommes pas seuls.

La paix que le Seigneur communique ne dépend pas de l’absence de problèmes extérieurs. Elle naît de l’assurance de sa présence constante à nos côtés. Dès aujourd’hui, lorsque vous sentirez l’agitation monter, prenez une profonde inspiration, fermez les yeux un court instant et redites dans votre cœur : « Seigneur, je demeure en toi ».`,
    prayer: `Seigneur, je dépose entre tes mains toutes les agitations de cette journée. Remplis mon esprit de ta sainte paix et apprends-moi à demeurer attaché à toi en chaque circonstance. Amen.`,
    videoDurationSeconds: 735,
  },
  {
    id: 'rest',
    title: 'Le repos véritable en Dieu',
    date: 'Hier, 18 nov.',
    formattedDate: 'Mercredi 18 novembre 2026',
    duration: '8 min',
    readTime: '5 min de lecture',
    format: 'both',
    scriptureRef: 'Matthieu 11.28-30',
    scriptureText: '« Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. Prenez mon joug sur vous et recevez mes instructions... »',
    author: 'Frère Philippe',
    tags: ['Repos', 'Fardeau', 'Confiance'],
    summary: 'Décharger son cœur devant le Père pour recevoir un renouvellement intérieur.',
    text: `Le monde nous pousse constamment à la performance et à l’autosuffisance. Mais Dieu sait combien nos cœurs peuvent être fatigués et accablés sous le poids des responsabilités.

Prendre du repos en Dieu, ce n’est pas simplement dormir ou cesser ses activités professionnelles. C’est relâcher la tension spirituelle, accepter que nous ne pouvons pas tout contrôler et remettre le gouvernail de nos vies entre ses mains aimantes.

Son joug est doux et son fardeau léger parce qu’Il porte l’essentiel avec nous. Abandonnez-lui vos inquiétudes ce matin.`,
    prayer: `Père céleste, je viens à toi avec ma fatigue et mes soucis. Merci de porter ce qui m’écrase et d’accorder à mon âme le repos véritable dont elle a besoin. Amen.`,
    videoDurationSeconds: 510,
  },
  {
    id: 'faith',
    title: 'Marcher par la foi, un pas après l’autre',
    date: '17 nov. 2026',
    formattedDate: 'Mardi 17 novembre 2026',
    duration: '10 min',
    readTime: '4 min de lecture',
    format: 'both',
    scriptureRef: '2 Corinthiens 5.7',
    scriptureText: '« Car nous marchons par la foi et non par la vue. »',
    author: 'Équipe Koinonia',
    tags: ['Foi', 'Direction', 'Confiance'],
    summary: 'Avancer avec assurance même lorsque le chemin à venir n’est pas complètement éclairé.',
    text: `Marcher par la foi n’est pas l’absence de doutes passagers, c’est la résolution de continuer à obéir et à faire confiance même lorsque les circonstances semblent contraires.

Dieu ne nous révèle pas toujours les dix prochaines étapes de notre voyage spirituel ; Il nous donne la lumière nécessaire pour le prochain pas. C’est dans cette dépendance quotidienne que notre relation avec Lui grandit et s’enracine.`,
    prayer: `Seigneur, affermis ma foi lorsque mes yeux ne voient pas l’issue. Donne-moi le courage de faire le prochain pas dans l’obéissance à ta parole. Amen.`,
    videoDurationSeconds: 615,
  },
  {
    id: 'communion',
    title: 'La communion fraternelle vivante',
    date: '16 nov. 2026',
    formattedDate: 'Lundi 16 novembre 2026',
    duration: '11 min',
    readTime: '5 min de lecture',
    format: 'both',
    scriptureRef: 'Actes 2.42',
    scriptureText: '« Ils persévéraient dans l’enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain, et dans les prières. »',
    author: 'Sœur Marie-Ange',
    tags: ['Communion', 'Église', 'Unité'],
    summary: 'La force de grandir ensemble dans l’amour fraternel et le soutien mutuel.',
    text: `Koinonia, c’est le partage profond, la communion des cœurs rachetés par le Christ. La vie chrétienne n’a jamais été conçue pour être vécue en solitaire.

Lorsque nous partageons nos joies, nos fardeaux et notre foi, l’Esprit Saint agit avec une puissance renouvelée. Prenons le temps d’encourager un frère ou une sœur aujourd’hui.`,
    prayer: `Père, ouvre mon cœur à mes frères et sœurs. Fais de moi un instrument de paix, d’édification et d’encouragement dans ma communauté. Amen.`,
    videoDurationSeconds: 670,
  },
];

export function enrichBreakfastUrls(item: BreakfastItem, baseUrl: string = ''): BreakfastItem {
  return {
    ...item,
    videoUrl: `${baseUrl}/api/breakfasts/${item.id}/download/video`,
    audioUrl: `${baseUrl}/api/breakfasts/${item.id}/download/audio`,
    pdfUrl: `${baseUrl}/api/breakfasts/${item.id}/download/pdf`,
  };
}

export function getAllBreakfasts(baseUrl: string = ''): BreakfastItem[] {
  return BREAKFASTS.map(b => enrichBreakfastUrls(b, baseUrl));
}

export function getTodayBreakfast(baseUrl: string = ''): BreakfastItem {
  return enrichBreakfastUrls(BREAKFASTS[0], baseUrl);
}

export function getBreakfastById(id: string, baseUrl: string = ''): BreakfastItem | undefined {
  const found = BREAKFASTS.find(b => b.id.toLowerCase() === id.toLowerCase());
  return found ? enrichBreakfastUrls(found, baseUrl) : undefined;
}

/**
 * Génère un document PDF binaire standard (PDF 1.4) sans dépendance tierce lourde.
 */
export function generateBreakfastPdfBuffer(item: BreakfastItem): Buffer {
  const clean = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques pour la police Type1 standard
      .replace(/[()\\]/g, '\\$&')
      .replace(/[\r\n]+/g, ' ');

  const title = clean(item.title);
  const date = clean(item.formattedDate);
  const author = clean(item.author);
  const scriptureRef = clean(item.scriptureRef);
  const scripture = clean(item.scriptureText);
  const summary = clean(item.summary);
  const prayer = clean(item.prayer);

  const paragraphs = item.text
    .split('\n\n')
    .map(p => clean(p.trim()))
    .filter(Boolean);

  let stream = `BT
/F1 18 Tf
50 780 Td
(${title}) Tj
/F2 11 Tf
0 -24 Td
(${date} - Par ${author}) Tj
0 -26 Td
/F1 12 Tf
(Passage biblique : ${scriptureRef}) Tj
0 -18 Td
/F3 10 Tf
(${scripture.slice(0, 85)}) Tj
`;

  if (scripture.length > 85) {
    stream += `0 -14 Td
(${scripture.slice(85, 170)}) Tj
`;
  }

  stream += `0 -28 Td
/F1 13 Tf
(Points cles :) Tj
0 -18 Td
/F2 10 Tf
(${summary.slice(0, 90)}) Tj
`;

  if (summary.length > 90) {
    stream += `0 -14 Td
(${summary.slice(90, 180)}) Tj
`;
  }

  stream += `0 -28 Td
/F1 13 Tf
(Meditation :) Tj
`;

  for (const para of paragraphs) {
    stream += `0 -18 Td
/F2 10 Tf
(${para.slice(0, 90)}) Tj
`;
    if (para.length > 90) {
      stream += `0 -14 Td
(${para.slice(90, 180)}) Tj
`;
    }
  }

  stream += `0 -28 Td
/F1 13 Tf
(Priere du jour :) Tj
0 -18 Td
/F3 10 Tf
(${prayer.slice(0, 90)}) Tj
`;

  if (prayer.length > 90) {
    stream += `0 -14 Td
(${prayer.slice(90, 180)}) Tj
`;
  }

  stream += `0 -36 Td
/F2 9 Tf
(Koinonia - Meditation quotidienne du matin - https://koinonia.app) Tj
ET`;

  const streamBuf = Buffer.from(stream, 'utf8');
  const streamLength = streamBuf.length;

  const header = `%PDF-1.4\n`;
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const obj6 = `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const obj7 = `7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n`;

  let offset = Buffer.byteLength(header, 'utf8');
  const off1 = offset; offset += Buffer.byteLength(obj1, 'utf8');
  const off2 = offset; offset += Buffer.byteLength(obj2, 'utf8');
  const off3 = offset; offset += Buffer.byteLength(obj3, 'utf8');
  const off4 = offset; offset += Buffer.byteLength(obj4, 'utf8');
  const off5 = offset; offset += Buffer.byteLength(obj5, 'utf8');
  const off6 = offset; offset += Buffer.byteLength(obj6, 'utf8');
  const off7 = offset; offset += Buffer.byteLength(obj7, 'utf8');

  const xref = `xref\n0 8\n0000000000 65535 f \n${String(off1).padStart(10, '0')} 00000 n \n${String(off2).padStart(10, '0')} 00000 n \n${String(off3).padStart(10, '0')} 00000 n \n${String(off4).padStart(10, '0')} 00000 n \n${String(off5).padStart(10, '0')} 00000 n \n${String(off6).padStart(10, '0')} 00000 n \n${String(off7).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + obj6 + obj7 + xref + trailer, 'utf8');
}

/**
 * Génère un en-tête MP3 ID3v2 minimal valide pour téléchargement audio.
 */
export function generateSampleAudioBuffer(item: BreakfastItem): Buffer {
  const title = Buffer.from(`Breakfast: ${item.title}`, 'utf8');
  const header = Buffer.from([
    0x49, 0x44, 0x33, // "ID3"
    0x03, 0x00,       // Version 2.3
    0x00,             // Flags
    0x00, 0x00, 0x02, 0x00 // Size
  ]);
  const silencePayload = Buffer.alloc(4096, 0);
  return Buffer.concat([header, title, silencePayload]);
}

/**
 * Génère un conteneur MP4 minimal valide (ftyp box + moov box) pour téléchargement vidéo.
 */
export function generateSampleVideoBuffer(item: BreakfastItem): Buffer {
  // ftyp box (24 bytes)
  const ftyp = Buffer.from([
    0x00, 0x00, 0x00, 0x18, // box size = 24
    0x66, 0x74, 0x79, 0x70, // "ftyp"
    0x69, 0x73, 0x6f, 0x6d, // "isom"
    0x00, 0x00, 0x02, 0x00, // minor version
    0x69, 0x73, 0x6f, 0x6d, // "isom"
    0x6d, 0x70, 0x34, 0x31  // "mp41"
  ]);

  // moov box (header)
  const moov = Buffer.from([
    0x00, 0x00, 0x00, 0x10, // box size = 16
    0x6d, 0x6f, 0x6f, 0x76, // "moov"
    0x00, 0x00, 0x00, 0x08, // child box size = 8
    0x6d, 0x76, 0x68, 0x64  // "mvhd"
  ]);

  const payload = Buffer.alloc(4096, 0);
  return Buffer.concat([ftyp, moov, payload]);
}
