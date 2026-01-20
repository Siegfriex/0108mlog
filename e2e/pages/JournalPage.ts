import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class JournalPage extends BasePage {
  readonly timeline: Locator;
  readonly timelineEntry: Locator;
  readonly searchInput: Locator;
  readonly emotionIcon: Locator;
  readonly intensityBadge: Locator;
  
  constructor(page: Page) {
    super(page);
    this.timeline = page.locator('[data-testid="timeline"]');
    this.timelineEntry = page.locator('[data-testid="timeline-entry"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.emotionIcon = page.locator('[data-testid="emotion-icon"]');
    this.intensityBadge = page.locator('[data-testid="intensity-badge"]');
  }

  async clickFirstEntry() {
    await this.timelineEntry.first().click();
  }

  async searchByKeyword(keyword: string) {
    await this.searchInput.fill(keyword);
  }

  async filterByEmotion(emotion: 'joy' | 'peace' | 'anxiety' | 'sadness' | 'anger') {
    await this.page.locator(`[data-testid="emotion-filter-${emotion}"]`).click();
  }
}
