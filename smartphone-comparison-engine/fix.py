import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# We need to replace everything from "                {/* Quick Logs Feed */}" to "                  {/* Table rendering the Smartphones */}"
# Let's find the start and end indices

start_str = "                {/* Quick Logs Feed */}"
end_str = "                  {/* Table rendering the Smartphones */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_block = """                {/* Quick Logs Feed */}
                <div className="lg:col-span-12 space-y-4">
                  <ActivityLog logs={activityLogs || []} />
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB: CATALOG ======================= */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              
              {/* Inner Sub-Tabs layout */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 pb-1">
                <button
                  type="button"
                  onClick={() => setCatalogSubTab("phones")}
                  className={`cursor-pointer pb-2 text-xs font-black transition-all border-b-2 px-1 ${
                    catalogSubTab === "phones"
                      ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  📱 قاعدة الهواتف الكاتالوج
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogSubTab("brands")}
                  className={`cursor-pointer pb-2 text-xs font-black transition-all border-b-2 px-1 ${
                    catalogSubTab === "brands"
                      ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  🏢 إدارة العلامات والشركات المصنعة
                </button>
              </div>

              {catalogSubTab === "phones" && (
                <div className="space-y-4">
                  {/* Filter controls */}
                  <div className="flex flex-col sm:flex-row gap-2 items-center relative">
                    <div className="w-full sm:flex-1 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن هاتف أو شركة مصنّعة..."
                        className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
                      />
                      <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                        <Filter className="w-4 h-4 text-slate-400 hover:text-indigo-500" />
                      </button>
                      
                      <AdvancedFilters 
                        isOpen={isFilterOpen} 
                        onClose={() => setIsFilterOpen(false)} 
                        filters={filters} 
                        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))} 
                        brands={brands} 
                        qualityFilter={filters.qualityFilter || null} 
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select value={filters.sortBy || "newest"} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="w-auto text-xs py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-slate-700 dark:text-slate-300 hidden sm:block">
                        <option value="newest">الأحدث ترتيباً</option>
                        <option value="oldest">الأقدم ترتيباً</option>
                        <option value="az">أ - ي</option>
                        <option value="za">ي - أ</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => loadPhones()}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تحديث</span>
                      </button>
                    </div>
                  </div>

                  <ActiveFilterChips 
                    filters={filters} 
                    onRemove={(key) => {
                      const newFilters = { ...filters };
                      delete newFilters[key];
                      setFilters(newFilters);
                    }} 
                    onClearAll={() => setFilters({ brand: "all", sortBy: "newest" })} 
                  />

                  <DataQualityCenter 
                    userEmail={userEmail} 
                    onFilterSelect={(v) => setFilters(prev => ({ ...prev, qualityFilter: v }))} 
                    activeFilter={filters.qualityFilter || null} 
                  />

"""
    new_content = content[:start_idx] + new_block + content[end_idx:]
    with open('src/components/AdminPanel.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Could not find blocks")
