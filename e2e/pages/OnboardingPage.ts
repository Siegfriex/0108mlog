import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  readonly progressIndicator: Locator;
  readonly nextButton: Locator;
  readonly skipButton: Locator;
  readonly startButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.progressIndicator = page.locator('[data-testid="progress-indicator"]');
    this.nextButton = page.locator('button:has-text("다음")');
    this.skipButton = page.locator('button:has-text("건너뛰기")');
    this.startButton = page.locator('button:has-text("시작하기")');
  }

  async selectEmotionRating(rating: number) {
    await this.page.locator(`[data-testid="emotion-rating-${rating}"]`).click();
  }

  async selectHelpOption(optionIndex: number) {
    await this.page.locator(`[data-testid="help-option-${optionIndex}"]`).click();
  }

  async selectGoalOption(optionIndex: number) {
    await this.page.locator(`[data-testid="goal-option-${optionIndex}"]`).click();
  }

  async setNotificationTime(time: string) {
    await this.page.locator('[data-testid="notification-time"]').fill(time);
  }

  async selectGoalCard(cardIndex: number) {
    await this.page.locator(`[data-testid="goal-card-${cardIndex}"]`).click();
  }
}
