export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  guid?: string;
}

export async function parseRssFeed(xml: string): Promise<RssItem[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');

  return Array.from(items).map(item => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = new Date(item.querySelector('pubDate')?.textContent || '').toLocaleDateString();
    const description = item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || '';
    const guid = item.querySelector('guid')?.textContent || '';

    return {
      title,
      link,
      pubDate,
      description,
      guid
    };
  });
}