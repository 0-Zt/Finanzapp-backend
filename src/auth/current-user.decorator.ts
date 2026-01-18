import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  fullName?: string;
  accessToken?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext): CurrentUserData | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
