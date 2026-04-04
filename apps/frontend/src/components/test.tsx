'use client';

import { createUserAction } from '@/actions/user';

export default function Test() {
  return (
    <div>
      <button
        onClick={async () => {
          const res = await createUserAction({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password',
            nickname: 'john.doe',
          });
          console.log(res);
        }}
      >
        Create User
      </button>
    </div>
  );
}
