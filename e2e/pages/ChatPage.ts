import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChatPage extends BasePage {
  readonly emotionModal: Locator;
  readonly emotionJoy: Locator;
  readonly intensitySlider: Locator;
  readonly startChatButton: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.emotionModal = page.locator('[data-testid="emotion-modal"]');
    this.emotionJoy = page.locator('[data-testid="emotion-joy"]');
    this.intensitySlider = page.locator('[data-testid="intensity-slider"]');
    this.startChatButton = page.locator('button:has-text("대화 시작하기")');
    this.messageInput = page.locator('textarea[placeholder*="말씀해주세요"]');
    this.sendButton = page.locator('[aria-label="전송"]');
  }

  async selectEmotion(emotion: 'joy' | 'peace' | 'anxiety' | 'sadness' | 'anger') {
    await this.page.locator(`[data-testid="emotion-${emotion}"]`).click();
  }

  async setIntensity(value: number) {
    await this.intensitySlider.fill(value.toString());
  }

  async startChat() {
    await this.startChatButton.click();
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async waitForAIResponse(timeout: number = 8000) {
    await this.page.waitForSelector('[data-testid="ai-message"]', { timeout });
  }

  async isDayMode(): Promise<boolean> {
    return await this.page.locator('[data-testid="day-mode"]').isVisible();
  }

  async isNightMode(): Promise<boolean> {
    return await this.page.locator('[data-testid="night-mode"]').isVisible();
  }
}
