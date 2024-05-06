import { useSubmission } from '@solidjs/router';
import { Button, Form, Icon, Popover, Text, TextField } from '@nou/ui';

import { loginDev } from '~/server/api/dev-login';

const DevLogin = () => {
  const login = useSubmission(loginDev);
  return (
    <>
      <Button
        variant="ghost"
        popoverTarget="dev-login"
        icon
        label="Developer login"
      >
        <Icon use="carrot" />
      </Button>
      <Popover id="dev-login" class="w-[320px] p-8">
        <Form
          validationErrors={
            'errors' in login.result! ? login.result.errors : undefined
          }
          method="post"
          action={loginDev}
          class="flex flex-col gap-4"
        >
          <Text with="body-xl" class="text-center">
            Dev login
          </Text>
          <TextField name="name" label="Name" />
          <Button type="submit" loading={login.pending}>
            Login
          </Button>
        </Form>
      </Popover>
    </>
  );
};

export default DevLogin;
