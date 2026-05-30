'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createClient, getUserId } from '@/lib/supabase/client';
import type { Account, AccountWithBalance, Debt, SavingsGoal, Transaction } from '@/lib/types';

const ACCOUNTS_KEY = ['accounts'];
const TX_KEY = ['transactions'];
const DEBTS_KEY = ['debts'];
const SAVINGS_KEY = ['savings'];

// ── Queries ──────────────────────────────────────────────
export function useTransactions() {
  return useQuery({
    queryKey: TX_KEY,
    queryFn: async (): Promise<Transaction[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('occurred_on', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

function useRawAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async (): Promise<Account[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .is('archived_at', null)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Account[];
    },
  });
}

export function useAccounts() {
  const accQ = useRawAccounts();
  const txQ = useTransactions();

  // Memoised on the raw query data so the derived array keeps a stable identity
  // between renders (otherwise every consumer + their useMemos re-fire).
  const { accounts, total } = useMemo(() => {
    const delta = new Map<string, number>();
    for (const t of txQ.data ?? []) {
      delta.set(t.account_id, (delta.get(t.account_id) ?? 0) + (t.kind === 'income' ? t.amount : -t.amount));
    }
    const accounts: AccountWithBalance[] = (accQ.data ?? []).map((a) => ({
      ...a,
      balance: a.initial_balance + (delta.get(a.id) ?? 0),
    }));
    return { accounts, total: accounts.reduce((s, a) => s + a.balance, 0) };
  }, [accQ.data, txQ.data]);

  // Combined loading so balances don't flash 0 → real while transactions load.
  return { ...accQ, data: accounts, total, isLoading: accQ.isLoading || txQ.isLoading };
}

export function useDebts() {
  return useQuery({
    queryKey: DEBTS_KEY,
    queryFn: async (): Promise<Debt[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Debt[];
    },
  });
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: SAVINGS_KEY,
    queryFn: async (): Promise<SavingsGoal[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SavingsGoal[];
    },
  });
}

// ── Mutations ────────────────────────────────────────────
export function useFinanceMutations() {
  const qc = useQueryClient();
  const supabase = createClient();

  const inv = (...keys: string[][]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));

  // Accounts
  const addAccount = useMutation({
    mutationFn: async (input: { name: string; currency: string; initial_balance: number; color: string }) => {
      const { error } = await supabase.from('accounts').insert({ user_id: await getUserId(), ...input, name: input.name.trim() });
      if (error) throw error;
    },
    onSuccess: () => inv(ACCOUNTS_KEY),
  });
  const updateAccount = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Account> }) => {
      const { error } = await supabase.from('accounts').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(ACCOUNTS_KEY, TX_KEY),
  });
  const removeAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(ACCOUNTS_KEY, TX_KEY),
  });

  // Transactions
  const addTransaction = useMutation({
    mutationFn: async (input: {
      account_id: string; kind: 'income' | 'expense'; amount: number;
      category?: string | null; note?: string | null; occurred_on: string;
    }) => {
      const { error } = await supabase.from('transactions').insert({ user_id: await getUserId(), ...input });
      if (error) throw error;
    },
    onSuccess: () => inv(TX_KEY, ACCOUNTS_KEY),
  });
  const updateTransaction = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Transaction> }) => {
      const { error } = await supabase.from('transactions').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(TX_KEY, ACCOUNTS_KEY),
  });
  const removeTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(TX_KEY, ACCOUNTS_KEY),
  });

  // Debts
  const addDebt = useMutation({
    mutationFn: async (input: {
      direction: 'owed_to_me' | 'i_owe'; counterparty: string; amount: number;
      note?: string | null; due_date?: string | null;
    }) => {
      const { error } = await supabase.from('debts').insert({ user_id: await getUserId(), ...input, counterparty: input.counterparty.trim() });
      if (error) throw error;
    },
    onSuccess: () => inv(DEBTS_KEY),
  });
  const updateDebt = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Debt> }) => {
      const { error } = await supabase.from('debts').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(DEBTS_KEY),
  });
  const removeDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(DEBTS_KEY),
  });

  // Savings goals
  const addSaving = useMutation({
    mutationFn: async (input: {
      title: string; target_amount: number; saved_amount: number;
      deadline?: string | null; account_id?: string | null;
    }) => {
      const { error } = await supabase.from('savings_goals').insert({ user_id: await getUserId(), ...input, title: input.title.trim() });
      if (error) throw error;
    },
    onSuccess: () => inv(SAVINGS_KEY),
  });
  const updateSaving = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SavingsGoal> }) => {
      const { error } = await supabase.from('savings_goals').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(SAVINGS_KEY),
  });
  const removeSaving = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv(SAVINGS_KEY),
  });

  return {
    addAccount, updateAccount, removeAccount,
    addTransaction, updateTransaction, removeTransaction,
    addDebt, updateDebt, removeDebt,
    addSaving, updateSaving, removeSaving,
  };
}
