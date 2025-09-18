import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /////////////////////////////
  //////// CREATE USER ////////
  /////////////////////////////

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;

    // hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // map DTO fields → entity fields
    const user = this.usersRepository.create({
      ...rest, // other user fields
      passwordHash, // hashed password
    });

    return this.usersRepository.save(user);
  }

  ///////////////////////////////
  //////// DISPLAY USERS ////////
  ///////////////////////////////

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }


  /////////////////////////////////
  //////// FIND USER BY ID ////////
  /////////////////////////////////

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }


  /////////////////////////////////
  //////// FIND USER BY EMAIL //////
  /////////////////////////////////

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }


  /////////////////////////////////
  //////// UPDATE USER ////////////
  /////////////////////////////////

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent updating email or school
    if ('email' in updateUserDto || 'school' in updateUserDto) {
      throw new Error('Email and school cannot be updated');
    }

    // Hash password if updating
    let updatedData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      const saltRounds = 10;
      updatedData.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updatedData.password;
    }

    await this.usersRepository.update(id, updatedData);

    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found after update.`);
    }

    return updatedUser;
  }


  /////////////////////////////////
  //////// DELETE USER ////////////
  /////////////////////////////////

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  /////////////////////////////////
  //////// UPDATE USER DETAILS(ADMIN) ///////
  /////////////////////////////////
  async adminUpdate(id: string, adminUpdateUserDto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent updating immutable fields (e.g., id)
    if ('id' in adminUpdateUserDto) {
      throw new Error('User ID cannot be updated');
    }

    // Optionally, restrict other fields as needed (e.g., createdAt)
    if ('createdAt' in adminUpdateUserDto) {
      throw new Error('createdAt cannot be updated');
    }

    const { password, ...rest } = adminUpdateUserDto;
    let updatedData: any = { ...rest };

    if (password) {
      const saltRounds = 10;
      updatedData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await this.usersRepository.update(id, updatedData);
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found after update.`);
    }
    return updatedUser;
  }
}
