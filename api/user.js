// api/user.js
// Server-side user database + login endpoint
// Passwords NEVER leave the server — only { name, grade } is returned.

const userDatabase = [
  { user: "linda thwala",         pass: "mehlwane13", name: "Linda",          grade: "Grade 9-E" },
  { user: "angel mabunda",        pass: "mehlwane14", name: "Angel",          grade: "Grade 9-D" },
  { user: "iviwe mbhele",         pass: "mehlwane15", name: "Iviwe",          grade: "Grade 9-E" },
  { user: "katlego manyike",      pass: "mehlwane16", name: "Katlego",        grade: "Grade 9-C" },
  { user: "katlego mloi",         pass: "mehlwane17", name: "Katlego",        grade: "Grade 9-B" },
  { user: "bayanda ngobese",      pass: "mehlwane18", name: "Bayanda",        grade: "Grade 9-B" },
  { user: "ayanda mahlangu",      pass: "mehlwane11", name: "Ayanda",         grade: "Grade 9-C" },
  { user: "mhleli mbuyazi",       pass: "mehlwane01", name: "Mhleli Mbuyazi", grade: "Grade 9-C" },
  { user: "snethemba mogashwa",   pass: "mehlwane02", name: "Sne",            grade: "Grade 9-C" },
  { user: "hlelolwethu moela",    pass: "mehlwane03", name: "Lwethu",         grade: "Grade 9-C" },
  { user: "bandile mpongose",     pass: "mehlwane04", name: "Bandile",        grade: "Grade 9-A" },
  { user: "given marrengue",      pass: "mehlwane05", name: "Given",          grade: "Grade 9-E" },
  { user: "mangaliso nkosi",      pass: "mehlwane06", name: "Zagaria",        grade: "Grade 9-C" },
  { user: "thandekile maseko",    pass: "mehlwane07", name: "Pearl",          grade: "Grade 9-A" },
  { user: "scelokuhle mahlangu",  pass: "mehlwane08", name: "Scelo",          grade: "Grade 9-B" },
  { user: "scelokuhle ndlovu",    pass: "mehlwane09", name: "Scelokuhle",     grade: "Grade 9-C" },
  { user: "bonginkosi mahungela", pass: "mehlwane10", name: "Bonginkosi",     grade: "Grade 9-C" }
];

export default function handler(req, res) {
  // -------- CORS headers (allows the frontend to call this API) --------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // -------- Preflight request --------
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // -------- Only POST allowed --------
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // -------- Read credentials from request body --------
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const cleanUser = String(username).trim().toLowerCase();

  // -------- Look up user in server-side database --------
  const found = userDatabase.find(
    (u) => u.user.toLowerCase() === cleanUser && u.pass === password
  );

  if (!found) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // -------- Success: return only safe fields (NEVER send the password) --------
  return res.status(200).json({
    name: found.name,
    grade: found.grade
  });
}
