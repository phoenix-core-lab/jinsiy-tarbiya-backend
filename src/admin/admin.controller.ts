import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiBody({
    description: 'Login with admin name and password',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  @ApiOperation({ summary: 'Login with admin name and password' })
  login(@Body() body: { name: string; password: string }) {
    return this.adminService.login(body.name, body.password);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of students' })
  @Get('students-count')
  async getUser() {
    return await this.adminService.getStudentCount();
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students with optional pagination' })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to return',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @Get('show-all-users')
  findAll(@Query('take') take?: number, @Query('skip') skip?: number) {
    // Если take или skip не переданы — передаем null или undefined
    return this.adminService.findAll(+take, +skip);
  }
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('filter')
  @ApiOperation({ summary: 'Filter users by fullName and phoneNumber' })
  @ApiResponse({ status: 200, description: 'List of users matching filters' })
  @ApiQuery({
    name: 'fullName',
    required: false,
    type: String,
    description: 'Full name filter',
  })
  @ApiQuery({
    name: 'phoneNumber',
    required: false,
    type: String,
    description: 'Phone number filter',
  })
  async filter(
    @Query('fullName') fullName?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    return this.adminService.filter(fullName || '', phoneNumber || '');
  }
}
