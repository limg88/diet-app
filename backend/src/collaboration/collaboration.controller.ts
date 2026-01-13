import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CollaborationService } from './collaboration.service';

type RequestUser = {
  id: string;
  email: string;
};

@UseGuards(JwtAuthGuard)
@Controller('collaboration')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post('invites')
  createInvite(@CurrentUser() user: RequestUser, @Body() dto: CreateInviteDto) {
    return this.collaborationService.createInvite(user.id, dto);
  }

  @Get('invites')
  listInvites(@CurrentUser() user: RequestUser) {
    return this.collaborationService.listInvites(user.id);
  }

  @Post('invites/:id/accept')
  acceptInvite(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.collaborationService.acceptInvite(user.id, id);
  }

  @Post('invites/:id/reject')
  rejectInvite(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.collaborationService.rejectInvite(user.id, id);
  }

  @Delete('invites/:id')
  revokeInvite(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.collaborationService.revokeInvite(user.id, id);
  }

  @Get('partners')
  listPartners(@CurrentUser() user: RequestUser) {
    return this.collaborationService.listPartners(user.id);
  }
}
