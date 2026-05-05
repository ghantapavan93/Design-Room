import { MaterialPreset, DesignVersion } from '../../lib/types';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';

interface LineItem {
    region: string;
    label: string;
    materialName: string;
    brand: string;
    costBand: string;
    swatchHex: string;
    quantity: string;
    estimatedCost: number;
}

function buildLineItems(
    currentState: Record<string, string>,
    presetsMap: Record<string, MaterialPreset>,
    elements: any[] = []
): LineItem[] {
    const mappedState: Record<string, string> = {};
    const originalKeys: Record<string, string> = {};
    for (const [k, v] of Object.entries(currentState)) {
        const el = elements.find(e => String(e.id) === String(k));
        const mKey = el ? el.maskUrl.replace('.png', '') : k;
        mappedState[mKey] = v;
        originalKeys[mKey] = k;
    }

    const res = computeEstimate(mappedState, presetsMap, MOCK_MEASUREMENTS);
    return res.items.map(i => {
        const originalId = originalKeys[i.region] || i.region;
        const el = elements.find(e => String(e.id) === String(originalId));
        return {
            region: originalId,
            label: el ? el.label : i.region.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            materialName: presetsMap[i.presetId]?.name || '',
            brand: presetsMap[i.presetId]?.brand || '',
            costBand: presetsMap[i.presetId]?.costBand || '$',
            swatchHex: presetsMap[i.presetId]?.swatchHex || '#000',
            quantity: `${i.qty.toLocaleString()} ${i.unit}`,
            estimatedCost: i.cost,
        };
    });
}

