"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const index_1 = require("../src/index");
async function handler(req, res) {
    try {
        await (0, index_1.runAgent)();
        res.status(200).json({ ok: true });
    }
    catch (err) {
        console.error('Cron error', err);
        res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
}
//# sourceMappingURL=cron.js.map