export interface ScaffoldMessage {
  readonly message: string;
}

export function createScaffoldMessage(): ScaffoldMessage {
  return { message: 'Central Comercial API' };
}
