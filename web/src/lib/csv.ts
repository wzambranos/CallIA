export type CsvRow = Record<string, string>;

const aliases: Record<string, string[]> = {
  nombre: ["nombre", "name", "cliente"],
  cedula: ["cedula", "documento", "id"],
  edad: ["edad"],
  genero: ["genero", "sexo"],
  metodo_pago: ["metodo_pago", "pago", "metodo"],
  ciudad: ["ciudad"],
  telefono: ["telefono", "celular", "phone"],
  email: ["email", "correo"],
  negocio: ["negocio", "empresa"],
};

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]).map(normalize);
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });
    return row;
  });
  return { headers, rows };
}

export function pick(row: CsvRow, field: keyof typeof aliases) {
  for (const alias of aliases[field]) {
    if (row[alias]) return row[alias];
  }
  return "";
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}
