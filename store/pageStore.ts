export type Page = {
	id: string;
	title: string;
	content: string; // HTML string
	createdAt: number;
	updatedAt: number;
	icon?: string;
	isTrashed?: boolean;
	trashedAt?: number;
};

const STORAGE_KEY = "notion.pages";
const UPDATE_EVENT = "pages:updated";

function read(): Page[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Page[]) : [];
	} catch {
		return [];
	}
}

function write(pages: Page[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
	// notify listeners (e.g., sidebar) to refresh
	window.dispatchEvent(new Event(UPDATE_EVENT));
}

function uid() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listPages(): Page[] {
	return read()
		.filter((p) => !p.isTrashed)
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function listTrashedPages(): Page[] {
	return read()
		.filter((p) => p.isTrashed)
		.sort((a, b) => (b.trashedAt ?? 0) - (a.trashedAt ?? 0));
}

export function getPage(id: string): Page | undefined {
	return read().find((p) => p.id === id);
}

export function createPage(initial?: Partial<Page>): Page {
	const now = Date.now();
	const page: Page = {
		id: uid(),
		title: initial?.title?.trim() || "Untitled",
		content: initial?.content || "",
		icon: initial?.icon,
		createdAt: now,
		updatedAt: now,
		isTrashed: false,
	};
	const pages = read();
	pages.push(page);
	write(pages);
	return page;
}

export function updatePage(
	id: string,
	updates: Partial<Omit<Page, "id" | "createdAt">>,
) {
	const pages = read();
	const idx = pages.findIndex((p) => p.id === id);
	if (idx === -1) return;
	pages[idx] = { ...pages[idx], ...updates, updatedAt: Date.now() };
	write(pages);
}

export function movePageToTrash(id: string) {
	const pages = read();
	const idx = pages.findIndex((p) => p.id === id);
	if (idx === -1) return;
	pages[idx] = {
		...pages[idx],
		isTrashed: true,
		trashedAt: Date.now(),
		updatedAt: Date.now(),
	};
	write(pages);
}

export function restorePage(id: string) {
	const pages = read();
	const idx = pages.findIndex((p) => p.id === id);
	if (idx === -1) return;
	pages[idx] = {
		...pages[idx],
		isTrashed: false,
		trashedAt: undefined,
		updatedAt: Date.now(),
	};
	write(pages);
}

export function deletePagePermanent(id: string) {
	const pages = read().filter((p) => p.id !== id);
	write(pages);
}

// Backward compatibility: delete removes permanently
export function deletePage(id: string) {
	deletePagePermanent(id);
}

export const pagesEvents = {
	eventName: UPDATE_EVENT,
};
