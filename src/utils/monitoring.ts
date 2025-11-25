/**
 * @file src/utils/monitoring.ts
 * @description Production monitoring and error recovery utilities
 */

export interface MonitoringConfig {
  enableMetrics?: boolean;
  enableLogging?: boolean;
  endpoint?: string;
  apiKey?: string;
  sampleRate?: number;
}

export interface Metrics {
  requestCount: number;
  errorCount: number;
  successRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface AlertConfig {
  errorRateThreshold?: number;
  responseTimeThreshold?: number;
  webhookUrl?: string;
}

class PaymentMonitor {
  private config: MonitoringConfig;
  private metrics = {
    requests: [] as Array<{ timestamp: number; duration: number; success: boolean; endpoint: string }>,
    errors: [] as Array<{ timestamp: number; error: Error; context: any }>,
    alerts: [] as Array<{ timestamp: number; type: string; message: string }>
  };
  private alertConfig: AlertConfig;

  constructor(config: MonitoringConfig = {}) {
    this.config = {
      enableMetrics: true,
      enableLogging: true,
      sampleRate: 1.0,
      ...config
    };
    this.alertConfig = {};
  }

  startRequest(endpoint: string): { requestId: string; startTime: number } {
    const requestId = this.generateRequestId();
    const startTime = performance.now();

    if (this.config.enableLogging) {
      console.log(`[QorPay] Starting request: ${requestId} to ${endpoint}`);
    }

    return { requestId, startTime };
  }

