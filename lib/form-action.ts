/** Next.js `<form action>` must return void; wrap actions that return a result. */
export function asFormAction(
  action: (formData: FormData) => unknown | Promise<unknown>,
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    await action(formData);
  };
}
