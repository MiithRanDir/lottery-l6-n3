// ponytail: proxy บางๆ กัน CORS + cache 30 นาที, GLO ดับก็ตอบ fallback
export default async function handler(req, res) {
  try {
    const r = await fetch('https://www.glo.or.th/api/lottery/getLatestLottery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    });
    if (!r.ok) throw new Error('GLO ' + r.status);
    const j = await r.json();
    const d = j.response || {};
    const out = {
      date: d.displayDate ? `${d.displayDate.date}/${d.displayDate.month}/${d.displayDate.year}` : d.date,
      first: d.data?.first?.number?.[0]?.value || null,
      near1: (d.data?.near1?.number || []).map(x => x.value),
      last2: d.data?.last2?.number?.[0]?.value || null,
      last3f: (d.data?.last3f?.number || []).map(x => x.value),
      last3b: (d.data?.last3b?.number || []).map(x => x.value),
      n3: {
        straight3: d.n3?.straight3?.number?.map(x => x.value) || d.data?.n3?.straight3?.number?.map(x => x.value) || [],
        shuffle3: (d.n3?.shuffle3?.number || []).map(x => x.value),
        straight2: d.n3?.straight2?.number?.[0]?.value || null
      },
      youtube_url: d.youtube_url || null, pdf_url: d.pdf_url || null
    };
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=600');
    res.status(200).json(out);
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({ fallback: true, message: 'ดูผลล่าสุดในแอปเป๋าตังก่อน ระบบกำลังอัปเดต' });
  }
}
