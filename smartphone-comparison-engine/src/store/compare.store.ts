import { create } from "zustand";
import { Smartphone } from "../types";
import { defaultPhones, defaultTemplates } from "../data/defaultPhones";
import { StorageManager } from "../utils/storage";

interface CompareState {
  phoneA: Smartphone;
  phoneB: Smartphone;
  comparisonList: Smartphone[]; // Dynamic array supporting 2 to 6 phones
  battles: {
    id: string;
    title: string;
    phoneA: Smartphone;
    phoneB: Smartphone;
    votesA: number;
    votesB: number;
    voted: "A" | "B" | null;
  }[];
  setPhoneA: (phone: Smartphone) => void;
  setPhoneB: (phone: Smartphone) => void;
  updatePhoneField: (slot: "A" | "B", field: keyof Smartphone, value: string) => void;
  setPhones: (phoneA: Smartphone, phoneB: Smartphone) => void;
  swapPhones: () => void;
  selectTemplate: (index: number) => void;
  voteInBattle: (battleId: string, option: "A" | "B") => void;
  
  // Multi-phone comparison management
  addPhoneToCompare: (phone: Smartphone) => void;
  removePhoneFromCompare: (index: number) => void;
  updatePhoneInCompare: (index: number, field: keyof Smartphone, value: string) => void;
  setComparisonList: (phones: Smartphone[]) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  phoneA: defaultPhones[0], // Default iPhone 15 Pro Max
  phoneB: defaultPhones[1], // Default S24 Ultra
  comparisonList: [defaultPhones[0], defaultPhones[1]], // At least 2 default phones
  
  battles: StorageManager.getItem("phone-battles", [
    {
      id: "battle-1",
      title: "كلاسيكو العمالقة العالمي ⚔️",
      phoneA: defaultPhones[0],
      phoneB: defaultPhones[1],
      votesA: 3410,
      votesB: 3670,
      voted: null as "A" | "B" | null
    },
    {
      id: "battle-2",
      title: "صراع العِتاد والذكاء الاصطناعي 🧠",
      phoneA: defaultPhones[1],
      phoneB: defaultPhones[2],
      votesA: 1980,
      votesB: 1450,
      voted: null as "A" | "B" | null
    },
    {
      id: "battle-3",
      title: "السرعة الفائقة ضد فخامة التيتانيوم ⚡",
      phoneA: defaultPhones[0],
      phoneB: defaultPhones[3],
      votesA: 1210,
      votesB: 1845,
      voted: null as "A" | "B" | null
    }
  ]),

  setPhoneA: (phone) => set((state) => {
    const list = [...state.comparisonList];
    list[0] = phone;
    return { phoneA: phone, comparisonList: list };
  }),
  
  setPhoneB: (phone) => set((state) => {
    const list = [...state.comparisonList];
    if (list.length > 1) {
      list[1] = phone;
    } else {
      list.push(phone);
    }
    return { phoneB: phone, comparisonList: list };
  }),
  
  updatePhoneField: (slot, field, value) => {
    set((state) => {
      const updatedPhoneA = slot === "A" ? { ...state.phoneA, [field]: value } : state.phoneA;
      const updatedPhoneB = slot === "B" ? { ...state.phoneB, [field]: value } : state.phoneB;
      const list = [...state.comparisonList];
      if (slot === "A") list[0] = updatedPhoneA;
      if (slot === "B" && list.length > 1) list[1] = updatedPhoneB;

      return {
        phoneA: updatedPhoneA,
        phoneB: updatedPhoneB,
        comparisonList: list
      };
    });
  },

  setPhones: (phoneA, phoneB) => set({ 
    phoneA, 
    phoneB, 
    comparisonList: [phoneA, phoneB] 
  }),
  
  swapPhones: () => {
    set((state) => ({
      phoneA: { ...state.phoneB },
      phoneB: { ...state.phoneA },
      comparisonList: [state.phoneB, state.phoneA, ...state.comparisonList.slice(2)]
    }));
  },

  selectTemplate: (index: number) => {
    const selected = defaultTemplates[index];
    if (selected) {
      set({
        phoneA: selected.phoneA,
        phoneB: selected.phoneB,
        comparisonList: [selected.phoneA, selected.phoneB]
      });
    }
  },

  voteInBattle: (battleId, option) => {
    const battles = get().battles;
    const updated = battles.map((b) => {
      if (b.id === battleId) {
        if (b.voted) return b; // Limit to single voting event safely
        return {
          ...b,
          votesA: option === "A" ? b.votesA + 1 : b.votesA,
          votesB: option === "B" ? b.votesB + 1 : b.votesB,
          voted: option
        };
      }
      return b;
    });
    set({ battles: updated });
    StorageManager.setItem("phone-battles", updated);
  },

  addPhoneToCompare: (phone) => {
    const list = get().comparisonList;
    if (list.length >= 6) return; // Keep comparison strict to max 6
    // Avoid immediate duplicate keys by checking standard name matches
    const nameExists = list.some(item => item.name.toLowerCase().trim() === phone.name.toLowerCase().trim());
    if (nameExists) return;

    const newList = [...list, phone];
    set({
      comparisonList: newList,
      // Sync A/B status
      phoneA: newList[0],
      phoneB: newList[1] || get().phoneB
    });
  },

  removePhoneFromCompare: (index) => {
    const list = get().comparisonList;
    if (list.length <= 2) return; // Minimum of 2 devices required
    
    const newList = list.filter((_, i) => i !== index);
    set({
      comparisonList: newList,
      // Sync A/B status
      phoneA: newList[0],
      phoneB: newList[1]
    });
  },

  updatePhoneInCompare: (index, field, value) => {
    const list = [...get().comparisonList];
    if (index >= 0 && index < list.length) {
      list[index] = { ...list[index], [field]: value };
      set({
        comparisonList: list,
        phoneA: index === 0 ? list[0] : get().phoneA,
        phoneB: index === 1 ? list[1] : get().phoneB
      });
    }
  },

  setComparisonList: (phones) => {
    if (phones.length < 2) return;
    const sliced = phones.slice(0, 6); // Hard limit of 6
    set({
      comparisonList: sliced,
      phoneA: sliced[0],
      phoneB: sliced[1]
    });
  }
}));