export function generateProposalHTML({
    designTitle,
    currentState,
    presetsMap,
    versions,
    statusChip,
    lockedRegions = [],
    regionComments = [],
    elements = []
}: {
    designTitle: string;
    currentState: Record<string, string>;
    presetsMap: Record<string, MaterialPreset>;
    versions: DesignVersion[];
    statusChip: string;
    lockedRegions?: string[];
    regionComments?: { region: string; body: string; authorName: string }[];
    elements?: any[];
}) {
    const lineItems = buildLineItems(currentState, presetsMap, elements || []);
    const totalEstimate = lineItems.reduce((s, i) => s + i.estimatedCost, 0);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const demoKeyToSource: Record<string, { source: string; confidence: string }> = {
        'Coastal Estate': { source: 'LIDAR Scan', confidence: 'High' },
        'Craftsman Mod': { source: 'Uploaded', confidence: 'Medium' },
        'Blank Canvas': { source: 'Demo', confidence: 'Low' },
    };
    const { source, confidence } = demoKeyToSource[designTitle] || { source: 'Auto', confidence: 'Medium' };

    const materialsRows = lineItems.map(item => `
        <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:24px;height:24px;border-radius:6px;background:${item.swatchHex};border:1px solid #d1d5db;flex-shrink:0;"></div>
                    <div>
                        <div style="font-weight:600;font-size:13px;color:#111;">${item.materialName}</div>
                        <div style="font-size:11px;color:#6b7280;">${item.brand}</div>
                    </div>
                </div>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">${item.label}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;text-align:center;">
                <span style="background:#f0fdf4;color:#166534;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">${item.costBand}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;font-family:monospace;">${item.quantity}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111;text-align:right;">$${Math.round(item.estimatedCost).toLocaleString()}</td>
        </tr>
    `).join('');

    // Options comparison (if saved versions exist)
    let optionsSection = '';
    if (versions.length > 0) {
        const optionRows = versions.map(v => {
            const vState = (v.snapshotStateJson || {}) as Record<string, string>;
            const mappedVState: Record<string, string> = {};
            for (const [k, val] of Object.entries(vState)) {
                const el = (elements || []).find((e: any) => String(e.id) === String(k));
                const mKey = el ? el.maskUrl.replace('.png', '') : k;
                mappedVState[mKey] = val;
            }
            const est = computeEstimate(mappedVState, presetsMap, MOCK_MEASUREMENTS).total;
            const materialCount = Object.keys(vState).length;
            return `
                <tr>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:13px;color:#111;">${v.label}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${v.createdBy}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">${materialCount} regions</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111;text-align:right;">$${Math.round(est).toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        optionsSection = `
            <div style="margin-top:32px;">
                <h2 style="font-size:16px;font-weight:700;color:#111;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #111;">
                    📋 Saved Options Comparison
                </h2>
                <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                    <thead>
                        <tr style="background:#f9fafb;">
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Option</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Created By</th>
                            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Regions</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Est. Total</th>
                        </tr>
                    </thead>
                    <tbody>${optionRows}</tbody>
                </table>
            </div>
        `;
    }

    let decisionSection = '';
    if (lockedRegions.length > 0 || regionComments.length > 0) {
        const lockedRows = lockedRegions.map(region => {
            const el = (elements || []).find((e: any) => String(e.id) === String(region));
            const regionLabel = el ? el.label : region.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `
                <tr>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:13px;color:#111;text-transform:capitalize;">${regionLabel}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:right;">Finalized</td>
                </tr>
            `;
        }).join('');

        const commentList = regionComments.map(c => {
            const el = (elements || []).find((e: any) => String(e.id) === String(c.region));
            const regionLabel = el ? el.label : c.region.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `
            <div style="margin-bottom:12px;padding:12px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
                <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;margin-bottom:4px;">${regionLabel}</div>
                <div style="font-size:13px;color:#111;">"${c.body}"</div>
                <div style="font-size:11px;color:#6b7280;margin-top:6px;">— ${c.authorName}</div>
            </div>
        `;
        }).join('');

        decisionSection = `
            <div style="margin-top:32px;page-break-inside:avoid;">
                <h2 style="font-size:16px;font-weight:700;color:#111;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #111;">
                    🔒 Decision Summary
                </h2>
                ${lockedRegions.length > 0 ? `
                <div style="margin-bottom:20px;">
                    <h3 style="font-size:13px;font-weight:700;color:#374151;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">Finalized Scope</h3>
                    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                        <tbody>${lockedRows}</tbody>
                    </table>
                </div>
                ` : ''}
                ${regionComments.length > 0 ? `
                <div>
                    <h3 style="font-size:13px;font-weight:700;color:#374151;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">Key Notes</h3>
                    ${commentList}
                </div>
                ` : ''}
            </div>
        `;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal — ${designTitle}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #111; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            @page { margin: 0.6in; size: letter; }
        }
    </style>
</head>
<body>
    <!-- Print Hint Banner -->
    <div class="no-print" style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#94a3b8;padding:12px 24px;font-size:13px;display:flex;align-items:center;justify-content:between;gap:16px;">
        <span>💡 Use <strong style="color:#e2e8f0;">Ctrl + P</strong> (or ⌘P) to save this page as a PDF.</span>
    </div>

    <div style="max-width:760px;margin:0 auto;padding:40px 24px 60px;">

        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #111;">
            <div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                    <div style="width:28px;height:28px;background:#111;border-radius:6px;display:flex;align-items:center;justify-content:center;">
                        <span style="color:#fff;font-weight:800;font-size:14px;">DR</span>
                    </div>
                    <span style="font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Design Room</span>
                </div>
                <h1 style="font-size:26px;font-weight:800;color:#111;margin-top:8px;">${designTitle}</h1>
                <p style="font-size:13px;color:#6b7280;margin-top:4px;">Proposal generated on ${dateStr}</p>
            </div>
            <div style="text-align:right;">
                <span style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;
                    background:${statusChip === 'Approved' ? '#dcfce7' : statusChip === 'In Review' ? '#fef3c7' : '#f3f4f6'};
                    color:${statusChip === 'Approved' ? '#166534' : statusChip === 'In Review' ? '#92400e' : '#6b7280'};">
                    ${statusChip}
                </span>
                <div style="font-size:11px;color:#9ca3af;margin-top:6px;">Measurements: ${source} (${confidence} Confidence)</div>
            </div>
        </div>

        <!-- Materials & Takeoff Table (Highlighted Selection) -->
        <div style="background:#f8fafc;border:2px solid #3b82f6;border-radius:12px;padding:24px;margin-bottom:32px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
                <span style="background:#eff6ff;color:#2563eb;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">⭐ Selected Design</span>
                <h2 style="font-size:18px;font-weight:800;color:#111;">Materials & Takeoff</h2>
            </div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#fff;">
            <thead>
                <tr style="background:#f9fafb;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Material</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Region</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Cost</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Estimate</th>
                </tr>
            </thead>
            <tbody>
                ${materialsRows}
            </tbody>
            <tfoot>
                <tr style="background:#f9fafb;">
                    <td colspan="4" style="padding:12px;font-size:14px;font-weight:700;color:#111;text-align:right;">Grand Total (Material & Labor)</td>
                    <td style="padding:12px;font-size:18px;font-weight:800;color:#111;text-align:right;">$${Math.round(totalEstimate).toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>

        <div style="margin-top:16px;padding:12px 16px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
            <p style="font-size:11px;color:#1d4ed8;font-weight:600;line-height:1.5;">ℹ️ Estimates include material and standard labor rates. Actual costs may vary based on site conditions, contractor rates, and regional pricing.</p>
        </div>
        </div>

        ${optionsSection}
        ${decisionSection}

        <!-- Signature Block -->
        <div style="margin-top:48px;display:flex;justify-content:space-between;gap:60px;page-break-inside:avoid;">
            <div style="flex:1;">
                <div style="border-bottom:2px solid #111;height:50px;margin-bottom:12px;"></div>
                <p style="font-size:12px;color:#111;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Homeowner Signature</p>
                <p style="font-size:11px;color:#9ca3af;margin-top:6px;">Date</p>
            </div>
            <div style="flex:1;">
                <div style="border-bottom:2px solid #111;height:50px;margin-bottom:12px;"></div>
                <p style="font-size:12px;color:#111;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Contractor Signature</p>
                <p style="font-size:11px;color:#9ca3af;margin-top:6px;">Date</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:16px;height:16px;background:#111;border-radius:4px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#fff;font-weight:800;font-size:8px;">DR</span>
                </div>
                <p style="font-size:11px;color:#6b7280;font-weight:500;">Generated by Design Room · Not a binding contract</p>
            </div>
            <p style="font-size:11px;color:#6b7280;font-weight:600;">${dateStr}</p>
        </div>
    </div>
</body>
</html>`;

    return html;
}

export function openProposalInNewTab(params: Parameters<typeof generateProposalHTML>[0]) {
    const html = generateProposalHTML(params);
    const newTab = window.open('', '_blank');
    if (newTab) {
        newTab.document.write(html);
        newTab.document.close();
    }
}
