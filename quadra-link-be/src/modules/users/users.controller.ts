import {
  Controller,
  Get,
  Req,
  Request,
  Param,
  Delete,
  UseGuards,
  Post,
  Body,
  Patch,
  UnauthorizedException,
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const userId = req.user?.sub; // Use 'sub' from JWT payload
    if (!userId) throw new UnauthorizedException('No user');
    const user = await this.usersService.findOne(userId); // Fetch full user from DB
    if (!user) throw new UnauthorizedException('Invalid token');
    return user; // Return full user info
  }


  // 🔒 Display all users - Admin only
  @UseGuards(JwtAuthGuard)
  @Get()
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
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 🔒 Delete user by ID
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new UnauthorizedException('User not found');
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }

  // 🔒 Update user details (but NOT school/email)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  // @Roles(UserRole.USER)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 🔒 Update user details - Admin only
  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  @Roles(UserRole.ADMIN)
  adminUpdate(@Param('id') id: string, @Body() adminUpdateUserDto: AdminUpdateUserDto) {
    return this.usersService.adminUpdate(id, adminUpdateUserDto);
  }
}
