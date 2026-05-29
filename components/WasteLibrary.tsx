import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';
import { WasteCategory, WasteItem } from '../types';

const MOCK_WASTE_ITEMS: WasteItem[] = [
  { 
    id: '1', 
    name: 'Plastic Bottle', 
    category: WasteCategory.Plastic, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Rinse the bottle and crush it before placing it in the recycling bin.', 
    environmentalTip: 'Recycling plastic bottles saves energy and reduces pollution.' 
  },
  { 
    id: '2', 
    name: 'Banana Peel', 
    category: WasteCategory.Organic, 
    recyclableStatus: 'Compostable', 
    dustbinColor: 'Green Bin', 
    disposalInstructions: 'Place it in organic waste or compost bins.', 
    environmentalTip: 'Organic waste can be converted into natural fertilizer.' 
  },
  { 
    id: '3', 
    name: 'Aluminum Can', 
    category: WasteCategory.Metal, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Clean the can before disposal.', 
    environmentalTip: 'Aluminum can be recycled multiple times.' 
  },
  { 
    id: '4', 
    name: 'Cardboard Box', 
    category: WasteCategory.Paper, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Flatten the box and remove any plastic tape before recycling.', 
    environmentalTip: 'Recycling cardboard saves trees and reduces landfill waste.' 
  },
  { 
    id: '5', 
    name: 'Newspaper', 
    category: WasteCategory.Paper, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Keep dry and place in the paper recycling bin.', 
    environmentalTip: 'Paper can be recycled into new paper products up to 7 times.' 
  },
  { 
    id: '6', 
    name: 'Glass Jar', 
    category: WasteCategory.Glass, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Yellow Bin', 
    disposalInstructions: 'Rinse and remove the lid. Place the jar in the glass recycling bin.', 
    environmentalTip: 'Glass is 100% recyclable and can be recycled endlessly.' 
  },
  { 
    id: '7', 
    name: 'Old Battery', 
    category: WasteCategory.Hazardous, 
    recyclableStatus: 'Non-Recyclable', 
    dustbinColor: 'Red Bin', 
    disposalInstructions: 'Do not throw in regular trash. Take to a hazardous waste collection point.', 
    environmentalTip: 'Batteries contain toxic chemicals that can leak into the soil.' 
  },
  { 
    id: '8', 
    name: 'Broken Laptop', 
    category: WasteCategory.EWaste, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Grey Bin', 
    disposalInstructions: 'Take to an e-waste recycling center. Do not dispose of in regular bins.', 
    environmentalTip: 'E-waste contains valuable metals that can be recovered.' 
  },
  { 
    id: '9', 
    name: 'Styrofoam', 
    category: WasteCategory.Plastic, 
    recyclableStatus: 'Non-Recyclable', 
    dustbinColor: 'Black Bin', 
    disposalInstructions: 'Place in general waste. Styrofoam is difficult to recycle.', 
    environmentalTip: 'Avoid using styrofoam as it takes hundreds of years to decompose.' 
  },
  { 
    id: '10', 
    name: 'Light Bulb', 
    category: WasteCategory.Hazardous, 
    recyclableStatus: 'Non-Recyclable', 
    dustbinColor: 'Red Bin', 
    disposalInstructions: 'Wrap in paper to prevent breakage and take to a hazardous waste point.', 
    environmentalTip: 'Fluorescent bulbs contain mercury, which is harmful to the environment.' 
  },
  { 
    id: '11', 
    name: 'Paper Bag', 
    category: WasteCategory.Paper, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Remove any food residue and place in the paper recycling bin.', 
    environmentalTip: 'Paper bags are biodegradable but recycling them is even better.' 
  },
  { 
    id: '12', 
    name: 'Pizza Box', 
    category: WasteCategory.Paper, 
    recyclableStatus: 'Non-Recyclable', 
    dustbinColor: 'Black Bin', 
    disposalInstructions: 'If greasy, it cannot be recycled. Place in general waste or compost if clean.', 
    environmentalTip: 'Grease and cheese contaminate the paper recycling process.' 
  },
  { 
    id: '13', 
    name: 'Medicine Bottle', 
    category: WasteCategory.Plastic, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Empty contents and remove personal labels before recycling.', 
    environmentalTip: 'Most prescription bottles are made of #5 plastic (polypropylene).' 
  },
  { 
    id: '14', 
    name: 'Egg Shells', 
    category: WasteCategory.Organic, 
    recyclableStatus: 'Compostable', 
    dustbinColor: 'Green Bin', 
    disposalInstructions: 'Crush them and add to your compost or organic waste bin.', 
    environmentalTip: 'Eggshells add calcium to the soil, which helps plants grow.' 
  },
  { 
    id: '15', 
    name: 'Coffee Grounds', 
    category: WasteCategory.Organic, 
    recyclableStatus: 'Compostable', 
    dustbinColor: 'Green Bin', 
    disposalInstructions: 'Place in organic waste. They are great for composting.', 
    environmentalTip: 'Coffee grounds are rich in nitrogen and improve soil structure.' 
  },
  { 
    id: '16', 
    name: 'Tin Foil', 
    category: WasteCategory.Metal, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Blue Bin', 
    disposalInstructions: 'Clean off any food and roll into a ball (at least 2 inches wide) before recycling.', 
    environmentalTip: 'Clean aluminum foil is highly recyclable.' 
  },
  { 
    id: '17', 
    name: 'Wine Bottle', 
    category: WasteCategory.Glass, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Yellow Bin', 
    disposalInstructions: 'Remove the cork or cap and place in the glass recycling bin.', 
    environmentalTip: 'Recycling one glass bottle saves enough energy to light a 100-watt bulb for 4 hours.' 
  },
  { 
    id: '18', 
    name: 'Old Phone', 
    category: WasteCategory.EWaste, 
    recyclableStatus: 'Recyclable', 
    dustbinColor: 'Grey Bin', 
    disposalInstructions: 'Factory reset and take to an e-waste collection point or trade-in program.', 
    environmentalTip: 'Phones contain rare earth metals like gold, silver, and palladium.' 
  },
  { 
    id: '19', 
    name: 'Paint Can', 
    category: WasteCategory.Hazardous, 
    recyclableStatus: 'Non-Recyclable', 
    dustbinColor: 'Red Bin', 
    disposalInstructions: 'If empty and dry, it might be recyclable. If wet, take to hazardous waste.', 
    environmentalTip: 'Liquid paint can contaminate groundwater if disposed of improperly.' 
  },
];

