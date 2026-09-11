import * as XLSX from 'xlsx';

export interface ParsedDataRow {
  rank?: number;
  rawName: string;
  points: number;
}

export interface DetectedColumns {
  nameCol: string;
  pointsCol: string;
  rankCol?: string;
  allColumns: string[];
}

/**
 * Normalizes numbers like "290,708,166", "146.5M", "25k", "1,2B" into standard integers/floats.
 */
export const parseNumericValue = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;

  const str = String(val).trim();
  if (!str) return 0;

  // Check abbreviations like 146M, 25K, 1.2B
  const suffixMatch = str.match(/^([\d.,]+)\s*([kKmMbB])?$/);
  if (suffixMatch) {
    let numStr = suffixMatch[1];
    const suffix = (suffixMatch[2] || '').toUpperCase();

    // Standardize commas and dots: if both present, e.g. "1,234.56" or "1.234,56"
    if (numStr.includes(',') && numStr.includes('.')) {
      if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
        // European style 1.234,56
        numStr = numStr.replace(/\./g, '').replace(',', '.');
      } else {
        // US style 1,234.56
        numStr = numStr.replace(/,/g, '');
      }
    } else if (numStr.includes(',')) {
      const commaCount = (numStr.match(/,/g) || []).length;
      if (commaCount > 1 || /,\d{3}($|\D)/.test(numStr)) {
        numStr = numStr.replace(/,/g, '');
      } else {
        numStr = numStr.replace(',', '.');
      }
    } else if (numStr.includes('.')) {
      const dotCount = (numStr.match(/\./g) || []).length;
      if (dotCount > 1 || /\.\d{3}($|\D)/.test(numStr)) {
        numStr = numStr.replace(/\./g, '');
      }
    }

    const baseNum = parseFloat(numStr);
    if (isNaN(baseNum)) return 0;

    if (suffix === 'K') return Math.round(baseNum * 1_000);
    if (suffix === 'M') return Math.round(baseNum * 1_000_000);
    if (suffix === 'B') return Math.round(baseNum * 1_000_000_000);
    return Math.round(baseNum);
  }

  // Fallback: clean all non-numeric characters except minus sign
  const cleaned = str.replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Automatically guesses which columns contain Player Name, Points, and Rank.
 */
export const detectColumns = (sampleRows: Record<string, any>[]): DetectedColumns => {
  if (!sampleRows || sampleRows.length === 0) {
    return { nameCol: '', pointsCol: '', allColumns: [] };
  }

  const allColumns = Object.keys(sampleRows[0]);
  let nameCol = '';
  let pointsCol = '';
  let rankCol: string | undefined = undefined;

  // Patterns for column detection
  const nameKeywords = ['nombre', 'name', 'jugador', 'player', 'operativo', 'miembro', 'oficial', 'oficiales', 'alias', 'usuario'];
  const pointsKeywords = ['puntos', 'points', 'pts', 'daño', 'damage', 'poder', 'power', 'score', 'valor', 'total', 'resultado', 'prep'];
  const rankKeywords = ['#', 'rank', 'puesto', 'pos', 'posicion', 'lugar', 'top'];

  // 1. Check by header names
  for (const col of allColumns) {
    const cleanCol = col.toLowerCase().trim();
    if (!rankCol && rankKeywords.some(kw => cleanCol === kw || cleanCol.startsWith(kw))) {
      rankCol = col;
      continue;
    }
    if (!nameCol && nameKeywords.some(kw => cleanCol === kw || cleanCol.includes(kw))) {
      nameCol = col;
      continue;
    }
    if (!pointsCol && pointsKeywords.some(kw => cleanCol === kw || cleanCol.includes(kw))) {
      pointsCol = col;
      continue;
    }
  }

  // 2. If not detected by name, detect by content analysis
  if (!nameCol || !pointsCol) {
    for (const col of allColumns) {
      if (col === rankCol) continue;

      let stringCount = 0;
      let numericCount = 0;

      for (let i = 0; i < Math.min(sampleRows.length, 10); i++) {
        const val = sampleRows[i][col];
        if (val === undefined || val === null || val === '') continue;

        if (typeof val === 'number') {
          numericCount++;
        } else if (typeof val === 'string') {
          if (/[a-zA-Z\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(val)) {
            stringCount++;
          } else if (/^\d+/.test(val.trim())) {
            numericCount++;
          }
        }
      }

      if (!nameCol && stringCount > numericCount) {
        nameCol = col;
      } else if (!pointsCol && numericCount > stringCount && col !== nameCol) {
        pointsCol = col;
      }
    }
  }

  // Fallback if still empty
  if (!nameCol && allColumns.length > 0) nameCol = allColumns[0];
  if (!pointsCol && allColumns.length > 1) pointsCol = allColumns[1];

  return { nameCol, pointsCol, rankCol, allColumns };
};

/**
 * Extracts structured ParsedDataRow[] given raw rows and column selections.
 */
export const extractRowsFromData = (
  data: Record<string, any>[],
  nameCol: string,
  pointsCol: string,
  rankCol?: string
): ParsedDataRow[] => {
  const result: ParsedDataRow[] = [];

  data.forEach((row, idx) => {
    const rawName = String(row[nameCol] ?? '').trim();
    if (!rawName) return; // Skip empty rows

    const points = parseNumericValue(row[pointsCol]);
    let rank = idx + 1;
    if (rankCol && row[rankCol] !== undefined) {
      const parsedRank = parseInt(String(row[rankCol]).replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsedRank) && parsedRank > 0) {
        rank = parsedRank;
      }
    }

    result.push({
      rank,
      rawName,
      points,
    });
  });

  return result;
};

