import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint({ cwd: process.cwd() });

async function lintSource(fileName: string, source: string) {
  const [result] = await eslint.lintText(source, {
    filePath: fileName,
  });

  if (result === undefined) {
    throw new Error(`ESLint did not return a result for ${fileName}.`);
  }

  return result;
}

describe('API architecture boundary', () => {
  it('permite que a interface importe o domínio', async () => {
    const result = await lintSource(
      'src/interface/http/allowed-import.ts',
      "import '../../domain/scaffold-message';\n",
    );

    expect(result.errorCount).toBe(0);
  });

  it('impede que o domínio importe a interface', async () => {
    const result = await lintSource(
      'src/domain/forbidden-import.ts',
      "import '../interface/http/app.controller';\n",
    );

    const output = result.messages.map((message) => message.message).join('\n');

    expect(result.errorCount).toBe(1);
    expect(output).toContain('The domain layer must not import the interface layer.');
  });
});
