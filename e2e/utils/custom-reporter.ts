import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';

class CustomReporter implements Reporter {
  private results: any[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({
      title: test.title,
      file: test.location.file,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
    });
  }

  onEnd() {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      timestamp: new Date().toISOString(),
      results: this.results,
    };

    fs.writeFileSync(
      'e2e-summary.json',
      JSON.stringify(summary, null, 2)
    );
  }
}

export default CustomReporter;
