import { commentContentIndex, commentContentItem, commentFlashFont } from "@/@types/IrText";
import { config } from "@/definition/config";
import { charItem, measureTextInput, parsedComment } from "@/@types/flashText";
import { parseFont } from "@/utils/utils";
import { navieSort } from "@/utils/sort";

const getFontName = (font: string): commentFlashFont => {
  if (font.match(/^simsun/)) { return "simsun"; }
  if (font === "gothic") { return "defont"; }
  return "gulim";
};

const splitContents = (string: string) => {
  return Array.from(string.match(/[\n\r]|[^\n\r]+/g) || []).map((val) =>
    Array.from(val.match(/[ -~｡-ﾟ]+|[^ -~｡-ﾟ]+/g) || []),
  );
};

const getFontIndex = (string: string): commentContentIndex[] => {
  const regex = {
    simsunStrong: new RegExp(config.flashChar.simsunStrong),
    simsunWeak: new RegExp(config.flashChar.simsunWeak),
    gulim: new RegExp(config.flashChar.gulim),
    gothic: new RegExp(config.flashChar.gothic),
  };
  const index: commentContentIndex[] = [];
  let match;
  if ((match = regex.simsunStrong.exec(string)) !== null) {
    index.push({ font: "simsunStrong", index: match.index });
  }
  if ((match = regex.simsunWeak.exec(string)) !== null) {
    index.push({ font: "simsunWeak", index: match.index });
  }
  if ((match = regex.gulim.exec(string)) !== null) {
    index.push({ font: "gulim", index: match.index });
  }
  if ((match = regex.gothic.exec(string)) !== null) {
    index.push({ font: "gothic", index: match.index });
  }
  return index;
};
const parse = (string: string, compat = false): parsedComment => {
  const content: commentContentItem[] = [];
  const lines = splitContents(string);
  for (const line of lines) {
    const lineContent: commentContentItem[] = [];
    for (const part of line) {
      if (part.match(/[ -~｡-ﾟ]+/g) !== null) {
        lineContent.push(parseHalfStr(part, compat));
        continue;
      }
      lineContent.push(...parseFullStr(part));
    }
    const firstContent = lineContent[0];
    if (firstContent?.font) {
      content.push(
        ...lineContent.map((val) => {
          val.font ||= firstContent.font;
          return val;
        }),
      );
    } else {
      content.push(...lineContent);
    }
  }
  const lineCount = Array.from(string.match(/[\n\r]/g) || []).length + 1;
  const font = content[0]?.font || "defont";
  const lineOffset =
    (string.match(new RegExp(config.flashScriptChar.super, "g"))?.length || 0) * -1 * config.scriptCharOffset +
    (string.match(new RegExp(config.flashScriptChar.sub, "g"))?.length || 0) * config.scriptCharOffset;
  return { content, font, lineCount, lineOffset };
};

const parseHalfStr = (string: string, compat: boolean): commentContentItem => {
  if (compat) {
    const result: charItem[] = [];
    let buffer = "";
    let lastItem: charItem | undefined;
    let lastChar = "";
    for (const char of string) {
      if (char === "a" && lastChar === "a") {
        if (buffer) {
          lastItem = { type: "text", text: buffer };
          result.push(lastItem);
          buffer = "";
        }
        lastChar = "";
        if (lastItem?.type === "fill" && lastItem.char === "a") {
          lastItem.width += 1;
          continue;
        }
        lastItem = { type: "fill", char: "a", width: 1 };
        result.push(lastItem);
        continue;
      }
      if (char === " ") {
        if (buffer) {
          lastItem = { type: "text", text: buffer };
          result.push(lastItem);
          buffer = "";
        }
        if (lastItem?.type === "space" && lastItem.char === " ") {
          lastItem.width += 0.5;
          continue;
        }
        lastItem = { type: "space", char: " ", width: 0.5 };
        result.push(lastItem);
        continue;
      }
      buffer += lastChar;
      lastChar = char;
    }
    if (buffer || lastChar) {
      result.push({ type: "text", text: buffer + lastChar });
    }
    return { type: "compat", content: result };
  }
  return {
    type: "normal",
    content: string,
  };
};

