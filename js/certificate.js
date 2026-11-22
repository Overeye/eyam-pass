const SERIF = '"Source Serif 4", Georgia, Palatino, "Palatino Linotype", serif';

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCentered(ctx, text, y, maxWidth, lineHeight) {
  const lines = wrapLines(ctx, text, maxWidth);
  for (const line of lines) {
    ctx.fillText(line, ctx.canvas.width / 2, y);
    y += lineHeight;
  }
  return y;
}

function fitSize(ctx, text, maxWidth, start, weight) {
  let size = start;
  while (size > 28) {
    ctx.font = `${weight} ${size}px ${SERIF}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return size;
}

export async function drawCertificate(canvas, model) {
  const width = 1080;
  const height = 1520;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  try {
    await document.fonts.load('400 32px "Source Serif 4"');
    await document.fonts.load('600 64px "Source Serif 4"');
    await document.fonts.ready;
  } catch (error) {
    /* Fall back to the next face in the stack. */
  }

  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#1c3d32";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, width - 96, height - 96);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(64, 64, width - 128, height - 128);

  ctx.strokeStyle = "#1c3d32";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 34, 168);
  ctx.lineTo(width / 2 - 34, 138);
  ctx.quadraticCurveTo(width / 2, 96, width / 2 + 34, 138);
  ctx.lineTo(width / 2 + 34, 168);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#7a3e2e";
  ctx.font = `600 22px ${SERIF}`;
  ctx.fillText("FOR EYAM MUSEUM   ·   DRAFT", width / 2, 214);

  const nameSize = fitSize(ctx, model.villagerName, 820, 60, 600);
  ctx.fillStyle = "#1c3d32";
  ctx.font = `600 68px ${SERIF}`;
  ctx.fillText("The Eyam Pass", width / 2, 290);
  ctx.font = `400 34px ${SERIF}`;
  ctx.fillStyle = "#241c16";
  ctx.fillText("Certificate of survival", width / 2, 342);

  ctx.strokeStyle = "#7a3e2e";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 372);
  ctx.lineTo(width / 2 + 120, 372);
  ctx.stroke();

  let y = 430;
  ctx.fillStyle = "#241c16";
  ctx.font = `400 26px ${SERIF}`;
  y = drawCentered(
    ctx,
    "This marks a finished trail of three stops. The title refers to the village's choice to keep the sickness within its own boundary. It is not a claim that every person survived.",
    y,
    820,
    38,
  );

  y += 28;
  ctx.fillStyle = "#51473e";
  ctx.font = `600 20px ${SERIF}`;
  ctx.fillText("WALKED WITH THE STORY OF", width / 2, y);
  y += 64;
  ctx.fillStyle = "#1c3d32";
  ctx.font = `600 ${nameSize}px ${SERIF}`;
  ctx.fillText(model.villagerName, width / 2, y);

  y += 56;
  ctx.fillStyle = "#7a3e2e";
  ctx.font = `600 20px ${SERIF}`;
  ctx.fillText("FATE, AS DRAFTED", width / 2, y);
  y += 40;
  ctx.fillStyle = "#241c16";
  ctx.font = `400 26px ${SERIF}`;
  y = drawCentered(ctx, model.fate, y, 820, 38);

  y += 20;
  ctx.fillStyle = "#7a3e2e";
  ctx.font = `600 20px ${SERIF}`;
  ctx.fillText("DRAFT WORD", width / 2, y);
  y += 28;

  const box = 112;
  const gap = 22;
  const total = model.letters.length * box + (model.letters.length - 1) * gap;
  let x = (width - total) / 2;
  ctx.strokeStyle = "#1c3d32";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#1c3d32";
  for (const item of model.letters) {
    ctx.strokeRect(x, y, box, box);
    ctx.font = `600 58px ${SERIF}`;
    ctx.fillText(item.letter, x + box / 2, y + 74);
    x += box + gap;
  }
  y += box + 40;
  ctx.font = `600 28px ${SERIF}`;
  ctx.fillText(model.word, width / 2, y);

  y += 36;
  ctx.fillStyle = "#241c16";
  ctx.font = `400 24px ${SERIF}`;
  y = drawCentered(
    ctx,
    "Three example stops: Mompesson's Well, the Boundary Stone, and the Riley Graves. More stops would be added later, and the word would grow.",
    y,
    820,
    34,
  );

  y += 28;
  ctx.fillStyle = "#51473e";
  ctx.font = `400 22px ${SERIF}`;
  y = drawCentered(ctx, `Completed on ${model.dateLabel}`, y, 820, 32);
  y = drawCentered(
    ctx,
    "Personal prototype by Jon Rowland. Not an official Eyam Museum publication.",
    y,
    820,
    32,
  );
  drawCentered(ctx, "History and answers are drafts for the museum to check.", y, 820, 32);
}
