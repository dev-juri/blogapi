import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export async function dropDatabase(config: ConfigService): Promise<void> {
  // Create connection with Data source
  const AppDataSource = await new DataSource({
    type: 'postgres' as 'postgres',
    host: config.get<string>('database.host'),
    port: +config.get('database.port'),
    username: config.get<string>('database.user'),
    password: config.get<string>('database.password'),
    database: config.get<string>('database.name'),
    synchronize: config.get('database.synchronize'),
  }).initialize();
  // Drop all tables
  await AppDataSource.dropDatabase();
  // Close connection
  AppDataSource.destroy();
}
