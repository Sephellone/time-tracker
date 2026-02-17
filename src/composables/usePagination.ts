import { ref, type Ref } from "vue";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export interface PaginationResult<T> {
  docs: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

export interface UsePaginationReturn<T> {
  items: Ref<T[]>;
  getFirstPage: () => Promise<void>;
  getNextPage: () => Promise<void>;
  reset: () => void;
  addItems: (newItems: T[]) => void;
  addItem: (newItem: T) => void;
  removeItems: (itemIds: string[]) => void;
  removeItem: (itemId: string) => void;
  updateItem: (updatedItem: T) => void;
  hasMore: Ref<boolean>;
}

export interface UsePaginationOptions {
  idKey?: string;
}

export default function usePagination<T extends Record<string, any>>(
  fetchFunction: (lastDoc: QueryDocumentSnapshot<DocumentData> | null) => Promise<PaginationResult<T>>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { idKey = 'id' } = options;
  const items = ref<T[]>([]) as Ref<T[]>;
  const lastDoc = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
  const hasMore = ref(true);
  const itemIds = ref<Set<string>>(new Set());

  const getFirstPage = async () => {
    const result = await fetchFunction(null);
    items.value = result.docs;
    itemIds.value = new Set(result.docs.map(doc => doc[idKey]));
    lastDoc.value = result.lastDoc;
    hasMore.value = result.docs.length > 0 && result.lastDoc !== null;
  };

  const getNextPage = async () => {
    if (!lastDoc.value || !hasMore.value) return;

    const result = await fetchFunction(lastDoc.value);

    const newItems = result.docs.filter(doc => !itemIds.value.has(doc[idKey]));

    items.value.push(...newItems);
    newItems.forEach(item => itemIds.value.add(item[idKey]));

    lastDoc.value = result.lastDoc;
    hasMore.value = result.docs.length > 0 && result.lastDoc !== null;
  };

  const reset = () => {
    items.value = [];
    itemIds.value.clear();
    lastDoc.value = null;
    hasMore.value = true;
  };

  const addItems = (newItems: T[]) => {
    const uniqueNewItems = newItems.filter(item => !itemIds.value.has(item[idKey]));
    items.value.unshift(...uniqueNewItems);
    uniqueNewItems.forEach(item => itemIds.value.add(item[idKey]));
  };

  const addItem = (newItem: T) => {
    addItems([newItem]);
  };

  const removeItems = (itemIdsToRemove: string[]) => {
    const idsSet = new Set(itemIdsToRemove);
    items.value = items.value.filter(item => {
      const id = item[idKey];
      if (idsSet.has(id)) {
        itemIds.value.delete(id);
        return false;
      }
      return true;
    });
  };

  const removeItem = (itemId: string) => {
    removeItems([itemId]);
  };

  const updateItem = (updatedItem: T) => {
    const index = items.value.findIndex(item => item[idKey] === updatedItem[idKey]);
    if (index !== -1) {
      items.value.splice(index, 1, updatedItem);
    }
  }

  return {
    items,
    getFirstPage,
    getNextPage,
    reset,
    addItems,
    addItem,
    removeItems,
    removeItem,
    hasMore,
    updateItem,
  };
}
