import {

  LineChart
} from 'lucide-react';

export default function StockTrend(){
    return(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
            {/* Stock Trends Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                <h3 className="font-semibold text-slate-900 text-base">Stock Trends</h3>
                <p className="text-xs text-slate-400">Ingredient inflow vs. kitchen outflow · last 7 days</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00a878]" />
                    <span className="text-slate-600">Inflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Outflow</span>
                </div>
                </div>
            </div>

            {/* Custom SVG Line Chart Representation */}
            <div className="h-48 w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                {/* Background Grid Lines */}
                {[0, 30, 60, 90, 120].map((y) => (
                    <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="500"
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    />
                ))}

                {/* Inflow Line (Green) */}
                <path
                    d="M 10,130 Q 80,60 150,90 T 290,10 T 430,90 T 500,60"
                    fill="none"
                    stroke="#00a878"
                    strokeWidth="2.5"
                />
                {/* Outflow Line (Blue) */}
                <path
                    d="M 10,90 Q 80,120 150,50 T 290,70 T 430,30 T 500,90"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                />

                {/* Data Points */}
                <circle cx="10" cy="130" r="4" fill="#00a878" />
                <circle cx="10" cy="90" r="4" fill="#3b82f6" />
                <circle cx="150" cy="90" r="4" fill="#00a878" />
                <circle cx="150" cy="50" r="4" fill="#3b82f6" />
                <circle cx="290" cy="10" r="4" fill="#00a878" />
                <circle cx="430" cy="90" r="4" fill="#00a878" />
                <circle cx="500" cy="60" r="4" fill="#00a878" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
                </div>
            </div>
            </div>

            {/* Prep Horizon */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
            <div>
                <h3 className="font-semibold text-slate-900 text-base">Prep Horizon</h3>
                <p className="text-xs text-slate-400">Forecast consumption rate.</p>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-2">
                <span>Today</span>
                <span className="text-[#00a878] font-bold">Fri 29</span>
                <span>Sunday</span>
                </div>

                {/* Slider / Range Indicator */}
                <div className="relative w-full bg-slate-100 h-2 rounded-full">
                <div className="absolute left-0 top-0 h-full w-[70%] bg-[#00a878] rounded-full" />
                <div className="absolute left-[70%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#00a878] shadow-sm" />
                </div>

                <p className="text-xs text-slate-500">
                Projected drawdown: <span className="font-bold text-slate-800">61%</span> by weekend service close.
                </p>
            </div>

            <button className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                <LineChart size={14} />
                <span>View Forecast</span>
            </button>
            </div>
        </div>
    )
}