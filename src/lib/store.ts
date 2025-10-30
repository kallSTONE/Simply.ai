import { create } from 'zustand';

type FilterState = {
  searchQuery: string;
  categories: string[];
  pricing: string[];
  platforms: string[];
  tags: string[];
  rating: number;
  isFilterOpen: boolean;
  setSearchQuery: (query: string) => void;
  setCategories: (categories: string[]) => void;
  setPricing: (pricing: string[]) => void;
  setPlatforms: (platforms: string[]) => void;
  setTags: (tags: string[]) => void;
  setRating: (rating: number) => void;
  toggleFilter: () => void;
  clearFilters: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  categories: [],
  pricing: [],
  platforms: [],
  tags: [],
  rating: 0,
  isFilterOpen: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategories: (categories) => set({ categories }),
  setPricing: (pricing) => set({ pricing }),
  setPlatforms: (platforms) => set({ platforms }),
  setTags: (tags) => set({ tags }),
  setRating: (rating) => set({ rating }),
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  clearFilters: () => set({
    categories: [],
    pricing: [],
    platforms: [],
    tags: [],
    rating: 0,
  }),
}));