/**
 * Parses an Excel file (.xlsx, .xls, .csv) into raw JSON objects.
 */
export const parseExcelFile = async (file: File): Promise<{
  rawRows: Record<string, any>[];
  detected: DetectedColumns;
  sheetNames: string[];
}> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    throw new Error('El archivo de Excel no contiene ninguna hoja.');
  }

  // Pick first sheet
  const firstSheet = workbook.Sheets[sheetNames[0]];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('La hoja seleccionada está vacía o no tiene formato de tabla.');
  }

  const detected = detectColumns(rawRows);
  return { rawRows, detected, sheetNames };
};

/**
 * Parses tab-separated or comma-separated clipboard text (copied from Excel/Sheets).
 */
export const parseClipboardTableText = (text: string): {
  rawRows: Record<string, any>[];
  detected: DetectedColumns;
} => {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('El texto pegado está vacío.');
  }

  // Detect delimiter: tab (\t) or comma/semicolon
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('No se encontraron líneas de texto.');
  }

  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && (firstLine.match(/;/g)?.length || 0) >= 1) {
    delimiter = ';';
  } else if (firstLine.includes(',') && (firstLine.match(/,/g)?.length || 0) >= 1) {
    delimiter = ',';
  }

  // Parse lines
  const rows: string[][] = lines.map(line => line.split(delimiter).map(cell => cell.trim()));

  const firstRow = rows[0];
  const hasHeaders = firstRow.some(cell => /[a-zA-Z\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(cell) && isNaN(Number(cell)));

  let headers: string[] = [];
  let dataRows: string[][] = [];

  if (hasHeaders && rows.length > 1) {
    headers = firstRow;
    dataRows = rows.slice(1);
  } else {
    const maxCols = Math.max(...rows.map(r => r.length));
    headers = Array.from({ length: maxCols }, (_, i) => `Columna ${i + 1}`);
    dataRows = rows;
  }

  const rawRows: Record<string, any>[] = dataRows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] ?? '';
    });
    return obj;
  });

  const detected = detectColumns(rawRows);
  return { rawRows, detected };
};

export interface TemplateMember {
  id: string;
  rank: string;
  nickname: string;
  account_type?: string;
  power?: number;
}

/**
 * Generates and triggers download of an Excel template pre-filled with all clan members.
 */
export const downloadExcelTemplate = (
  members: TemplateMember[],
  allianceName: string = 'RESU',
  eventTitle: string = 'General'
) => {
  const data = members.map((m, idx) => ({
    '#': idx + 1,
    'Operativo': m.nickname,
    'Rango': m.rank,
    'Tipo': m.account_type === 'alt' ? 'Secundaria' : 'Principal',
    'Puntos_O_Danio': '',
    'Poder_Actual': m.power || 0,
    'ID_Sistema': m.id,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },   // #
    { wch: 24 },  // Operativo
    { wch: 8 },   // Rango
    { wch: 14 },  // Tipo
    { wch: 18 },  // Puntos_O_Danio
    { wch: 16 },  // Poder_Actual
    { wch: 38 },  // ID_Sistema
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencia');

  const cleanEvent = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Plantilla_${cleanEvent}_${allianceName}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

