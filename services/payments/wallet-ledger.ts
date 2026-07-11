import type { WalletAccount, WalletTransaction } from "@/types/domain/wallet";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const WALLETS_FILE = "wallets.json";

function createTransaction(
  input: Omit<WalletTransaction, "id" | "date">,
): WalletTransaction {
  return {
    ...input,
    id: `wtx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
  };
}

async function getWallets(): Promise<WalletAccount[]> {
  return loadCollection<WalletAccount>(WALLETS_FILE);
}

async function saveWallets(wallets: WalletAccount[]): Promise<void> {
  await saveCollection(WALLETS_FILE, wallets);
}

export async function getWalletAccount(userId: string): Promise<WalletAccount> {
  const wallets = await getWallets();
  const existing = wallets.find((wallet) => wallet.userId === userId);
  if (existing) return existing;

  const created: WalletAccount = {
    userId,
    availableBalance: 0,
    pendingBalance: 0,
    heldInEscrow: 0,
    currency: "AED",
    transactions: [],
  };
  wallets.push(created);
  await saveWallets(wallets);
  return created;
}

export async function addWalletTransaction(
  userId: string,
  transaction: Omit<WalletTransaction, "id" | "date" | "userId">,
): Promise<WalletAccount> {
  const wallets = await getWallets();
  let account = wallets.find((wallet) => wallet.userId === userId);
  if (!account) {
    account = {
      userId,
      availableBalance: 0,
      pendingBalance: 0,
      heldInEscrow: 0,
      currency: "AED",
      transactions: [],
    };
    wallets.push(account);
  }

  const entry = createTransaction({ ...transaction, userId });
  account.transactions.unshift(entry);

  switch (transaction.type) {
    case "escrow_hold":
      account.pendingBalance += transaction.amount;
      account.heldInEscrow += transaction.amount;
      break;
    case "escrow_release":
      account.pendingBalance = Math.max(0, account.pendingBalance - transaction.amount);
      account.heldInEscrow = Math.max(0, account.heldInEscrow - transaction.amount);
      account.availableBalance += transaction.amount;
      break;
    case "refund":
      account.pendingBalance = Math.max(0, account.pendingBalance - Math.abs(transaction.amount));
      account.heldInEscrow = Math.max(0, account.heldInEscrow - Math.abs(transaction.amount));
      break;
    case "deposit":
    case "stripe_payment":
      account.availableBalance += transaction.amount;
      break;
    case "withdrawal":
    case "platform_fee":
      account.availableBalance += transaction.amount;
      break;
    default:
      break;
  }

  await saveWallets(wallets);
  return account;
}

export async function getAllWalletAccounts(): Promise<WalletAccount[]> {
  return getWallets();
}
