/**
 * firebase-mock.js
 * 
 * Playwright helper: injects a lightweight in-memory Firebase mock into
 * the browser page so that E2E tests can run without a live Firebase
 * project.
 *
 * Key mechanism:
 *   1. Intercepts firebase-config.js at the NETWORK level so the browser
 *      never downloads the real Firebase SDK from CDN (eliminates latency).
 *   2. Injects window.fb via addInitScript before any page script runs.
 *   3. Auto-dismisses prompt() dialogs (Outlet ID) for test stability.
 *
 * Usage:
 *   import { injectFirebaseMock } from './firebase-mock.js';
 *   await injectFirebaseMock(page, { outletId: 'outlet-a' });
 *   await page.goto('/index.html');
 */

/**
 * @param {import('@playwright/test').Page} page
 * @param {object} opts
 * @param {string} [opts.outletId='test-outlet']
 * @param {object} [opts.initialData={}]  Pre-seed:
 *   { settings: {...}, staff: [...], transactions: [...], history: {...} }
 */
export async function injectFirebaseMock(page, opts = {}) {
    const outletId = opts.outletId || 'test-outlet';
    const initialData = opts.initialData || {};

    // ── 1. Intercept firebase-config.js → return an empty module ──
    // This prevents the browser from fetching the real Firebase SDK from CDN.
    await page.route('**/firebase-config.js', route => {
        route.fulfill({
            contentType: 'application/javascript',
            body: '// Firebase config intercepted by test mock',
        });
    });

    // ── 2. Forward browser logs to terminal for debugging ──
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Waiting for Firebase') || text.includes('Error') || text.includes('init')) {
            console.log(`[BROWSER] ${text}`);
        }
    });

    // ── 3. Auto-dismiss prompt/alert dialogs (Outlet ID prompt, error alerts) ──
    page.on('dialog', async dialog => {
        if (dialog.type() === 'prompt') {
            await dialog.accept(outletId);
        } else {
            await dialog.accept();
        }
    });

    // ── 3. Inject the in-memory mock BEFORE any page script runs ──
    await page.addInitScript(
        ({ outletId, initialData }) => {
            // ──── Flat In-Memory Store ────
            const store = {};

            function storeKey(path) { return path.join('/'); }

            function getAtPath(pathParts) {
                return store[storeKey(pathParts)] || null;
            }

            function setAtPath(pathParts, data) {
                store[storeKey(pathParts)] = JSON.parse(JSON.stringify(data));
                fireDocListeners(storeKey(pathParts));
            }

            // ──── Listeners ────
            const docListeners = {};
            const colListeners = {};

            function fireDocListeners(key) {
                (docListeners[key] || []).forEach(fn => {
                    const val = store[key];
                    fn({
                        exists: () => val != null,
                        data: () => (val ? JSON.parse(JSON.stringify(val)) : null),
                        id: key.split('/').pop()
                    });
                });
            }

            function fireCollectionListeners(colPathParts, queryObj = {}) {
                const key = storeKey(colPathParts);
                (colListeners[key] || []).forEach(({ callback, q }) => {
                    const prefix = key + '/';
                    let docs = Object.entries(store)
                        .filter(([k]) => k.startsWith(prefix) && k.split('/').length === colPathParts.length + 1)
                        .map(([k, v]) => ({
                            id: k.split('/').pop(),
                            data: () => JSON.parse(JSON.stringify(v)),
                            exists: () => true
                        }));
                    
                    // Simple orderBy implementation
                    const constraints = q._constraints || [];
                    const orderByConstraint = constraints.find(c => c.type === 'orderBy');
                    if (orderByConstraint) {
                        const { field, direction } = orderByConstraint;
                        docs.sort((a, b) => {
                            const valA = a.data()[field];
                            const valB = b.data()[field];
                            if (valA < valB) return direction === 'asc' ? -1 : 1;
                            if (valA > valB) return direction === 'asc' ? 1 : -1;
                            return 0;
                        });
                    }

                    callback({
                        docs,
                        forEach: (fn2) => docs.forEach(fn2),
                        size: docs.length
                    });
                });
            }

            // ──── Pre-seed data ────
            // Outlet settings document
            setAtPath(['outlets', outletId], {
                settings: initialData.settings || { name: 'CHILL aSTD POS', logo: '' },
                categories: initialData.categories || ['Accommodation', 'F&B Sales', 'Supplies', 'Maintenance'],
                roles: initialData.roles || ['Receptionist', 'Manager', 'Staff', 'Security'],
                createdAt: new Date().toISOString()
            });

            // Staff
            const staffList = initialData.staff || [
                { name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' }
            ];
            staffList.forEach((s, i) => {
                const docId = s.id || ('staff_' + i);
                setAtPath(['outlets', outletId, 'staff', docId], { ...s, id: docId });
            });

            // Transactions
            (initialData.transactions || []).forEach((t, i) => {
                const docId = t.id ? String(t.id) : ('trx_' + i);
                setAtPath(['outlets', outletId, 'transactions', docId], { ...t, id: docId });
            });

            // History
            Object.entries(initialData.history || {}).forEach(([id, shift]) => {
                setAtPath(['outlets', outletId, 'history', id], shift);
            });

            // ──── Mock Firestore API ────
            const mockDb = { _type: 'mock-db' };

            function doc(db, ...pathParts) {
                return { _path: pathParts };
            }

            function collection(db, ...pathParts) {
                return { _colPath: pathParts };
            }

            async function getDoc(ref) {
                const val = getAtPath(ref._path);
                return {
                    exists: () => val != null,
                    data: () => (val ? JSON.parse(JSON.stringify(val)) : null),
                    id: ref._path[ref._path.length - 1]
                };
            }

            async function getDocs(q) {
                const colPath = q._colPath || q._path;
                const prefix = storeKey(colPath) + '/';
                const docs = Object.entries(store)
                    .filter(([k]) => k.startsWith(prefix) && k.split('/').length === colPath.length + 1)
                    .map(([k, v]) => ({
                        id: k.split('/').pop(),
                        data: () => JSON.parse(JSON.stringify(v)),
                        exists: () => true
                    }));
                return { docs, forEach: (fn) => docs.forEach(fn), size: docs.length };
            }

            async function setDoc(ref, data, opts2) {
                if (opts2 && opts2.merge) {
                    const existing = getAtPath(ref._path) || {};
                    setAtPath(ref._path, { ...existing, ...data });
                } else {
                    setAtPath(ref._path, data);
                }
                fireCollectionListeners(ref._path.slice(0, -1));
            }

            async function updateDoc(ref, data) {
                const existing = getAtPath(ref._path) || {};
                setAtPath(ref._path, { ...existing, ...data });
                fireCollectionListeners(ref._path.slice(0, -1));
            }

            async function addDoc(colRef, data) {
                const id = 'auto_' + Date.now() + '_' + Math.random().toString(36).slice(2);
                const path = [...colRef._colPath, id];
                setAtPath(path, { ...data, id });
                fireCollectionListeners(colRef._colPath);
                return { id };
            }

            async function deleteDoc(ref) {
                const key = storeKey(ref._path);
                delete store[key];
                fireDocListeners(key);
                fireCollectionListeners(ref._path.slice(0, -1));
            }

            function onSnapshot(refOrQuery, callback) {
                const q = refOrQuery._colPath ? refOrQuery : { _path: refOrQuery._path };
                if (q._path) {
                    // Document listener
                    const key = storeKey(q._path);
                    if (!docListeners[key]) docListeners[key] = [];
                    docListeners[key].push(callback);
                    // Fire immediately with current value
                    const val = store[key];
                    callback({
                        exists: () => val != null,
                        data: () => (val ? JSON.parse(JSON.stringify(val)) : null),
                        id: key.split('/').pop()
                    });
                } else if (q._colPath) {
                    // Collection / query listener
                    const key = storeKey(q._colPath);
                    if (!colListeners[key]) colListeners[key] = [];
                    colListeners[key].push({ callback, q });
                    // Fire immediately
                    fireCollectionListeners(q._colPath);
                }
                return () => {}; // unsubscribe
            }

            function query(colRef, ...constraints) {
                return { _colPath: colRef._colPath, _constraints: constraints };
            }

            function orderBy(field, direction = 'asc') {
                return { type: 'orderBy', field, direction };
            }
            function where() { return { type: 'where' }; }
            function limit() { return { type: 'limit' }; }

            function writeBatch() {
                const ops = [];
                return {
                    delete: (ref) => ops.push({ type: 'delete', ref }),
                    set: (ref, data) => ops.push({ type: 'set', ref, data }),
                    commit: async () => {
                        for (const op of ops) {
                            if (op.type === 'delete') {
                                delete store[storeKey(op.ref._path)];
                            } else if (op.type === 'set') {
                                setAtPath(op.ref._path, op.data);
                            }
                        }
                        // Fire all collection listeners that might be affected
                        const affectedCols = new Set();
                        for (const op of ops) {
                            affectedCols.add(storeKey(op.ref._path.slice(0, -1)));
                        }
                        for (const col of affectedCols) {
                            const parts = col.split('/');
                            fireCollectionListeners(parts);
                        }
                    }
                };
            }

            // ──── Expose as window.fb ────
            window.fb = {
                db: mockDb,
                auth: { currentUser: null },
                collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc,
                query, where, orderBy, limit, onSnapshot, writeBatch,
                onAuthStateChanged: (auth, cb) => cb(null),
                signInWithEmailAndPassword: async () => {},
                signOut: async () => {}
            };

            // Debug: expose store
            window.__fbMockStore__ = store;

            // ──── Clear any residual state, then set outlet ID ────
            localStorage.clear();
            localStorage.setItem('pos_outlet_id', outletId);
        },
        { outletId, initialData }
    );
}
