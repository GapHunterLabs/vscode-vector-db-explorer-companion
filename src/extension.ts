import * as vscode from 'vscode';
import { parseCollectionsList, parseCollectionDetail, CollectionDetail, QdrantResponseError } from './qdrantClient';

const SECRET_KEY = 'vectorDbExplorerCompanion.qdrantApiKey';

class CollectionNode extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly detail?: CollectionDetail,
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    if (detail) {
      this.description = `${detail.pointsCount ?? '?'} points, dim ${detail.vectorSize ?? '?'}, ${detail.distance ?? '?'}`;
    }
  }
}

class QdrantExplorerProvider implements vscode.TreeDataProvider<CollectionNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private nodes: CollectionNode[] = [];
  private errorMessage: string | null = null;

  setNodes(nodes: CollectionNode[]): void {
    this.nodes = nodes;
    this.errorMessage = null;
    this._onDidChangeTreeData.fire();
  }

  setError(message: string): void {
    this.errorMessage = message;
    this.nodes = [];
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CollectionNode): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<CollectionNode[]> {
    if (this.errorMessage) {
      return [new CollectionNode(this.errorMessage)];
    }
    return this.nodes;
  }
}

async function qdrantFetch(baseUrl: string, path: string, apiKey: string | undefined): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (apiKey) headers['api-key'] = apiKey;
  const response = await fetch(new URL(path, baseUrl), { headers });
  if (!response.ok) {
    throw new QdrantResponseError(`HTTP ${response.status} from ${path}`);
  }
  return response.json();
}

async function refresh(context: vscode.ExtensionContext, provider: QdrantExplorerProvider): Promise<void> {
  const config = vscode.workspace.getConfiguration('vectorDbExplorerCompanion');
  const baseUrl = config.get<string>('qdrantUrl', '');
  if (!baseUrl) {
    provider.setError('Set "vectorDbExplorerCompanion.qdrantUrl" in Settings, then run "Vector Database Explorer: Refresh".');
    return;
  }
  const apiKey = await context.secrets.get(SECRET_KEY);

  try {
    const listJson = await qdrantFetch(baseUrl, '/collections', apiKey);
    const collections = parseCollectionsList(listJson);

    const nodes = await Promise.all(
      collections.map(async (collection) => {
        try {
          const detailJson = await qdrantFetch(baseUrl, `/collections/${encodeURIComponent(collection.name)}`, apiKey);
          return new CollectionNode(collection.name, parseCollectionDetail(detailJson));
        } catch {
          return new CollectionNode(collection.name);
        }
      }),
    );
    provider.setNodes(nodes);
  } catch (error) {
    const message = error instanceof QdrantResponseError ? error.message : String(error);
    provider.setError(`Couldn't reach Qdrant: ${message}`);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new QdrantExplorerProvider();
  const treeView = vscode.window.createTreeView('vectorDbExplorerCompanion.collections', { treeDataProvider: provider });
  context.subscriptions.push(treeView);

  context.subscriptions.push(
    vscode.commands.registerCommand('vectorDbExplorerCompanion.refresh', () => void refresh(context, provider)),
    vscode.commands.registerCommand('vectorDbExplorerCompanion.setApiKey', async () => {
      const key = await vscode.window.showInputBox({ prompt: 'Qdrant API key (leave empty for an unsecured local instance)', password: true });
      if (key !== undefined) {
        await context.secrets.store(SECRET_KEY, key);
        void vscode.window.showInformationMessage('Vector Database Explorer Companion: API key saved.');
      }
    }),
  );

  void refresh(context, provider);
}

export function deactivate(): void {
  // no resources to release beyond what's registered in subscriptions
}