  endRequest(requestId: string, startTime: number, success: boolean, error?: Error, context?: any): void {
    const duration = performance.now() - startTime;

    if (this.config.enableMetrics && Math.random() < (this.config.sampleRate || 1)) {
      this.metrics.requests.push({
        timestamp: Date.now(),
        duration,
        success,
        endpoint: context?.endpoint || 'unknown'
      });

      // Keep only last 10000 requests
      if (this.metrics.requests.length > 10000) {
        this.metrics.requests = this.metrics.requests.slice(-10000);
      }
    }

    if (!success && error) {
      this.metrics.errors.push({
        timestamp: Date.now(),
        error,
        context
      });

      // Check alert conditions
      this.checkAlerts();
    }

    if (this.config.enableLogging) {
      const status = success ? '✅' : '❌';
      console.log(`[QorPay] ${status} Request ${requestId}: ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics(): Metrics {
    const requests = this.metrics.requests;
    const recent = requests.filter(r => Date.now() - r.timestamp < 300000); // Last 5 minutes

    if (recent.length === 0) {
      return {
        requestCount: 0,
        errorCount: 0,
        successRate: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      };
    }

    const durations = recent.map(r => r.duration).sort((a, b) => a - b);
    const successCount = recent.filter(r => r.success).length;

    return {
      requestCount: recent.length,
      errorCount: recent.length - successCount,
      successRate: (successCount / recent.length) * 100,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[Math.floor(durations.length * 0.95)] || 0,
      p99ResponseTime: durations[Math.floor(durations.length * 0.99)] || 0
    };
  }

  setAlertConfig(config: AlertConfig): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  private checkAlerts(): void {
    const metrics = this.getMetrics();
    const now = Date.now();

    // Error rate alert
    if (this.alertConfig.errorRateThreshold &&
        metrics.successRate < (100 - this.alertConfig.errorRateThreshold)) {
      this.sendAlert('HIGH_ERROR_RATE',
        `Error rate exceeded threshold: ${(100 - metrics.successRate).toFixed(2)}%`);
    }

    // Response time alert
    if (this.alertConfig.responseTimeThreshold &&
        metrics.p95ResponseTime > this.alertConfig.responseTimeThreshold) {
      this.sendAlert('SLOW_RESPONSES',
        `P95 response time exceeded threshold: ${metrics.p95ResponseTime.toFixed(2)}ms`);
    }
  }

  private sendAlert(type: string, message: string): void {
    const alert = {
      timestamp: Date.now(),
      type,
      message
    };

    this.metrics.alerts.push(alert);

    if (this.alertConfig.webhookUrl) {
      fetch(this.alertConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      }).catch(() => {
        console.error('Failed to send alert webhook');
      });
    }

    console.error(`[QorPay Alert] ${type}: ${message}`);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class ErrorRecovery {
  private retryStrategies = new Map<string, RetryStrategy>();

  registerStrategy(endpoint: string, strategy: RetryStrategy): void {
    this.retryStrategies.set(endpoint, strategy);
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    endpoint: string,
    context?: any
  ): Promise<T> {
    const strategy = this.retryStrategies.get(endpoint) || new DefaultRetryStrategy();

    let lastError: Error;
    let attempt = 0;

    while (attempt <= strategy.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (!strategy.shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        const delay = strategy.calculateDelay(attempt, lastError);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface RetryStrategy {
  maxRetries: number;
  shouldRetry(error: Error, attempt: number): boolean;
  calculateDelay(attempt: number, error?: Error): number;
}

export class DefaultRetryStrategy implements RetryStrategy {
  maxRetries = 3;
  private baseDelay = 1000;

  shouldRetry(error: Error, attempt: number): boolean {
    // Don't retry on certain errors
    const noRetryErrors = ['AUTH01', 'VALIDATION_ERROR', 'INVALID_CARD'];
    return !noRetryErrors.some(code => error.message.includes(code)) && attempt <= this.maxRetries;
  }

  calculateDelay(attempt: number, error?: Error): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }
}

export class AggressiveRetryStrategy extends DefaultRetryStrategy {
  maxRetries = 5;
  protected baseDelay = 500;
}

export class ConservativeRetryStrategy extends DefaultRetryStrategy {
  maxRetries = 2;
  protected baseDelay = 2000;
}

/**
 * Health check utility
 */
export class HealthChecker {
  private checks = new Map<string, HealthCheck>();

  registerCheck(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  async runAllChecks(): Promise<{ healthy: boolean; results: Record<string, any> }> {
    const results: Record<string, any> = {};
    let healthy = true;

    for (const [name, check] of this.checks) {
      try {
        const result = await check.execute();
        results[name] = {
          status: 'healthy',
          ...result
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: (error as Error).message
        };
        healthy = false;
      }
    }

    return { healthy, results };
  }
}

export interface HealthCheck {
  execute(): Promise<any>;
}

export class ApiHealthCheck implements HealthCheck {
  constructor(private qorpay: any, private endpoint: string = '/utils/time') {}

  async execute(): Promise<any> {
    const response = await this.qorpay.get(this.endpoint);
    return {
      latency: response.latency || 0,
      timestamp: new Date().toISOString()
    };
  }
}

export class DatabaseHealthCheck implements HealthCheck {
  constructor(private connection: any) {}

  async execute(): Promise<any> {
    const start = performance.now();
    await this.connection.query('SELECT 1');
    const latency = performance.now() - start;

    return {
      latency,
      connected: true
    };
  }
}

/**
 * Circuit Breaker with monitoring
 */
export class MonitoredCircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private nextRetryTime = 0;
  private monitor: PaymentMonitor;

  constructor(
    private options: {
      threshold?: number;
      timeout?: number;
      resetTimeout?: number;
    } = {},
    monitor?: PaymentMonitor
  ) {
    this.monitor = monitor || new PaymentMonitor();
    this.options = {
      threshold: 5,
      timeout: 60000,
      resetTimeout: 30000,
      ...options
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextRetryTime) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    const { requestId, startTime } = this.monitor.startRequest('circuit-breaker');

    try {
      const result = await fn();
      this.recordSuccess();
      this.monitor.endRequest(requestId, startTime, true);
      return result;
    } catch (error) {
      this.recordFailure();
      this.monitor.endRequest(requestId, startTime, false, error as Error);
      throw error;
    }
  }

  private recordSuccess(): void {
    this.successes++;
    this.failures = 0;

    if (this.state === 'half-open') {
      this.state = 'closed';
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.threshold!) {
      this.state = 'open';
      this.nextRetryTime = Date.now() + this.options.resetTimeout!;
    }
  }

  getState(): string {
    return this.state;
  }

  getStats(): { failures: number; successes: number; state: string } {
    return {
      failures: this.failures,
      successes: this.successes,
      state: this.state
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
  }
}

/**
 * Export defaults
 */
export { PaymentMonitor as default };
export const defaultRetryStrategy = new DefaultRetryStrategy();
export const aggressiveRetryStrategy = new AggressiveRetryStrategy();
export const conservativeRetryStrategy = new ConservativeRetryStrategy();