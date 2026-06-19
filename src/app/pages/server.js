/**
 * Backward-compatible entry point for local development.
 * Prefer: npm run dev:api  (from project root)
 */
import app from '../../../index.js';

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SERVER] Backend berjalan di http://localhost:${PORT}`);
  console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
});
