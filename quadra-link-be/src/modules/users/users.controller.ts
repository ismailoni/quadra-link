import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔒 Display all users - Admin only
  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // 🆕 Create a new user (open endpoint)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 🔒 Find user by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 🔒 Delete user by ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 🔒 Update user details (but NOT school/email)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.USER)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  
  // 🔒 Update user details - Admin only
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  adminUpdate(@Param('id') id: string, @Body() adminUpdateUserDto: AdminUpdateUserDto) {
    return this.usersService.adminUpdate(id, adminUpdateUserDto);
  }

}
