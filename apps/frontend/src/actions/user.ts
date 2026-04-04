// oxlint-disable require-await
'use server';

import { createUser } from '@anabolix/db/mutations/user';
import { type ParametersWithoutFirst } from '@anabolix/types/utils';

import executeQuery from '@/db/execute-query';

export const createUserAction = async (
  ...args: ParametersWithoutFirst<typeof createUser>
) => executeQuery(createUser)(...args);
