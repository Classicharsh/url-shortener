// ============================================================
// Links Store — Zustand
// ============================================================
import { create } from 'zustand';
import type { Link, LinkFilter, SortField, SortDirection } from '@/types';
import { getUserLinks, createLink, deleteLink, updateLink, subscribeUserLinks } from '@/lib/firestore';
import type { LinkFormData } from '@/types';
import type { Unsubscribe } from 'firebase/firestore';

interface LinksState {
  links:       Link[];
  loading:     boolean;
  error:       string | null;
  filter:      LinkFilter;
  unsubscribe: Unsubscribe | null;

  // Actions
  fetchLinks:    (userId: string) => Promise<void>;
  subscribeLinks: (userId: string) => void;
  unsubscribeLinks: () => void;
  addLink:       (userId: string, form: LinkFormData) => Promise<Link>;
  removeLink:    (linkId: string) => Promise<void>;
  editLink:      (linkId: string, updates: Partial<Pick<Link, 'title' | 'slug' | 'expiresAt' | 'isActive'>>) => Promise<void>;
  setFilter:     (filter: Partial<LinkFilter>) => void;
  clearError:    () => void;

  // Computed (via selector)
  filteredLinks: (links: Link[], filter: LinkFilter) => Link[];
}

function applyFilter(links: Link[], filter: LinkFilter): Link[] {
  let result = [...links];

  // Search
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.slug.toLowerCase().includes(q) ||
        l.originalUrl.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q)
    );
  }

  // Hide expired if needed
  if (!filter.showExpired) {
    result = result.filter((l) => !l.expiresAt || new Date() < new Date(l.expiresAt));
  }

  // Sort
  result.sort((a, b) => {
    let va: number, vb: number;
    if (filter.sortBy === 'totalClicks') {
      va = a.totalClicks;
      vb = b.totalClicks;
    } else if (filter.sortBy === 'lastClickAt') {
      va = a.lastClickAt?.getTime() ?? 0;
      vb = b.lastClickAt?.getTime() ?? 0;
    } else {
      va = a.createdAt?.getTime() ?? 0;
      vb = b.createdAt?.getTime() ?? 0;
    }
    return filter.sortDirection === 'asc' ? va - vb : vb - va;
  });

  return result;
}

export const useLinksStore = create<LinksState>()((set, get) => ({
  links:       [],
  loading:     false,
  error:       null,
  unsubscribe: null,
  filter: {
    search:        '',
    sortBy:        'createdAt',
    sortDirection: 'desc',
    showExpired:   true,
  },

  filteredLinks: (links, filter) => applyFilter(links, filter),

  fetchLinks: async (userId) => {
    set({ loading: true, error: null });
    try {
      const links = await getUserLinks(userId);
      set({ links });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  subscribeLinks: (userId) => {
    // Clean up previous listener
    get().unsubscribeLinks();
    const unsub = subscribeUserLinks(userId, (links) => {
      set({ links, loading: false });
    });
    set({ unsubscribe: unsub, loading: true });
  },

  unsubscribeLinks: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ unsubscribe: null, links: [] });
  },

  addLink: async (userId, form) => {
    set({ loading: true, error: null });
    try {
      const link = await createLink(userId, form);
      set((s) => ({ links: [link, ...s.links] }));
      return link;
    } catch (e) {
      const msg = (e as Error).message;
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  removeLink: async (linkId) => {
    try {
      await deleteLink(linkId);
      set((s) => ({ links: s.links.filter((l) => l.id !== linkId) }));
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  editLink: async (linkId, updates) => {
    try {
      await updateLink(linkId, updates);
      set((s) => ({
        links: s.links.map((l) =>
          l.id === linkId ? { ...l, ...updates, updatedAt: new Date() } : l
        ),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  setFilter: (partial) => set((s) => ({ filter: { ...s.filter, ...partial } })),
  clearError: () => set({ error: null }),
}));

// Selector: filtered links
export const useFilteredLinks = () => {
  const { links, filter, filteredLinks } = useLinksStore();
  return filteredLinks(links, filter);
};
