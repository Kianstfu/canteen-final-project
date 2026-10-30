import { useEffect, useState } from 'react';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/adminsales.css';

function formatHour(h) {
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  return displayHour + ' ' + period;
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function todayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const mutedStyle = { color: 'var(--muted)' };

export default function AdminSales() {
  usePage('pg-adminsales', 'Canteen admin — sales report');

  const [date, setDate] = useState(todayString);
  const [trendDays, setTrendDays] = useState(7);
  const [exporting, setExporting] = useState(false);

  const [metrics, setMetrics] = useState({ dailyTotal: 'Loading...', orderCount: '—', avgOrder: '—' });
  const [hourly, setHourly] = useState({ status: 'loading', rows: [] });
  const [best, setBest] = useState({ status: 'loading', rows: [] });
  const [trend, setTrend] = useState({ status: 'loading', rows: [] });

  async function loadSales() {
    try {
      const res = await fetch('/api/sales/today?date=' + date);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();

      const total = data.daily_total || 0;
      const orders = data.total_orders || 0;
      const avg = orders > 0 ? (total / orders).toFixed(2) : 0;

      setMetrics({ dailyTotal: '₱' + total, orderCount: orders, avgOrder: '₱' + avg });
    } catch (err) {
      setMetrics((m) => ({ ...m, dailyTotal: 'Error' }));
      console.error(err);
    }
  }

  async function loadHourlySales() {
    try {
      const res = await fetch('/api/sales/by-hour?date=' + date);
      if (!res.ok) throw new Error('Server error');
      const rows = await res.json();
      setHourly({ status: 'ready', rows });
    } catch (err) {
      setHourly({ status: 'error', rows: [] });
      console.error(err);
    }
  }

  async function loadBestSellers() {
    try {
      const res = await fetch('/api/sales/best-sellers?date=' + date);
      if (!res.ok) throw new Error('Server error');
      const rows = await res.json();
      setBest({ status: 'ready', rows });
    } catch (err) {
      setBest({ status: 'error', rows: [] });
      console.error(err);
    }
  }

  function loadAllSalesData() {
    loadSales();
    loadHourlySales();
    loadBestSellers();
  }

  // Unang load + bawat 15 segundo (gamit ang kasalukuyang date sa input)
  usePolling(loadAllSalesData, 15000);

  // Trend chart: naglo-load pagka-mount at tuwing papalitan ang Week/Month
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/sales/trend?days=' + trendDays);
        if (!res.ok) throw new Error('Server error');
        const rows = await res.json();
        if (!cancelled) setTrend({ status: 'ready', rows });
      } catch (err) {
        if (!cancelled) setTrend({ status: 'error', rows: [] });
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, [trendDays]);

  async function downloadExcel() {
    setExporting(true);

    try {
      const res = await fetch('/api/sales/best-sellers-range?days=' + trendDays);
      if (!res.ok) throw new Error('Server error');
      const rows = await res.json();

      if (rows.length === 0) {
        alert('No sales data for this period yet.');
        return;
      }

      const periodLabel = trendDays === 7 ? 'Weekly' : 'Monthly';
      const grandTotal = rows.reduce((sum, r) => sum + r.total_sales, 0);

      // gumawa ng HTML table na maiintindihan ni Excel bilang spreadsheet
      let html = `
      <table border="1">
        <tr><th colspan="3">${periodLabel} Sales Report — last ${trendDays} days</th></tr>
        <tr><th>Item</th><th>Qty Sold</th><th>Total Sales (₱)</th></tr>
    `;
      rows.forEach((r) => {
        html += `<tr><td>${r.item_name}</td><td>${r.qty_sold}</td><td>${r.total_sales}</td></tr>`;
      });
      html += `<tr><td colspan="2"><b>Grand Total</b></td><td><b>${grandTotal}</b></td></tr></table>`;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${periodLabel.toLowerCase()}-${date}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not prepare the Excel file. Please try again.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  // ── Mga chart ──
  let trendChart;
  if (trend.status === 'loading') {
    trendChart = <p className="small" style={mutedStyle}>Loading...</p>;
  } else if (trend.status === 'error') {
    trendChart = <p className="small" style={mutedStyle}>Could not load the trend chart.</p>;
  } else if (trend.rows.length === 0) {
    trendChart = <p className="small" style={mutedStyle}>No sales in this period yet.</p>;
  } else {
    const maxTotal = Math.max(...trend.rows.map((r) => r.total), 1);
    const maxBarHeight = 100;
    const barWidth = trendDays > 14 ? 10 : 24;
    trendChart = trend.rows.map((r) => {
      const heightPx = Math.max(6, Math.round((r.total / maxTotal) * maxBarHeight));
      return (
        <div className="bar-col" key={r.sale_date}>
          {barWidth >= 20 ? <div className="bar-value">{`₱${r.total}`}</div> : null}
          <div className="bar" style={{ height: `${heightPx}px`, width: `${barWidth}px` }}></div>
          <div className="bar-label" style={{ fontSize: barWidth >= 20 ? '0.75rem' : '0.6rem' }}>{formatShortDate(r.sale_date)}</div>
        </div>
      );
    });
  }

  let hourlyChart;
  let peakNote = '';
  if (hourly.status === 'loading') {
    hourlyChart = <p className="small" style={mutedStyle}>Loading...</p>;
  } else if (hourly.status === 'error') {
    hourlyChart = <p className="small" style={mutedStyle}>Could not load the chart.</p>;
  } else if (hourly.rows.length === 0) {
    hourlyChart = <p className="small" style={mutedStyle}>No sales on this date.</p>;
  } else {
    const rows = hourly.rows;
    const maxTotal = Math.max(...rows.map((r) => r.total));
    const maxBarHeight = 150;
    hourlyChart = rows.map((r) => {
      const heightPx = Math.max(20, Math.round((r.total / maxTotal) * maxBarHeight));
      return (
        <div className="bar-col" key={r.hour_of_day}>
          <div className="bar-value">{`₱${r.total}`}</div>
          <div className="bar" style={{ height: `${heightPx}px`, width: '28px' }}></div>
          <div className="bar-label">{formatHour(r.hour_of_day)}</div>
        </div>
      );
    });
    const peak = rows.reduce((max, r) => (r.total > max.total ? r : max), rows[0]);
    peakNote = `${formatHour(peak.hour_of_day)} was the peak hour on this date — consider extra staff or pre-prepped stock around that time.`;
  }

  let bestRows;
  if (best.status === 'loading') {
    bestRows = <tr><td colSpan="3" className="text-center py-4" style={mutedStyle}>Loading...</td></tr>;
  } else if (best.status === 'error') {
    bestRows = <tr><td colSpan="3" className="text-center py-4" style={mutedStyle}>Could not load best sellers.</td></tr>;
  } else if (best.rows.length === 0) {
    bestRows = <tr><td colSpan="3" className="text-center py-4" style={mutedStyle}>No orders placed on this date.</td></tr>;
  } else {
    bestRows = best.rows.map((r) => (
      <tr key={r.item_name}><td>{r.item_name}</td><td>{r.qty_sold}</td><td>{`₱${r.total_sales}`}</td></tr>
    ));
  }

  return (
    <div className="d-flex">
      <AdminSidebar active="sales" logoutTo="/admin/login" />

      <div className="flex-grow-1 p-4">
        <h2 className="font-display mb-3">Sales report</h2>

        <div className="d-flex align-items-center gap-2 mb-4">
          <label className="small" style={mutedStyle}>Showing sales for:</label>
          <input type="date" id="salesDate" className="form-control form-control-date" style={{ width: 'auto' }}
            value={date} onChange={(e) => setDate(e.target.value)} />
          <button id="viewDateBtn" className="btn btn-teal" onClick={loadAllSalesData}>View</button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card-dark metric-card highlight p-3">
              <div className="small text-uppercase fw-semibold metric-label" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>Total sales today</div>
              <div className="metric-num" id="dailyTotal">{metrics.dailyTotal}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-dark metric-card p-3">
              <div className="small text-uppercase fw-semibold" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>Orders completed</div>
              <div className="metric-num" id="orderCount">{metrics.orderCount}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-dark metric-card p-3">
              <div className="small text-uppercase fw-semibold" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>Average order value</div>
              <div className="metric-num" id="avgOrder">{metrics.avgOrder}</div>
            </div>
          </div>
        </div>

        <div className="card-dark p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fs-6 mb-0">Sales trend</h3>
            <div className="d-flex gap-2 align-items-center">
              <div className="btn-group btn-group-sm" role="group">
                <button className={`btn btn-outline-secondary trend-btn${trendDays === 7 ? ' active' : ''}`} onClick={() => setTrendDays(7)}>Week</button>
                <button className={`btn btn-outline-secondary trend-btn${trendDays === 30 ? ' active' : ''}`} onClick={() => setTrendDays(30)}>Month</button>
              </div>
              <button className="btn btn-sm btn-teal" id="exportExcelBtn" onClick={downloadExcel} disabled={exporting}>
                {exporting ? 'Preparing...' : '⬇ Download Excel'}
              </button>
            </div>
          </div>
          <div className="bar-chart" id="trendChart" style={{ height: '140px' }}>{trendChart}</div>
          <p className="small mt-2 mb-0" style={mutedStyle}>
            The Excel download covers whichever period is selected above (Week or Month), not just a single day.
          </p>
        </div>

        <div className="card-dark p-3 mb-3">
          <h3 className="fs-6 mb-3">Sales by hour</h3>
          <div className="bar-chart" id="hourlyChart">{hourlyChart}</div>
          <p className="small mt-3 mb-0" style={mutedStyle} id="peakHourNote">{peakNote}</p>
        </div>

        <div className="card-dark p-3">
          <h3 className="fs-6 mb-3">Best sellers today</h3>
          <table className="table table-dark-custom mb-0">
            <thead><tr><th>Item</th><th>Qty sold</th><th>Total sales</th></tr></thead>
            <tbody id="bestSellersBody">{bestRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
