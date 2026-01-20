import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReportsPage extends BasePage {
  readonly weeklyReport: Locator;
  readonly monthlyReport: Locator;
  readonly emotionDistributionChart: Locator;
  readonly emotionTrendChart: Locator;
  readonly weeklyInsights: Locator;
  readonly experimentCard: Locator;
  
  constructor(page: Page) {
    super(page);
    this.weeklyReport = page.locator('[data-testid="weekly-report"]');
    this.monthlyReport = page.locator('[data-testid="monthly-report"]');
    this.emotionDistributionChart = page.locator('[data-testid="emotion-distribution-chart"]');
    this.emotionTrendChart = page.locator('[data-testid="emotion-trend-chart"]');
    this.weeklyInsights = page.locator('[data-testid="weekly-insights"]');
    this.experimentCard = page.locator('[data-testid="experiment-card"]');
  }

  async gotoWeekly() {
    await this.goto('/reports/weekly');
  }

  async gotoMonthly() {
    await this.goto('/reports/monthly');
  }

  async gotoRetrospective() {
    await this.goto('/reports/monthly-retrospective');
  }
}
