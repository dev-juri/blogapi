import { TestingModule, Test } from '@nestjs/testing';
import { CreateUserProvider } from './create-user.provider';
import { MailService } from 'src/mail/providers/mail.service';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { DataSource, Repository } from 'typeorm';
import { first } from 'rxjs';
import exp from 'constants';
import { BadRequestException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('CreateUserProvider', () => {
  let provider: CreateUserProvider;
  let usersRepository: MockRepository;
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    password: 'password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        {
          provide: MailService,
          useValue: { sendUserWelcome: jest.fn(() => Promise.resolve()) },
        },
        {
          provide: HashingProvider,
          useValue: {
            hashPassword: jest.fn(() => user.password),
          },
        },
      ],
    }).compile();

    provider = module.get<CreateUserProvider>(CreateUserProvider);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createUser', () => {
    describe('when the user does not exist in the database', () => {
      it('should create a new user', async () => {
        usersRepository.findOne.mockResolvedValue(null);
        usersRepository.create.mockReturnValue(user);
        usersRepository.save.mockResolvedValue(user);
        const newUser = await provider.createUser(user);

        expect(usersRepository.findOne).toHaveBeenCalledWith({
          where: { email: user.email },
        });
        expect(usersRepository.create).toHaveBeenCalledWith(user);
        expect(usersRepository.save).toHaveBeenCalledWith(user);
      });
    });

    describe('when the user exists in the database', () => {
      it('should BadRequestException', async () => {
        usersRepository.findOne.mockResolvedValue(user.email);
        usersRepository.create.mockReturnValue(null);
        usersRepository.save.mockResolvedValue(null);

        try {
          const newUser = await provider.createUser(user);

          expect(usersRepository.findOne).toHaveBeenCalledWith(user.email);
          expect(usersRepository.create).toHaveBeenCalledTimes(0);
          expect(usersRepository.save).toHaveBeenCalledTimes(0);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
  });
});
