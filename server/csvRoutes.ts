import type { Express, Request, Response } from 'express';
import type Database from 'better-sqlite3';
import { csvTemplate, exportProspectsCsv, importProspectsCsv } from './csvEngine.ts';

export function registerCsvRoutes(app: Express, db: Database.Database) {
  app.get('/api/csv/template', (_req, res) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="courtside_non_ncaa_template.csv"');
    res.send(csvTemplate());
  });

  app.get('/api/csv/export', (_req, res) => {
    const csv = exportProspectsCsv(db);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="courtside_players_${stamp}.csv"`);
    res.send(csv);
  });

  app.post('/api/csv/import', (req: Request, res: Response) => {
    const csv = typeof req.body === 'string'
      ? req.body
      : typeof req.body?.csv === 'string'
        ? req.body.csv
        : '';
    if (!csv.trim()) {
      res.status(400).json({ error: 'CSV content is required.' });
      return;
    }
    try {
      const summary = importProspectsCsv(db, csv);
      db.prepare(`
        INSERT INTO sync_logs (id, provider, endpoint, status, message, records_synced, synced_at)
        VALUES (?, 'csv', '/api/csv/import', ?, ?, ?, ?)
      `).run(
        `sync-${Date.now()}`,
        summary.errors.length > 0 && summary.created + summary.updated === 0 ? 'error' : 'success',
        `Created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}.`,
        summary.created + summary.updated,
        new Date().toISOString()
      );
      res.json(summary);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CSV import failed';
      res.status(500).json({ error: message });
    }
  });
}
