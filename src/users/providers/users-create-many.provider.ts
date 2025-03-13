import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { User } from '../user.entity';
import { DataSource } from 'typeorm';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { stringify } from 'querystring';

@Injectable()
export class UsersCreateManyProvider {
  constructor(private readonly dataSource: DataSource) {}

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    let newUsers: User[] = [];

    // Create Query Runner Instance
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Connect Query Runner to dataSource
      await queryRunner.connect();

      // Start Transaction
      await queryRunner.startTransaction();
    } catch (error) {
      throw new RequestTimeoutException('Could not connect to the database.');
    }

    try {
      for (let user of createManyUsersDto.users) {
        let newUser = queryRunner.manager.create(User, user);
        let result = await queryRunner.manager.save(newUser);
        newUsers.push(result);
      }

      // If successful, commit
      await queryRunner.commitTransaction();
    } catch (error) {
      // If unsuccessful, rollback
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Could not complete the transaction', {
        description: String(error),
      });
    } finally {
      // Release connection
      try {
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException('Could not release the connection', {
          description: String(error),
        });
      }
    }

    return newUsers;
  }
}
