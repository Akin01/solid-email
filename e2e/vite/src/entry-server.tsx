import { render } from '@solid-email/render';
import { AllComponentsEmail } from './all-components-email';

export async function renderEmail(): Promise<string> {
  return render(() => <AllComponentsEmail />);
}

console.log(await renderEmail());
