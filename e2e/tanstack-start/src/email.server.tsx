import { render } from '@solid-email/render';
import { AllComponentsEmail } from './all-components-email';

export async function renderFixtureEmail(): Promise<string> {
  return render(() => <AllComponentsEmail />);
}
