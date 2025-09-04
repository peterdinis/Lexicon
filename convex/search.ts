import { query } from "./_generated/server";

export const searchAll = query(
  async (
    { db },
    {
      userId,
      searchText,
    }: {
      userId: string;
      searchText?: string;
    }
  ) => {
    const pages = await db
      .query("pages")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const filteredPages = searchText
      ? pages.filter((p) =>
          p.title.toLowerCase().includes(searchText.toLowerCase())
        )
      : pages;
      
    const workspaces = await db
      .query("workspaces")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const filteredWorkspaces = searchText
      ? workspaces.filter((w) =>
          w.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : workspaces;

    return {
      pages: filteredPages,
      workspaces: filteredWorkspaces,
    };
  }
);
