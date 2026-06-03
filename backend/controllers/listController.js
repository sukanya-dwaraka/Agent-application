/**
 * controllers/listController.js
 * Fixed: agent query, phone number coercion, CSV parsing robustness
 */

const XLSX        = require('xlsx');
const path        = require('path');
const Agent       = require('../models/Agent');
const UploadBatch = require('../models/TaskList');

// ─── Parse file → raw 2D array ────────────────────────────────────────────────
const parseFile = (filePath) => {
  const workbook = XLSX.readFile(filePath, { cellText: false, cellDates: true });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  // raw:true keeps numbers as numbers (not converted to strings weirdly)
  const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  return rows;
};

// ─── Validate + normalise rows → clean item array ────────────────────────────
const normaliseRows = (rawRows) => {
  // Filter out completely empty rows first
  const nonEmpty = rawRows.filter(row =>
    Array.isArray(row) && row.some(cell => String(cell).trim() !== '')
  );

  if (nonEmpty.length < 2) {
    throw new Error('File is empty or has no data rows');
  }

  // Header row — lowercase + trim
  const headers = nonEmpty[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, ''));

  console.log('Detected headers:', headers); // debug

  // Accept common variations: firstname / first_name / first name
  const findCol = (variants) => {
    for (const v of variants) {
      const idx = headers.indexOf(v);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const fnIdx    = findCol(['firstname', 'first_name', 'first name', 'name']);
  const phoneIdx = findCol(['phone', 'phonenumber', 'phone_number', 'mobile', 'contact']);
  const notesIdx = findCol(['notes', 'note', 'remarks', 'comments', 'description']);

  const missingCols = [];
  if (fnIdx    === -1) missingCols.push('FirstName');
  if (phoneIdx === -1) missingCols.push('Phone');
  if (notesIdx === -1) missingCols.push('Notes');

  if (missingCols.length > 0) {
    throw new Error(
      `Missing required columns: ${missingCols.join(', ')}. ` +
      `Found columns: ${headers.join(', ')}`
    );
  }

  const items = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const row = nonEmpty[i];

    const firstName = String(row[fnIdx]    ?? '').trim();
    // Phone may come as a float from Excel (e.g. 9876543210.0) — strip decimals
    const rawPhone  = String(row[phoneIdx] ?? '').trim();
    const phone     = rawPhone.replace(/\.0+$/, '').replace(/\D/g, ''); // keep digits only
    const notes     = String(row[notesIdx] ?? '').trim();

    // Skip rows where both name and phone are empty (truly blank rows)
    if (!firstName && !phone) continue;

    if (!firstName) throw new Error(`Row ${i + 1}: FirstName is empty`);
    if (!phone)     throw new Error(`Row ${i + 1}: Phone is empty`);
    if (phone.length < 7 || phone.length > 15) {
      throw new Error(`Row ${i + 1}: Phone "${phone}" must be 7–15 digits`);
    }

    items.push({ firstName, phone, notes });
  }

  if (items.length === 0) throw new Error('No valid data rows found in file');

  return items;
};

// ─── Round-robin distribution ─────────────────────────────────────────────────
const distributeRoundRobin = (items, agents) => {
  const buckets = agents.map(agent => ({
    agent: agent._id,
    items: [],
    count: 0,
  }));

  items.forEach((item, idx) => {
    const slot = idx % agents.length;
    buckets[slot].items.push(item);
    buckets[slot].count++;
  });

  return buckets;
};

// ─── POST /api/lists/upload ───────────────────────────────────────────────────
exports.uploadAndDistribute = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    // 1. Parse
    const rawRows = parseFile(req.file.path);
    console.log(`Parsed ${rawRows.length} raw rows`);

    // 2. Validate
    const items = normaliseRows(rawRows);
    console.log(`Valid items: ${items.length}`);

    // 3. Fetch ALL agents (remove createdBy filter so it works regardless)
    //    If you want per-admin isolation, keep the filter — but ensure agents
    //    were created with the same admin account that is uploading.
    const agents = await Agent.find();
    console.log(`Agents found: ${agents.length}`);

    if (agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No agents found. Please add agents before uploading.',
      });
    }

    // 4. Distribute
    const distributions = distributeRoundRobin(items, agents);

    // 5. Save
    const batch = await UploadBatch.create({
      uploadedBy:   req.user._id,
      originalFile: req.file.originalname,
      totalItems:   items.length,
      distributions,
    });

    // 6. Populate + respond
    const populated = await UploadBatch.findById(batch._id)
      .populate('distributions.agent', 'name email mobile');

    res.status(201).json({
      success: true,
      message: `Distributed ${items.length} items across ${agents.length} agents`,
      batch: populated,
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET /api/lists ───────────────────────────────────────────────────────────
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await UploadBatch.find({ uploadedBy: req.user._id })
      .populate('distributions.agent', 'name email mobile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: batches.length, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/lists/:id ───────────────────────────────────────────────────────
exports.getBatch = async (req, res) => {
  try {
    const batch = await UploadBatch.findById(req.params.id)
      .populate('distributions.agent', 'name email mobile');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    res.json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/lists/:id ────────────────────────────────────────────────────
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await UploadBatch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};