export const WasteLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'All'>('All');

  const filteredItems = MOCK_WASTE_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: WasteCategory) => {
    switch (category) {
      case WasteCategory.Plastic: return 'text-green-600 bg-green-50';
      case WasteCategory.Metal: return 'text-gray-600 bg-gray-100';
      case WasteCategory.Glass: return 'text-green-600 bg-green-50';
      case WasteCategory.Paper: return 'text-green-600 bg-green-50';
      case WasteCategory.Organic: return 'text-green-600 bg-green-50';
      case WasteCategory.EWaste: return 'text-green-600 bg-green-50';
      case WasteCategory.Hazardous: return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: WasteCategory) => {
    switch (category) {
      case WasteCategory.Plastic: return '🥤';
      case WasteCategory.Metal: return '🥫';
      case WasteCategory.Glass: return '🍾';
      case WasteCategory.Paper: return '📄';
      case WasteCategory.Organic: return '🍎';
      case WasteCategory.EWaste: return '💻';
      case WasteCategory.Hazardous: return '⚠️';
      default: return '🗑️';
    }
  };

  const getDustbinColorClass = (color: string) => {
    const lowerColor = color.toLowerCase();
    if (lowerColor.includes('blue')) return 'bg-green-500';
    if (lowerColor.includes('green')) return 'bg-green-500';
    if (lowerColor.includes('yellow')) return 'bg-green-500';
    if (lowerColor.includes('red')) return 'bg-green-500';
    if (lowerColor.includes('grey') || lowerColor.includes('gray')) return 'bg-gray-500';
    if (lowerColor.includes('black')) return 'bg-gray-800';
    return 'bg-green-500';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Waste Guide</h2>
        <p className="text-sm text-gray-500">Learn how to dispose of your waste correctly</p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search items (e.g. Plastic Bottle, Battery)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all shadow-sm"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 no-scrollbar">
        {['All', ...Object.values(WasteCategory).filter(c => c !== WasteCategory.Unknown)].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as WasteCategory | 'All')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mr-4 flex-shrink-0 ${
                item.category === WasteCategory.Plastic ? 'bg-green-100' :
                item.category === WasteCategory.Metal ? 'bg-gray-100' :
                item.category === WasteCategory.Glass ? 'bg-green-100' :
                item.category === WasteCategory.Paper ? 'bg-green-100' :
                item.category === WasteCategory.Organic ? 'bg-green-100' :
                item.category === WasteCategory.EWaste ? 'bg-green-100' :
                item.category === WasteCategory.Hazardous ? 'bg-green-100' :
                'bg-gray-100'
              }`}>
                {getCategoryIcon(item.category)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    item.recyclableStatus === 'Recyclable' ? 'bg-green-100 text-green-700' :
                    item.recyclableStatus === 'Compostable' ? 'bg-green-100 text-green-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.recyclableStatus}
                  </span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getDustbinColorClass(item.dustbinColor)} mr-1.5`}></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item.dustbinColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center">
                  <Info size={12} className="mr-1 text-green-500" /> Disposal Instructions
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">{item.disposalInstructions}</p>
              </div>

              <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Environmental Tip</p>
                <p className="text-xs text-green-700 italic">"{item.environmentalTip}"</p>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No waste items found</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for something else</p>
          </div>
        )}
      </div>
    </div>
  );
};