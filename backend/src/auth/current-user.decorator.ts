import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestUser = {
  id: string;
  email: string;
};

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