const parseFullStr = (string: string): commentContentItem[] => {
  const index = getFontIndex(string);
  if (index.length === 0) {
    return [{ type: "normal", content: string }];
  } else if (index.length === 1 && index[0]) {
    return [{ type: "normal", content: string, font: getFontName(index[0].font) }];
  } else {
    index.sort(navieSort("index"));
    if (config.flashMode === "xp") {
      const result: commentContentItem[] = [];
      let offset = 0;
      for (let i = 1; i < index.length; i++) {
        const currentVal = index[i];
        const lastVal = index[i - 1];
        if (currentVal === undefined || lastVal === undefined) {
          continue;
        }
        result.push({
          type: "normal",
          content: string.slice(offset, currentVal.index),
          font: getFontName(lastVal.font),
        });
        offset = currentVal.index;
      }
      const val = index[index.length - 1];
      if (val) {
        result.push({ type: "normal", content: string.slice(offset), font: getFontName(val.font) });
      }
      return result;
    } else {
      const firstVal = index[0];
      const secondVal = index[1];
      if (!(firstVal && secondVal)) {
        return [{ type: "normal", content: string }];
      }
      if (firstVal.font !== "gothic") {
        return [{ type: "normal", content: string, font: getFontName(firstVal.font) }];
      } else {
        return [
          {
            type: "normal",
            content: string.slice(0, secondVal.index),
            font: getFontName(firstVal.font),
          },
          {
            type: "normal",
            content: string.slice(secondVal.index),
            font: getFontName(secondVal.font),
          },
        ];
      }
    }
  }
};

const measure = (context: CanvasRenderingContext2D, comment: measureTextInput) => {
  const width_arr = [];
  const spacedWidth_arr = [];
  let currentWidth = 0;
  let spacedWidth = 0;
  for (let i = 0; i < comment.content.length; i++) {
    const item = comment.content[i];
    if (item === undefined) {
      continue;
    }
    const widths = [];
    if (item.type === "normal") {
      const lines = item.content.split(/[\n\r]/);

      context.font = parseFont(item.font || comment.font, comment.size);
      for (let i = 0; i < lines.length; i++) {
        const value = lines[i];
        if (value === undefined) {
          continue;
        }
        const measure = context.measureText(value);
        currentWidth += measure.width;
        spacedWidth += measure.width + Math.max(value.length - 1, 0) * config.letterSpacing;
        widths.push(measure.width);
        if (i < lines.length - 1) {
          width_arr.push(currentWidth);
          spacedWidth_arr.push(spacedWidth);
          spacedWidth = 0;
          currentWidth = 0;
        }
      }
    } else {
      context.font = parseFont(item.font || comment.font, comment.size);
      for (let i = 0; i < item.content.length; i++) {
        const value = item.content[i];
        if (value === undefined) {
          continue;
        }
        if (value.type === "fill" || value.type === "space") {
          currentWidth += value.width * comment.size;
          spacedWidth += value.width * comment.size;
          widths.push(value.width * comment.size);
        } else {
          const measure = context.measureText(value.text);
          currentWidth += measure.width;
          spacedWidth += measure.width + Math.max(value.text.length - 1, 0) * config.letterSpacing;
          widths.push(measure.width);
        }
      }
    }
    item.width = widths;
  }
  width_arr.push(currentWidth);
  spacedWidth_arr.push(spacedWidth);
  const leadLine = (function () {
    let max = 0;
    let index = -1;
    for (let i = 0, l = spacedWidth_arr.length; i < l; i++) {
      const val = spacedWidth_arr[i];
      if (val && max < val) {
        max = val;
        index = i;
      }
    }
    return { max, index };
  })();
  const scaleX = leadLine.max / (width_arr[leadLine.index] || 1);
  const height = comment.size * config.lineHeight * comment.lineCount + config.commentYPaddingTop;
  return { width: Math.max(...width_arr, 0), scaleX, height };
};
export { parse, measure };
