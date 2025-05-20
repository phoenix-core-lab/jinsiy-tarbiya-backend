import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiBody, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('Authentications')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'Rediska Kolobokova' },
        phoneNumber: { type: 'string', example: '+998331234567' },
        password: { type: 'string', example: 'password' },
      },
    },
  })
  @Post('register')
  async registerUser(
    @Body()
    body: CreateAuthDto,
  ) {
    return this.authService.createUser(body);
  }

  @ApiOperation({ summary: 'Login user and get token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  async login(@Body() body: { phoneNumber: string; password: string }) {
    return this.authService.login(body.phoneNumber, body.password);
  }
  @ApiOperation({ summary: 'Send code to phone number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string' },
      },
    },
  })
  @Post('send-phone-code')
  async sendPhoneCode(@Body() body: { phoneNumber: string }) {
    return this.authService.sendPhoneCode(body.phoneNumber);
  }
  @ApiOperation({ summary: 'Verify phone number with code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string' },
        code: { type: 'string' },
      },
    },
  })
  @Post('verify-phone-code')
  async verifyPhoneCode(@Body() body: { phoneNumber: string; code: string }) {
    return this.authService.verifyPhoneCode(body.phoneNumber, body.code);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string' },
        newPassword: { type: 'string' },
        code: { type: 'string' },
      },
    },
  })
  @Post('change-password')
  async changePassword(
    @Body() body: { phoneNumber: string; newPassword: string; code: string },
  ) {
    return this.authService.changePassword(
      body.phoneNumber,
      body.newPassword,
      body.code,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @Get('profile')
  profile(@Request() req: any) {
    return this.authService.getProfile(req.userId);
  }
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        email: { type: 'string' },
        gender: { type: 'string' },
        city: { type: 'string' },
        birthday: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Patch('update')
  update(@Body() body: UpdateAuthDto, @Request() req: any) {
    return this.authService.update(body, req.userId);
  }

  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get paid courses or moduls or lessons' })
  // @Get('paid')
  // getPaid(@Request() req: any) {
  //   return this.authService.getPaid(req.userId);
  // }
}
