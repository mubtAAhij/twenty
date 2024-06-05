import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { MessageQueueDriver } from 'src/engine/integrations/message-queue/drivers/interfaces/message-queue-driver.interface';

import { MessageQueueDriverType } from 'src/engine/integrations/message-queue/interfaces';
import {
  MessageQueue,
  QUEUE_DRIVER,
} from 'src/engine/integrations/message-queue/message-queue.constants';
import { PgBossDriver } from 'src/engine/integrations/message-queue/drivers/pg-boss.driver';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { BullMQDriver } from 'src/engine/integrations/message-queue/drivers/bullmq.driver';
import { SyncDriver } from 'src/engine/integrations/message-queue/drivers/sync.driver';
import { getQueueToken } from 'src/engine/integrations/message-queue/utils/get-queue-token.util';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  OPTIONS_TYPE,
} from 'src/engine/integrations/message-queue/message-queue.module-definition';

@Global()
@Module({})
export class MessageQueueCoreModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options);

    const driverProvider: Provider = {
      provide: QUEUE_DRIVER,
      useFactory: () => {
        return this.createDriver(options);
      },
    };

    const queueProviders = this.createQueueProviders();

    return {
      ...dynamicModule,
      providers: [
        ...(dynamicModule.providers ?? []),
        driverProvider,
        ...queueProviders,
      ],
      exports: [
        ...(dynamicModule.exports ?? []),
        ...Object.values(MessageQueue).map((queueName) =>
          getQueueToken(queueName),
        ),
      ],
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.registerAsync(options);

    const driverProvider: Provider = {
      provide: QUEUE_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory!(...args);

        return this.createDriver(config);
      },
      inject: options.inject || [],
    };

    const queueProviders = MessageQueueCoreModule.createQueueProviders();

    return {
      ...dynamicModule,
      providers: [
        ...(dynamicModule.providers ?? []),
        driverProvider,
        ...queueProviders,
      ],
      exports: [
        ...(dynamicModule.exports ?? []),
        ...Object.values(MessageQueue).map((queueName) =>
          getQueueToken(queueName),
        ),
      ],
    };
  }

  static async createDriver({ type, options }: typeof OPTIONS_TYPE) {
    switch (type) {
      case MessageQueueDriverType.PgBoss: {
        return new PgBossDriver(options);
      }
      case MessageQueueDriverType.BullMQ: {
        return new BullMQDriver(options);
      }
      default: {
        return new SyncDriver();
      }
    }
  }

  static createQueueProviders(): Provider[] {
    return Object.values(MessageQueue).map((queueName) => ({
      provide: getQueueToken(queueName),
      useFactory: (driver: MessageQueueDriver) => {
        return new MessageQueueService(driver, queueName);
      },
      inject: [QUEUE_DRIVER],
    }));
  }
}
