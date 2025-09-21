import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    const { access_token } = await this.authService.login(user);

    // Return token in response body
    return { message: 'Login successful', access_token };
  }

  @Post('logout')
  async logout() {
    // No cookie to clear, just return message
    return { message: 'Logout successful' };
  }
}
