export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: Cannot ${context.operation} at ${context.path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }

  toDetailedString(): string {
    let details = `
      Operation: ${this.context.operation.toUpperCase()}
      Path: ${this.context.path}
    `;
    if (this.context.requestResourceData) {
      details += `
      Request Data: ${JSON.stringify(this.context.requestResourceData, null, 2)}
      `;
    }
    return details;
  }
}
